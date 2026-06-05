# backend/tests/test_users.py


def test_register_success(client):
    resp = client.post("/api/register", json={
        "username": "newuser",
        "password": "pass123",
        "display_name": "新用户",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "newuser"
    assert data["display_name"] == "新用户"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_username(client, registered_user):
    resp = client.post("/api/register", json={
        "username": "testuser",
        "password": "other123",
        "display_name": "另一个",
    })
    assert resp.status_code == 400
    assert "已存在" in resp.json()["detail"]


def test_login_success(client, registered_user):
    resp = client.post("/api/login", json={
        "username": "testuser",
        "password": "testpass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    resp = client.post("/api/login", json={
        "username": "testuser",
        "password": "wrongpass",
    })
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/login", json={
        "username": "nobody",
        "password": "pass123",
    })
    assert resp.status_code == 401


def test_get_me(client, auth_header):
    resp = client.get("/api/me", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "testuser"
    assert data["display_name"] == "测试用户"


def test_get_me_no_token(client):
    resp = client.get("/api/me")
    assert resp.status_code == 401


def test_get_users(client, auth_header, registered_user):
    resp = client.get("/api/users", headers=auth_header)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["display_name"] == "测试用户"
