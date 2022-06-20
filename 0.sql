CREATE TABLE user (
    id INTEGER, username TEXT, hash TEXT, email TEXT, PRIMARY KEY (id));

CREATE TABLE event (
    id INTEGER, title TEXT, type TEXT, description TEXT, daydate INTEGER,
     month INTEGER, year INTEGER, time TIMESTAMP, user_id INTEGER,
      PRIMARY KEY(id), FOREIGN KEY(user_id) REFERENCES user(id));


CREATE TABLE holiday (
    id INTEGER, name TEXT, year INTEGER, month INTEGER, day INTEGER,
        weekday TEXT, PRIMARY KEY(id));


CREATE TABLE active_task (
    id INTEGER, task TEXT, priority TEXT, added INTEGER,
    user_id INTEGER, PRIMARY KEY(id), FOREIGN KEY(user_id) REFERENCES user(id));


CREATE TABLE checked_task (
    id INTEGER, task TEXT, priority TEXT, added INTEGER,
    user_id INTEGER, PRIMARY KEY(id), FOREIGN KEY(user_id) REFERENCES user(id));



      * the logged_in decorator not working sus in functools module not exist *

      //events_grabber(dateNow.month, dateNow.year)
                                  <div class="e"></div>




/*there is a bug in the "done this month" (doubled the done this week for no reason)



15 mar stopped when trying to make event appear immediately after the event added line 410 line 119 line 512

bad code at line 604

examined!{
    1-Weather api error: Failed to establish a new connection: [Errno 101] Network is unreachable'
    2-weather ui for no location access or an error
}

todo in sumurry:
6-lengthy daily quote not shown properly

todo in tasks: 
1-the add button and cancel the form.
3-There could be a bug in done this week because month 1 is not bigger than 12




/*    ****tasks html****
                        <div style="display: none;" id="today" class="segment">
                            <h3 class="task-day">TODAY</h3>
                            <div class="h-line"></div>
                        </div>
                        <div style="display: none;" class="task flex-r">
                            <div class="priority high">High</div>
                            <div class="task-title">Take out the trash</div>
                            <div class="check"></div>
                        </div>
                        <div style="display: none;" class="task clicked flex-r">
                            <div class="priority high">High</div>
                            <div class="task-title">solve the homework and read next lecture</div>
                            <div class="check"></div>
                            <botton class="task-delete">DELETE</botton>
                        </div>
                        <div style="display: none;" class="task flex-r">
                            <div class="priority med">Med</div>
                            <div class="task-title">leave before you love me</div>
                            <div class="check"></div>
                        </div>
                        <div style="display: none;" class="task flex-r">
                            <div class="priority low">Low</div>
                            <div class="task-title">stop my bad habbit that lead to you</div>
                            <div class="check"></div>
                        </div>
                        <div style="display: none;" id="yesterday" class="segment">
                            <h3 class="task-day">YESTERDAY</h3>
                            <div class="h-line"></div>
                        </div>
                        <div style="display: none;" class="task flex-r">
                            <div class="priority low">Low</div>
                            <div class="task-title">stop my bad habbit that lead to you</div>
                            <div class="check"></div>
                        </div>
                        <div style="display: none;" class="task flex-r">
                            <div class="priority low">low</div>
                            <div class="task-title">stop my bad habbit that lead to you</div>
                            <div class="check"></div>
                        </div>

*/