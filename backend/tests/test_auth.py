from auth import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password_returns_different_from_plain():
    hashed = hash_password("mysecret")
    assert hashed != "mysecret"
    assert len(hashed) > 20


def test_verify_password_correct():
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("mysecret")
    assert verify_password("wrongpass", hashed) is False


def test_create_and_decode_token():
    token = create_access_token(user_id=42)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "42"


def test_decode_invalid_token():
    payload = decode_access_token("invalid.token.here")
    assert payload is None
