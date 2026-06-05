# backend/tests/test_tasks.py
import pytest


@pytest.fixture
def sample_task(client, auth_header):
    """Create a task and return it."""
    resp = client.post("/api/tasks", json={
        "title": "测试任务",
        "status": "todo",
        "priority": "high",
    }, headers=auth_header)
    return resp.json()


def test_create_task(client, auth_header):
    resp = client.post("/api/tasks", json={
        "title": "新任务",
        "status": "todo",
    }, headers=auth_header)
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "新任务"
    assert data["status"] == "todo"
    assert data["priority"] == "medium"
    assert data["created_by"] is not None


def test_create_task_no_auth(client):
    resp = client.post("/api/tasks", json={"title": "新任务"})
    assert resp.status_code == 401


def test_get_tasks(client, auth_header, sample_task):
    resp = client.get("/api/tasks", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["title"] == "测试任务"


def test_get_tasks_no_auth(client):
    resp = client.get("/api/tasks")
    assert resp.status_code == 401


def test_update_task(client, auth_header, sample_task):
    task_id = sample_task["id"]
    resp = client.put(f"/api/tasks/{task_id}", json={
        "status": "in_progress",
        "priority": "low",
    }, headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "in_progress"
    assert data["priority"] == "low"
    assert data["title"] == "测试任务"


def test_update_task_not_found(client, auth_header):
    resp = client.put("/api/tasks/9999", json={
        "title": "不存在",
    }, headers=auth_header)
    assert resp.status_code == 404


def test_delete_task(client, auth_header, sample_task):
    task_id = sample_task["id"]
    resp = client.delete(f"/api/tasks/{task_id}", headers=auth_header)
    assert resp.status_code == 200

    # Verify deleted
    resp2 = client.get("/api/tasks", headers=auth_header)
    tasks = resp2.json()
    assert all(t["id"] != task_id for t in tasks)


def test_delete_task_not_found(client, auth_header):
    resp = client.delete("/api/tasks/9999", headers=auth_header)
    assert resp.status_code == 404


def test_task_with_assignee(client, auth_header, registered_user, sample_task):
    task_id = sample_task["id"]
    user_id = registered_user["id"]
    resp = client.put(f"/api/tasks/{task_id}", json={
        "assignee_id": user_id,
    }, headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["assignee_id"] == user_id
    assert data["assignee_name"] == "测试用户"
