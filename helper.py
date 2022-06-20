from flask import redirect, session
from functools import wraps


#Ensure login is required
def logged_in(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function
