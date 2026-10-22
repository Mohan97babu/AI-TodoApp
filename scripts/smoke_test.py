#!/usr/bin/env python3
"""Production-stack smoke test using the standard library only.

Targets a disposable CI environment. Creates temporary users and tasks.
Never point this at a production database.
"""
import json
import os
import urllib.error
import urllib.request
import uuid

BASE_URL = os.environ.get("PLANIFY_SMOKE_BASE_URL", "http://127.0.0.1:5174")
tag = uuid.uuid4().hex[:12]


def request(method, path, payload=None, token=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(BASE_URL + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            body = response.read()
            return response.status, json.loads(body.decode("utf-8")) if body else None
    except urllib.error.HTTPError as err:
        raw = err.read()
        try:
            response_body = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            response_body = None
        return err.code, response_body


def expect(actual, expected, label):
    if actual != expected:
        raise AssertionError(f"{label}: expected {expected}, received {actual}")
    print(f"PASS {label}")


def create_user(name):
    status, body = request("POST", "/api/auth/register", {
        "username": name,
        "email": name + "@example.invalid",
        "password": "ci-smoke-pass-12345",
        "fullName": "Smoke Test"
    })
    expect(status, 201, "register user")
    assert body and isinstance(body.get("token"), str) and body["token"]
    return body["token"]


def main():
    alpha = "ci_alpha_" + tag
    beta = "ci_beta_" + tag
    first_token = create_user(alpha)
    second_token = create_user(beta)

    status, signed_in = request("POST", "/api/auth/login", {
        "usernameOrEmail": alpha,
        "password": "ci-smoke-pass-12345"
    })
    expect(status, 200, "login")
    assert signed_in and signed_in.get("token")

    status, task = request("POST", "/api/tasks", {
        "title": "CI smoke task",
        "priority": "MEDIUM",
        "category": "WORK"
    }, first_token)
    expect(status, 201, "create task")
    task_id = task["id"]

    status, tasks = request("GET", "/api/tasks", token=first_token)
    expect(status, 200, "list own tasks")
    assert any(t.get("id") == task_id for t in tasks), "created task not returned"

    status, other_tasks = request("GET", "/api/tasks", token=second_token)
    expect(status, 200, "list other user tasks")
    assert not any(t.get("id") == task_id for t in other_tasks), "cross-user list disclosure"

    status, _ = request("GET", "/api/tasks/" + str(task_id), token=second_token)
    expect(status, 404, "deny reading another user's task")

    status, updated = request("PATCH", "/api/tasks/" + str(task_id) + "/status", {
        "status": "COMPLETED"
    }, first_token)
    expect(status, 200, "complete own task")
    assert updated["status"] == "COMPLETED"

    status, _ = request("DELETE", "/api/tasks/" + str(task_id), token=first_token)
    expect(status, 204, "delete own task")

    status, _ = request("GET", "/api/tasks/" + str(task_id), token=first_token)
    expect(status, 404, "deleted task is not accessible")

    status, ai_response = request("POST", "/api/ai/chat", {
        "message": "Explain what a unit test is",
        "history": [],
        "sourcesEnabled": {
            "geeksforgeeks": False,
            "w3schools": False,
            "tpointtech": False
        }
    }, first_token)
    expect(status, 200, "authenticated chatbot proxy")
    assert ai_response and ai_response.get("reply") == "CI simulated Qwen response", (
        "Spring Boot did not connect to the CI model server: " + str(ai_response)
    )
    print("PASS OpenAI-compatible model routing through Spring Boot (CI simulator only)")

    print("PASS authenticated task lifecycle and tenant isolation")


if __name__ == "__main__":
    main()
