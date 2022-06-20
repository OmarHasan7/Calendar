from flask import Flask, render_template, request, session, redirect, make_response
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3
import json
from helper import logged_in
from collections import defaultdict
from libtad import HolidaysService
from libtad.datatypes.holidays import HolidayType
from datetime import date
import requests
from requests.structures import CaseInsensitiveDict

#Configure application
app = Flask(__name__)

#Configure seesion to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.route("/")
@logged_in
def hey():
    return render_template("index.html")

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
        return "<h2>username already used use another</h2>"


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        con = sqlite3.connect("calendar.db")
        db = con.cursor()
        #check if all info provided
        usrnm = request.form.get("usrnm")
        psswrd = request.form.get("psswrd")
        if not usrnm or not psswrd:
            return "<h2>missing username or password</h2>"
        #check database
        id = db.execute("SELECT id FROM user WHERE username = ?", [usrnm]).fetchall()
        if id:
            hash = db.execute("SELECT hash FROM user WHERE username = ?", [usrnm]).fetchall()[0]
            hash = "".join(hash)
            if check_password_hash(hash, psswrd):
                session['user'] = id
                return redirect("/")
            else:
                return "<h2>wrong password</h2>"
        else:
            return "<h2>account does not exist!!</h2>"
    else:
        return render_template("welcome.html")

@app.route("/logout")
def logout():
    #log user out
    session.clear()
    #redirect
    return render_template("welcome.html")

    
#I need to write a new route for submiting form and maybe retrieving events via javascript
@app.route("/events", methods=["GET", "POST"])
def events():
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    if request.method == "POST":
        data = request.form
        #corner case no parsed list! need a fix!!
        date = data["date"].split("-")
        user = session.get("user")[0]
        db.execute("INSERT INTO event (title, type, description, daydate, month, year, time, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (data["title"], data["type"], data["description"], date[2], date[1], date[0], data["time"], user[0]))
        con.commit()
        event = db.execute("SELECT * FROM event WHERE title = ?", (data["title"],))
        return json.dumps(event.fetchall()[0])
    else:
        user = session.get("user")[0]
        events = db.execute("SELECT * FROM event WHERE user_id = ?", (user[0],))
        dic = {}
        print("\n")
        for x in events.fetchall():
            dic[x[0]] = x
        print(dic)
        print("\n")
        #res = make_response(events.fetchall())
        return  dic

#delete event
@app.route("/change", methods=["POST"])
def change():
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    event = request.json
    user = session.get("user")[0][0]
    ev = db.execute("SELECT id FROM event WHERE id = ? AND user_id = ?", (int(event["id"]), user))
    ev = ev.fetchall()
    if len(ev) != 0:
        db.execute("DELETE FROM event WHERE id = ?", (ev[0][0],))
        con.commit()
        print()
        print(ev[0][0])
        return json.dumps('True')
    return json.dumps('False')

#Updating event
@app.route("/update", methods=["POST"])
def update():
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #handling the request
    data = request.form
    # I should handle when no date provided case!
    date = data["date"].split("-")
    print("\n", date)
    db.execute("UPDATE event SET title = ?, time = ?, description = ?, daydate = ?, month = ?, year = ? WHERE id = ?",(data["title"], data["time"], data["description"], date[2], date[1], date[0], data["id"]))
    con.commit()
    event = db.execute("SELECT * FROM event WHERE id = ?", (data["id"],))
    dic = {}
    dic["updated"] = event.fetchall()[0]
    return dic



#Internet event search
@app.route("/search", methods=["POST"])
def search():
    #database
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #request
    data = request.form
    holidays = db.execute("SELECT * FROM holiday WHERE name LIKE ?", (f"%{data['event'].lower()}%",))
    return json.dumps(holidays.fetchall())



#  Tasks
@app.route("/tasks", methods=["GET", "POST"])
def tasks():
    #database
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #handle post
    if request.method == "POST":
        data = request.form
        print()
        print(session.get("user")[0][0])
        print(data["task"], data["priority"], data['date'], data['time'])
        db.execute("INSERT INTO active_task (task, priority, user_id, time, date) VALUES (?, ?, ?, ?, ?)", (data["task"], data["priority"], session.get("user")[0][0], data["time"], data["date"]))
        task = db.execute("SELECT * FROM active_task WHERE task = ?", (data["task"],))
        con.commit()
        return json.dumps(task.fetchall())
    elif request.method == "GET":
        data = db.execute("SELECT * FROM active_task WHERE user_id = ?", (session.get("user")[0][0],))
        return json.dumps(data.fetchall())

#task-manipulation
@app.route("/task", methods=["POST"])
def task():
    #database
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    #handle request
    if request.method == "POST":
        data = request.form
        if data["process"] == "check":
            sql = db.execute("SELECT * FROM active_task WHERE id = ? AND task = ?",(data["id"], data["title"]))
            task = sql.fetchall()
            if len(task) > 0:
                print(task)
                date = data["date"].split("-")
                db.execute("INSERT INTO checked_task (task, priority, user_id, time, year, month, day) VALUES (?, ?, ?, ?, ?, ?, ?)", (task[0][1], task[0][2], task[0][3], data["time"], date[0], date[1], date[2]))
                db.execute("DELETE FROM active_task WHERE id = ? AND task = ?", (task[0][0], task[0][1]))
                con.commit()
                checked = db.execute("SELECT * FROM checked_task WHERE task = ? AND user_id = ?", (task[0][1], session.get("user")[0][0]))
                return json.dumps(checked.fetchall())
        #delete a task 
        elif data["process"] == "delete":
            task = db.execute("SELECT * FROM active_task WHERE id = ? AND task = ?", (data["id"], data["title"]))
            if len(task.fetchall()) > 0:
                db.execute("DELETE FROM active_task WHERE id = ? AND task = ?", (data["id"], data["title"]))
                con.commit()
                con.close()
                return json.dumps("deleted")
        elif data["process"] == "done":
            weekly = data["weekly"].split("-")
            current = data["current"].split("-")
            w = db.execute("SELECT * FROM checked_task WHERE year >= ? AND month >= ? AND day >= ? AND user_id = ?",(weekly[0], weekly[1], weekly[2], session.get("user")[0][0]))
            week = w.fetchall()
            m = db.execute("SELECT * FROM checked_task WHERE year = ? AND month = ? AND user_id = ?", (current[0], current[1], session.get("user")[0][0]))
            month = m.fetchall()
            all = db.execute("SELECT COUNT(*) FROM checked_task WHERE user_id = ?", (session.get("user")[0][0],)).fetchall()
            dic = {"weekly": week, "monthly": month, "all": all[0][0]}
            return dic
        return json.dumps("alright!!!")
        #"GET" I have to handle dates in python


@app.route("/summary", methods=["GET", "POST"])
def upcoming():
    #database
    con = sqlite3.connect("calendar.db")
    db = con.cursor()
    if request.method == "POST":
        data = request.form
        print()
        print(data["latitude"], data["longitude"])
        url = f"https://api.openweathermap.org/data/2.5/onecall?lat={data['latitude']}&lon={data['longitude']}&exclude={'minutely,hourly,alerts'}&appid={'155e7d861dcc0eaa42e25101cf95277a'}&units=metric"
        response = requests.get(url)
        response = response.json()
        print(response["current"], response["daily"][0])
        url = f"https://eu1.locationiq.com/v1/reverse.php?key=pk.361c0b6e816af1be37813726d20cb149&lat={data['latitude']}&lon={data['longitude']}&format=json&zoom=10"
        resp = requests.get(url)
        print()
        print(resp.status_code, "\n", resp.json())
        con.close()
        if resp.status_code == requests.codes.ok:
            return {"w": {"current": response["current"], "daily": response["daily"][0]}, "location": resp.json()["address"]}
        else:
            return resp.raise_for_status()
    else:
        #get the specific data
        today = str(date.today())
        d = today.split("-")
        print()
        print(d)
        print(session.get("user")[0][0])
        events = db.execute("SELECT * FROM event WHERE year >= ? AND month >= ? AND daydate >= ? AND user_id = ? ORDER BY year, month, daydate", (d[0], d[1], d[2], session.get("user")[0][0])).fetchall()
        events = events + db.execute("SELECT * FROM event WHERE year > ? AND user_id = ? LIMIT 3", (d[0], session.get("user")[0][0])).fetchall()
        con.close()
        return json.dumps(events)
