import csv
import sqlite3


con = sqlite3.connect("calendar.db")
db = con.cursor()
user = db.execute("SELECT * FROM user WHERE id = 1")
with open("holidays-2023-us.csv", "r") as File:
    reader = csv.reader(File)
    next(reader)
    for row in reader:
        holiday = db.execute("SELECT id FROM holiday WHERE name = ? AND month = ? AND day = ?", (row[1], row[3], row[4]))
        if len(holiday.fetchall()) == 0:
            db.execute("INSERT INTO holiday (name, year, month, day, weekday) VALUES (?, ?, ?, ?, ?)", (row[1].lower(), row[2], row[3], row[4], row[5]))
    con.commit()
    for row in reader:
        inserted = db.execute("SELECT * FROM holiday WHERE name = ?", (row[1],))
        print(inserted.fetchall()[0])

# done!
