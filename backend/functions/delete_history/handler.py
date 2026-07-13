import json
import os

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ["HISTORY_TABLE"]
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)


def _user_id(event: dict) -> str:
    return event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]


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


def lambda_handler(event, _context):
    try:
        user_id = _user_id(event)
        path_params = event.get("pathParameters") or {}
        quiz_id = path_params.get("quizId")

        if quiz_id:
            # Delete a single quiz — validate ownership via the key itself
            table.delete_item(Key={"userId": user_id, "quizId": quiz_id})
        else:
            # Delete all quizzes for this user
            resp = table.query(
                KeyConditionExpression=Key("userId").eq(user_id),
                ProjectionExpression="quizId",
            )
            ids = [item["quizId"] for item in resp.get("Items", [])]
            with table.batch_writer() as batch:
                for qid in ids:
                    batch.delete_item(Key={"userId": user_id, "quizId": qid})

        return _cors({"ok": True})

    except Exception as exc:
        print(f"[delete-history] Erro: {exc}")
        return _cors({"error": "Internal server error."}, 500)
