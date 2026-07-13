import json
import os

import boto3
from boto3.dynamodb.conditions import Key

HISTORY_TABLE = os.environ["HISTORY_TABLE"]
SUBSCRIPTIONS_TABLE = os.environ["SUBSCRIPTIONS_TABLE"]
USER_POOL_ID = os.environ.get("USER_POOL_ID", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")

_dynamodb = boto3.resource("dynamodb")
_history = _dynamodb.Table(HISTORY_TABLE)
_subscriptions = _dynamodb.Table(SUBSCRIPTIONS_TABLE)
_cognito = boto3.client("cognito-idp")

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": FRONTEND_URL,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
}


def _resp(status: int, body: dict) -> dict:
    return {"statusCode": status, "headers": CORS_HEADERS, "body": json.dumps(body)}


def _delete_all_for_user(table, user_id: str, key_name: str = "userId", sort_name: str | None = None) -> None:
    """Batch-delete all items where partition key = user_id."""
    last_key = None
    while True:
        kwargs: dict = {
            "KeyConditionExpression": Key(key_name).eq(user_id),
        }
        if sort_name:
            kwargs["ProjectionExpression"] = f"{key_name}, {sort_name}"
        if last_key:
            kwargs["ExclusiveStartKey"] = last_key

        resp = table.query(**kwargs)
        items = resp.get("Items", [])
        if items:
            with table.batch_writer() as batch:
                for item in items:
                    key = {k: item[k] for k in item}
                    batch.delete_item(Key=key)

        last_key = resp.get("LastEvaluatedKey")
        if not last_key:
            break


def lambda_handler(event: dict, _context: object) -> dict:
    try:
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        user_id: str = claims["sub"]

        # 1 — Delete quiz history
        _delete_all_for_user(_history, user_id, key_name="userId", sort_name="quizId")

        # 2 — Delete subscription / quota / seen-questions records
        _delete_all_for_user(_subscriptions, user_id, key_name="userId", sort_name="sortKey")

        # 3 — Delete Cognito user
        if USER_POOL_ID:
            _cognito.admin_delete_user(UserPoolId=USER_POOL_ID, Username=user_id)
            print(f"[delete-account] deleted cognito user {user_id[:8]}…")
        else:
            print("[delete-account] USER_POOL_ID not set, skipping Cognito deletion")

        print(f"[delete-account] account fully deleted for {user_id[:8]}…")
        return _resp(200, {"ok": True})

    except Exception as exc:
        print(f"[delete-account] error: {exc}")
        return _resp(500, {"error": "Internal server error."})
