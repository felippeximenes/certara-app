import json
import os
from datetime import datetime, timezone
from decimal import Decimal

import boto3

TABLE_NAME = os.environ["SUBSCRIPTIONS_TABLE"]
TRIAL_DAILY_LIMIT = int(os.environ.get("TRIAL_DAILY_LIMIT", "10"))

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

CORS = {
    "Access-Control-Allow-Origin": os.environ.get("FRONTEND_URL", "*"),
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
}


def _user_id(event: dict) -> str:
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


def _cors(body: dict, status: int = 200) -> dict:
    return {
        "statusCode": status,
        "headers": CORS,
        "body": json.dumps(
            body,
            default=lambda o: int(o) if isinstance(o, Decimal) else str(o),
        ),
    }


def lambda_handler(event: dict, _context: object) -> dict:
    try:
        user_id = _user_id(event)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        sub_resp = table.get_item(Key={"userId": user_id, "sortKey": "SUBSCRIPTION"})
        sub = sub_resp.get("Item", {})

        now_ts = datetime.now(timezone.utc).timestamp()
        is_premium = (
            sub.get("status") == "active"
            and int(sub.get("currentPeriodEnd", 0)) > now_ts
        )

        if is_premium:
            return _cors({
                "plan": "premium",
                "status": sub.get("status"),
                "currentPeriodEnd": sub.get("currentPeriodEnd"),
                "stripeSubscriptionId": sub.get("stripeSubscriptionId"),
                "trialUsed": True,
                "quizzesRemaining": None,
            })

        # Check daily trial usage
        trial_resp = table.get_item(Key={"userId": user_id, "sortKey": "TRIAL#DAILY"})
        trial = trial_resp.get("Item") or {}
        used_today = int(trial.get("count", 0)) if trial.get("date") == today else 0
        remaining = max(0, TRIAL_DAILY_LIMIT - used_today)

        return _cors({
            "plan": "free",
            "trialUsed": remaining == 0,
            "questionsUsedToday": used_today,
            "questionsRemainingToday": remaining,
            "trialLimit": TRIAL_DAILY_LIMIT,
        })

    except Exception as exc:
        print(f"[get-subscription] Error: {exc}")
        return _cors({"error": "Internal server error. Please try again."}, 500)
