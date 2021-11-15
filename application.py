from flask import Flask, render_template, request
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3


app = Flask(__name__)


@app.route("/")
def hey():
    return render_template("welcome.html")

@app.route("/register", methods=["POST"])
def register():
    #database connection
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #check if all info is provided
    usrnm = request.form.get("usrnm")
    eml = request.form.get("eml")
    if not usrnm or not eml:
        return "<h2>missing username or email</h2>"
    psswrd = request.form.get("psswrd")
    psswrd_c = request.form.get("psswrd_c")
    if not psswrd or not psswrd_c:
        return "<h2>missing password or password confirmation</h2>"
    #check if the info is valid then register
    if psswrd != psswrd_c:
        return "<h2>password confirmation does not match the password</h2>"
    exist = db.execute("SELECT id FROM user WHERE username = ?", [usrnm])
    if not exist.fetchall():
        hash = generate_password_hash(psswrd)
        db.execute("INSERT INTO user (username, hash, email) VALUES (?, ?, ?)", (usrnm, hash, eml))
        con.commit()
        con.close()
        return "<h2>registered successfully!</h2>"
    else:
        return "<h2>username already used another</h2>"


@app.route("/login", methods=["POST"])
def login():
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #check if all info provided
    usrnm = request.form.get("usrnm")
    psswrd = request.form.get("psswrd")
    if not usrnm or not psswrd:
        return "<h2>missing username or password</h2>"
    exist = db.execute("SELECT id FROM user WHERE username = ?", [usrnm]).fetchall()
    if exist:
        hash = db.execute("SELECT hash FROM user WHERE username = ?", [usrnm]).fetchall()[0]
        hash = "".join(hash)
        if check_password_hash(hash, psswrd):
            return "<h2>eligible to login</h2>"
        else:
            return "<h2>wrong password</h2>"
    else:
        return "<h2>account does not exist!!</h2>"

    
