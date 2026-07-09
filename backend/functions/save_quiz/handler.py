import json
import os
import re
import uuid
from datetime import datetime, timezone

_FP_RE = re.compile(r'^[A-Za-z0-9_\-]{8,128}$')

import boto3
from boto3.dynamodb.conditions import Attr  # noqa: F401

TABLE_NAME = os.environ["HISTORY_TABLE"]
SUBSCRIPTIONS_TABLE = os.environ.get("SUBSCRIPTIONS_TABLE", "")

# Partition key for global device fingerprint records (same as generate_question)
_FP_USER = "TRIAL_DEVICE"
_IP_USER = "TRIAL_IP"

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)
_sub_table = dynamodb.Table(SUBSCRIPTIONS_TABLE) if SUBSCRIPTIONS_TABLE else None


def _user_id(event: dict) -> str:
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


def _source_ip(event: dict) -> str:
    try:
        return event["requestContext"]["http"]["sourceIp"]
    except (KeyError, TypeError):
        return "unknown"


def _cors(body: dict, status: int = 200) -> dict:
    return {
        "statusCode": status,
        "headers": {
        "Access-Control-Allow-Origin": os.environ.get("FRONTEND_URL", "*"),
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    },
        "body": json.dumps(body),
    }


def _is_premium(user_id: str) -> bool:
    if not _sub_table:
        return False
    try:
        sub_resp = _sub_table.get_item(Key={"userId": user_id, "sortKey": "SUBSCRIPTION"})
        sub = sub_resp.get("Item") or {}
        now_ts = datetime.now(timezone.utc).timestamp()
        return (
            sub.get("status") == "active"
            and int(sub.get("currentPeriodEnd", 0)) > now_ts
        )
    except Exception:
        return False


def _mark_trial_used(user_id: str, fingerprint: str | None, source_ip: str) -> None:
    """
    Marks the trial as consumed for this account and registers the device fingerprint
    and IP for cross-account abuse detection.
    """
    if not _sub_table:
        return
    try:
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. Mark trial as used for this user account
        _sub_table.put_item(Item={
            "userId": user_id,
            "sortKey": "TRIAL#USED",
            "usedAt": now_iso,
            "fingerprint": fingerprint or "",
            "ip": source_ip,
        })

        # 2. Register device fingerprint globally (blocks same device on new accounts)
        if fingerprint:
            _sub_table.put_item(Item={
                "userId": _FP_USER,
                "sortKey": f"FP#{fingerprint}",
                "trialUsedByAccount": user_id,
                "usedAt": now_iso,
                "ip": source_ip,
            })

        # 3. Increment IP counter for monitoring (soft signal — no hard block)
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        ip_key = source_ip.replace(":", "_")  # sanitise IPv6 colons for sort key
        _sub_table.update_item(
            Key={"userId": _IP_USER, "sortKey": f"IP#{today}#{ip_key}"},
            UpdateExpression="ADD #c :one SET #u = if_not_exists(#u, :now)",
            ExpressionAttributeNames={"#c": "count", "#u": "firstSeen"},
            ExpressionAttributeValues={":one": 1, ":now": now_iso},
        )

        print(
            f"[trial-mark] USED account={user_id} "
            f"fp={str(fingerprint)[:12] if fingerprint else 'none'}… ip={source_ip}"
        )
    except Exception as exc:
        # Non-fatal: don't fail the save if trial marking fails
        print(f"[trial-mark] Non-fatal error: {exc}")


def lambda_handler(event, _context):
    try:
        user_id = _user_id(event)
        source_ip = _source_ip(event)
        body = json.loads(event.get("body") or "{}")

        score = int(body.get("score", 0))
        total = int(body.get("total", 10))
        if not (0 <= score <= total <= 100 and total > 0):
            return _cors({"error": "Invalid score or total"}, 400)
        difficulty = str(body.get("difficulty", ""))
        answers = body.get("answers", [])
        if not isinstance(answers, list) or len(answers) > 100:
            return _cors({"error": "Invalid answers"}, 400)
        raw_fp = body.get("fingerprint") or ""
        fingerprint: str | None = raw_fp if (isinstance(raw_fp, str) and _FP_RE.match(raw_fp)) else None

        # Aggregate per-domain stats
        domains: dict[str, dict] = {}
        for a in answers:
            d = a.get("domain", "unknown")
            if d not in domains:
                domains[d] = {"correct": 0, "total": 0}
            domains[d]["total"] += 1
            if a.get("correct"):
                domains[d]["correct"] += 1

        quiz_id = (
            datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")
            + "_" + str(uuid.uuid4())[:8]
        )

        table.put_item(Item={
            "userId": user_id,
            "quizId": quiz_id,
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "score": score,
            "total": total,
            "pct": round(score / total * 100) if total else 0,
            "difficulty": difficulty,
            "domains": domains,
        })

        # Mark trial as consumed for free users (idempotent put — safe to call twice)
        if not _is_premium(user_id):
            _mark_trial_used(user_id, fingerprint, source_ip)

        return _cors({"saved": True, "quizId": quiz_id})

    except Exception as exc:
        print(f"[save-quiz] Erro: {exc}")
        return _cors({"error": "Internal server error. Please try again."}, 500)
