
//Connect dayjs plugins
const weekday = window.dayjs_plugin_weekday;
const weekOfYear = window.dayjs_plugin_weekOfYear;
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

let days_array = [];
let day_index;
let grid_index; // to be continued value come from month_grid();
//let response = events_grabber();
let response, snatched_events;

//the date that will appear first on page load
export let dateNow = parse_date(dayjs());
document.querySelector('#crrnt-month').innerHTML = dateNow.month;
document.querySelector("#crrnt-year").innerHTML = dateNow.year;
let arrays = grid_arrays(dateNow.year, dateNow.month);


month_grid(arrays);

//outlined date box
for (let x in days_array)
{
    if (days_array[x].date() === dayjs().date())
    {
        day_index = x;
        break;
    }
}
console.log({'date': dayjs(), 'index':day_index});
select_date(day_index);

combined(months.indexOf(dateNow.month), dateNow.year, arrays, day_index);

    //console.log(snatched_events);



//    day_window_events(day_index);
console.log(days_array);

window.addEventListener('DOMContentLoaded', function() {
    //next and previous buttons (current month and year) 
    let month_btns = document.querySelectorAll(".arrow");
    month_btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            
            hide_events();
            let Date = month_year_change(btn);
            let arrays = grid_arrays(Date.year, Date.month);
            month_grid(arrays);
            remove_outline();
            let object = current_events((Date.month-1), Date.year, arrays, snatched_events);
            display_events(object, arrays);        

        });
    });
    //Delete events button
    let delete_btns = document.querySelectorAll('#delete');
    delete_btns.forEach(function(btn) {
        delet_eventlistener(btn);
    });
    //Update
    /*let edit_btns = document.querySelectorAll('#edit');
    edit_btns.forEach(function(btn) {
        update_eventlistener(btn);
    })
    //description hide/show button
    /*let btns = document.querySelectorAll('.des-btn');
    btns.forEach(function(btn) {
        des_eventlistener(btn);
    });*/

    //Search
    let btn = document.querySelector('#search-btn');
    btn.addEventListener('click', async function(btn) {
        btn.preventDefault();
        let events = await search();
        console.log(events);
        let search_window = document.querySelector('.search2');
        search_window.innerHTML = '';
        display_searched(events);
    });

});

//on mouse click select date box
let days = document.querySelectorAll('.day');
days.forEach(function(day, i) {
    day.addEventListener('click', function() {
        remove_outline();
        //outline box
        select_date(i);
        day_window_events(i);
        day_index = i;
    });
});
function remove_outline() {
    //remove outline from box
    let crrnt = days[day_index];
    crrnt.style.border = '0.25px solid #c9c9c9';
    if(crrnt.getAttribute('data-day') === "0")
    {
        crrnt.style.borderRight = 'none';
    }
    else if (crrnt.getAttribute('data-day') === "1")
    {
        crrnt.style.borderLeft = 'none';
    }
    if (day_index > 27) {
        crrnt.style.borderBottom = 'none';
    }
}
//functions for addEventListener
function des_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let des = btn.nextElementSibling;
        let computed = window.getComputedStyle(des);
        if (computed.getPropertyValue('display') != 'none')
            des.style.display = 'none';
        else
            des.style.display = 'block';
    });
}
function delet_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let id = btn.parentElement.parentElement.getAttribute('data-id');
        let index = btn.parentElement.parentElement.getAttribute('data-grid-index'); day_window_events(index);
        //ajax post
        let data = {"id": id};
        fetch('/change', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data) })
        .then(res => res.json())
        .then(async res => {
            if (res === 'True') {delet_eventlistener
                snatched_events = await events_grabber();
                let day = document.querySelectorAll('.day')[index].children;
                for (let x of day) {
                    if (x.getAttribute('data-id') === id) {
                        x.remove();
                        break;
                    }
                }
                day_window_events(index);
                return console.log('Deleted');
                }
                return console.log('Error!');

        });
    });
}
//event edit button
function update_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let card_flex = btn.parentElement;
        let card = card_flex.parentElement;
        let update = document.createElement('form');
        let input1 = document.createElement('input');
        let input2 = document.createElement('input');
        let input3 = document.createElement('textarea');
        let input4 = document.createElement('input');
        let cancel = document.createElement('button');
        let save = document.createElement('button');
        //form
        update.className = 'update'
        //title
        input1.value = `    ${card.querySelector('.event-title').innerHTML}`;
        input1.name = 'title';
        input1.className = 'title-u';
        //time
        input2.type = 'time';
        input2.value = card.getAttribute('data-time');
        input2.name = 'time';
        input2.className = 'time-u';
        //description
        input3.value = `  ${card.querySelector('.description').innerHTML}`;
        input3.name = 'description';
        input3.className = 'des-u';
        //date
        input4.type = 'date';
        console.log(card.getAttribute('data-d'));
        input4.value = `${card.getAttribute('data-d')}`;
        input4.name = 'date';
        input4.className = 'date-u';
        //buttons
        cancel.innerHTML = 'cancel';
        cancel.className = 'button-u cancel-u';
        cancel.type = 'button';
        cancel_eventlistener(cancel);
        save.innerHTML = 'save';
        save.className = 'button-u save-u';
        save.type = 'button';
        save_eventlistener(save);
        update.append(input1, input2, input3, input4, save, cancel);
        let children = card.children;
        for (let x of children) {
            x.style.display = 'none';
        }
        card.append(update);
    });
}
function cancel_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let form = btn.parentElement;
        let card = form.parentElement;
        console.log(form);
        form.remove();
        for (let x of card.children) {
            x.style.display = 'block';
        }
    });
}
//updating an event
function save_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let form = btn.parentElement;
        let card = form.parentElement;
        let id = card.getAttribute('data-id');
        let event_id = document.createElement('input');
        event_id.name = 'id';
        event_id.value = id;
        form.append(event_id);
        //handle if date is empty
        if (form.children[3].value === '') {
            let event = [];
            for (let i in snatched_events) {
                if (snatched_events[`${i}`][0] === parseInt(id)) {
                    event = snatched_events[`${i}`];
                }
            }
            if (event[5] < 10) {
                if (event[4] < 10) {
                    form.children[3].value = `${event[6]}-0${event[5]}-0${event[4]}`;                
                }
                else {
                    form.children[3].value = `${event[6]}-0${event[5]}-${event[4]}`;
                }
            }
            else {
                if (event[4] < 10) {
                    form.children[3].value = `${event[6]}-${event[5]}-0${event[4]}`;                
                }
                else {
                    form.children[3].value = `${event[6]}-${event[5]}-${event[4]}`;
                }
            }
            console.log(form.children[3].value);
        }
        console.log(form);
        let data = new FormData(form);
        let date = data.get('date').split('-');
        console.log(data.get("date"));
        fetch('http://127.0.0.1:5000/update', {
            method: 'POST',
            body: data
        })
        .then(response => response.json())
        .then(async () => {
            snatched_events = await events_grabber();
            hide_events();
            let m = document.querySelector('#crrnt-month');
            let month = months.indexOf(m.innerHTML);
            let y = document.querySelector('#crrnt-year');
            let year = parseInt(y.innerHTML);
            let arrays = grid_arrays(year, (month+1));
            let object = current_events(month, year, arrays, snatched_events);
            display_events(object, arrays);
        })
        .then(() => {
            for (let x in days_array)
            {
                if (days_array[x].date() === parseInt(date[2])  && days_array[x].month() === parseInt(date[1]) -1)
                {
                    var ind = x;
                    break;
                }
            }
            day_window_events(ind);
            //remove outline from the date box
            remove_outline();
            day_index = ind;
            //select and outline current box 
            select_date(ind);

        });
        form.remove();
        for (let x of card.children) {
            x.style.display = 'block';
        }
    });
}
//display days in the html grid
function month_grid(arrays)
{
    //join arrays
    days_array = arrays.previous_days.concat(arrays.current_days, arrays.next_days);
    //display the month in html
    let days = document.querySelectorAll('.day');
    for (let i =0; i < days.length; i++)
    {
        days[i].setAttribute('data-date', days_array[i].get('date'));
        days[i].setAttribute('data-month', days_array[i].get('month'));
        days[i].setAttribute('data-year', days_array[i].get('year'));
        days[i].setAttribute('data-day', days_array[i].get('day'));
        days[i].children[0].innerHTML =  `${days_array[i].get('date')}`;
    }
}
//calculate the days in html grid
function grid_arrays(year, month)
{
    let day_js = dayjs(`${year}-${month}`);
    let first = day_js.date(1).weekday();
    let days_of_month = day_js.daysInMonth();
    let last = day_js.date(days_of_month).weekday();
    let previous_days = [];
    let current_days = [];
    let next_days = [];
    
    //special case
    if (first === 0) {
        first = 7;
    }
    //previous month days
    for (let i =0; i < (first-1); i++)
        previous_days[i] = day_js.date(-(first -2-i));
    //current month days
    for (let i =0; i < days_of_month; i++)
        current_days[i] = day_js.date(i+1);
    //next month days
    for (let i =0; i <=(7 -last); i++)
        next_days[i] = day_js.date(days_of_month +1+i);
    //return object of arrays
    return { previous_days: previous_days,
        current_days: current_days,
        next_days: next_days};
}


function month_year_change(btn)
{
    let month = document.querySelector('#crrnt-month');
    let year = document.querySelector("#crrnt-year");
    let index = months.indexOf(month.innerHTML);
    //previous button
    if (btn.id === "btn-p")
    {
        if (index - 1 >= 0) {
            month.innerHTML = months[index - 1];
            index = index - 1;
        }
        else {
            month.innerHTML = months[11];
            year.innerHTML = parseInt(year.innerHTML) - 1;
            index = 11;
        }
    }
    //next button
    else if (btn.id === "btn-n")
    {
        if (index + 1 <= 11) {
            month.innerHTML = months[index + 1];
            index = index + 1;
        }
        else {
            month.innerHTML = months[0];
            year.innerHTML = parseInt(year.innerHTML) + 1;
            index =  0;
        }
    }
    return { year: parseInt(year.innerHTML), month: (index + 1)};
}


function select_date(index)
{
    //outlining date box
    let box = document.querySelectorAll('.day')[index];
    box.style.border = '5px solid purple';
    //change visible date on the Events section
    let date = parse_date(days_array[index]);
    document.querySelector('.date').children[0].innerHTML = `${date.day}, ${date.month} ${date.monthDate}`;
    document.querySelector('#date').innerHTML = `${date.day}, ${date.month} ${date.monthDate}`;
    document.querySelector('#input-date').value = `${date.year}-${(date.m > 9) ? date.m : `0${date.m}`}-${(date.monthDate > 9) ? date.monthDate : `0${date.monthDate}`}`;
}

function day_window_events(index)
{
    let window = document.querySelector('.day-window');
    //remove existing events from day-window
    while (window.firstChild) {
        window.lastChild.remove();
    } 
    let box = document.querySelectorAll('.day')[index].children;
    for (let i = 1; i < box.length; i++)
    {
        //html creation
        let event = document.createElement('div');
        event.className = `card ${box[i].getAttribute('data-type')}`;
        //event id
        event.setAttribute("data-id", box[i].getAttribute('data-id'));
        //day index in the grid
        event.setAttribute('data-grid-index', index);
        //date and time
        event.setAttribute('data-time', box[i].getAttribute('data-time'));
        let st = `${box[i].parentElement.getAttribute('data-month')}`;
        if (st.length === 1) {
            st = `0${st}`;
        }
        console.log(st);
        let st2 = `${box[i].parentElement.getAttribute('data-date')}`;
        if (st2.length === 1) {
            st2 = `0${st2}`;
        }
        console.log(st2);
        event.setAttribute('data-d', `${box[i].parentElement.getAttribute('data-year')}-${st}-${st2}`);
        
        //title
        let title = document.createElement('p');
        title.className = 'event-title';
        title.innerHTML = box[i].getAttribute('data-title');
        //time
        let time = document.createElement('p');
        time.className = 'time';
        if (box[i].getAttribute('data-time')) {
            time.innerHTML = `time : ${box[i].getAttribute('data-time')}`;
        }
        //des button
        let des_btn = document.createElement('button');
        des_btn.className = 'des-btn';
        des_btn.innerHTML = 'description';
        des_eventlistener(des_btn);
        //des
        let des = document.createElement('p');
        des.className = 'description';
        des.innerHTML = box[i].getAttribute('data-des');
        //edit and delete buttons
        let edit = document.createElement('button');
        edit.className = 'button';
        edit.id = 'edit'
        edit.innerHTML = '<svg class="edit-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m16.474 5.408l2.118 2.117m-.756-3.982L12.109 9.27a2.118 2.118 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621Z"/><path d="M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3"/></g></svg>';
        update_eventlistener(edit);
        let delet = document.createElement('button');
        delet.className = 'button';
        delet.id = 'delete';
        delet.innerHTML = '<svg class="delet-svg" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 28 28"><path fill="currentColor" d="M11.5 6h5a2.5 2.5 0 0 0-5 0ZM10 6a4 4 0 0 1 8 0h6.25a.75.75 0 0 1 0 1.5h-1.31l-1.217 14.603A4.25 4.25 0 0 1 17.488 26h-6.976a4.25 4.25 0 0 1-4.235-3.897L5.06 7.5H3.75a.75.75 0 0 1 0-1.5H10Zm2.5 5.75a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0v-8.5Zm3.75-.75a.75.75 0 0 0-.75.75v8.5a.75.75 0 0 0 1.5 0v-8.5a.75.75 0 0 0-.75-.75Z"/></svg>';
        delet_eventlistener(delet);
        let flex_btns = document.createElement('div');
        flex_btns.className = 'flex-r card-btns';
        flex_btns.append(edit, delet);
        //html append
        event.append(title, time, des_btn, des, flex_btns);
        window.append(event);
        //window.innerHTML = event.outerHTML;
        //let des_button = document.querySelector('.des_btn');
        //des_eventlistener(des_btn);
    }
}
//helper function
function parse_date(date)
{
    let index = date.get('month');
    let month = months[index];
    let day = week_days[date.get('day')];
    let monthDate = date.get('date');
    let year = date.get('year');
    return {year, month, monthDate, day, "m": (index+1)};
}



//AJAX get request
export async function events_grabber()
{
    let response = await fetch('http://127.0.01:5000/events')
    response = await response.json()
    console.log(response);
    return response;
    
}

//add an event (AJAX post request)
let form_btn = document.querySelector('#save-btn');
form_btn.addEventListener('click', function(btn) {
    btn.preventDefault();

    let form = document.querySelector('.custom-ev');
    let data = new FormData(form);
    let date = data.get('date').split('-');
    console.log(date);
    //working
    console.log(data.get("date"));        

    fetch('http://127.0.0.1:5000/events', {
        method: 'POST',
        body: data
        })
        .then(response => {return response.json()})
        .then(data => {
            for(let x in data)
                console.log(data[x])
            })
        .then(async () => {
            snatched_events = await events_grabber();
            hide_events();
            //let Date = month_year_change(btn);
            let m = document.querySelector('#crrnt-month');
            let month = months.indexOf(m.innerHTML);
            let y = document.querySelector('#crrnt-year');
            let year = parseInt(y.innerHTML);
            let arrays = grid_arrays(year, (month+1));
            let object = current_events(month, year, arrays, snatched_events);
            display_events(object, arrays);
        })
        .then(() => {
            for (let x in days_array)
            {
                if (days_array[x].date() === parseInt(date[2])  && days_array[x].month() === parseInt(date[1]) -1)
                {
                    var ind = x;
                    break;
                }
            }
            day_window_events(ind);
        });
    element_display('._1', 'none');
    element_display('._2', 'none');
    element_display('.custom-ev', 'none');
    element_display('.add-text', 'block');
    //element_display('#day-window', 'block');
    element_display('.line2', 'block');
    element_display('.date', 'block');
    element_display('.day-window', 'block');
    //setTimeout(day_window_events(ind), 0); //there is a bug in this function
});
function element_display(clss, value)
{
    let element = document.querySelector(clss);
    element.style.display = value;
}

//Events search
async function search()
{
    let form = document.querySelector('.search');
    let data = new FormData(form);
    let res = await fetch('http://127.0.0.1:5000/search', {
        method: 'POST',
        body: data    
    });
    let response = await res.json();
    return response;
}
//Display searched events
function display_searched(events)
{
    let parent = document.querySelector('.search2');
    for (let x in events) {
        let card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-title', events[x][1]);
        card.setAttribute('data-date', `${events[x][2]}-${events[x][3]}-${events[x][4]}`);
        card.setAttribute('data-type', 'special');
        let title = document.createElement('p');
        title.className = 'event-title';
        title.innerHTML = events[x][1]
        let date = document.createElement('p');
        date.className = 'time';
        date.innerHTML = `${events[x][5]}, ${months[events[x][3] - 1]} ${events[x][4]}`
        let year = document.createElement('p');
        year.innerHTML = `${events[x][2]}`;
        let button = document.createElement('button');
        button.innerHTML = 'schedule';
        schedule_eventlistener(button);
        card.append(title, date, year, button);
        parent.append(card);
    }
}
//button eventlistener
function schedule_eventlistener(btn)
{
    btn.addEventListener('click', function() {
        let card = btn.parentElement;
        console.log(card);
        let title = card.getAttribute('data-title');
        let date = card.getAttribute('data-date');
        let type = card.getAttribute('data-type');
        
        let data = new FormData();
        data.append('title', title);
        data.append('date', date);
        data.append('type', type);
        data.append('description', 'special occasion');
        data.append('time', '');
        console.log(data.get("date"));
        fetch('http://127.0.0.1:5000/events', {
            method: 'POST',
            body: data
        })
        .then(response => response.json())
        .then(async () => {
            snatched_events = await events_grabber();
            hide_events();
            let m = document.querySelector('#crrnt-month');
            let month = months.indexOf(m.innerHTML);
            let y = document.querySelector('#crrnt-year');
            let year = parseInt(y.innerHTML);
            let arrays = grid_arrays(year, (month+1));
            let object = current_events(month, year, arrays, snatched_events);
            display_events(object, arrays);
        })
        .then(() => {
            let d = date.split('-');
            for (let x in days_array)
            {
                if (days_array[x].date() === parseInt(d[2])  && days_array[x].month() === parseInt(d[1]) -1)
                {
                    var ind = x;
                    break;
                }
            }
            if(ind) {
                remove_outline();
                select_date(ind);
                day_window_events(ind);
                day_index = ind;
            }
                document.querySelector('.search2').innerHTML = '';
                document.querySelector('.search').reset();        
        });
        element_display('._1', 'none');
        element_display('._2', 'none');
        element_display('.search', 'none');
        element_display('.search2', 'none');
        element_display('.add-text', 'block');
        element_display('.line2', 'block');
        element_display('.date', 'block');
        element_display('.day-window', 'block');
    });
}




function current_events(month, year, arrays, object)
{
    console.log(month);
    console.log(year);
    let previous = []; let current = []; let next = [];
    //taking first and last month cases in consideration
    let pmonth, pyear, nyear, nmonth;
    if (month === 0) {
        pyear = year -1; pmonth = 12;
    }
    else {
        pyear = year; pmonth = month;
    }
    if (month === 11) {
        nyear = year +1; nmonth = 1;
    }
    else {
        nmonth = month +2; nyear = year;
    }
    for (let x in object)
    {
        //current
        if (object[x][6] === year && object[x][5] === month + 1) {
            current.push(object[x]);
        }
        //previous
        if (object[x][6] === pyear && object[x][5] === pmonth) {
            for(let i =0; i < arrays.previous_days.length; i++) {
                if (object[x][4] === arrays.previous_days[i].get('date')) {
                    previous.push(object[x]);
                }
            }
        }
        //next
        if (object[x][6] === nyear && object[x][5] === nmonth) {
            for(let i =0; i < arrays.next_days.length; i++) {
                if (object[x][4] === arrays.next_days[i].get('date')) {
                    next.push(object[x]);
                }
            }
        }
    }
    for (let i of previous) {
        console.log(i);
    }
    for (let i in current) {
        console.log(current[i]);
    }
    for (let i of next) {
        console.log(i);
    }
    return {previous: previous, current: current, next: next}
}

async function combined(month, year, arrays, index)
{
    snatched_events = await events_grabber();
    let object = current_events(month, year, arrays, snatched_events);
    display_events( object, arrays);
    day_window_events(index);
    console.log(snatched_events);
}


function display_events(events, arrays)
{
    let days = document.querySelectorAll('.day');
    /*let displayed = document.querySelectorAll('.e');  failed */
    if (events.previous) {
        for (let x of events.previous) {
            /*if (displayed.find(event => event.getAttribute('data-id') === `${x[0]}`)) {
                continue;
            }   failed attempt to make it animation friendly         */
            //html creation
            let event = document.createElement('div');
            event.className = 'e';
            //adding info to html
            event.setAttribute('data-id', x[0]);
            event.setAttribute('data-title', x[1]);
            event.setAttribute('data-type', x[2]);
            event.setAttribute('data-des', x[3]);
            event.setAttribute('data-time', x[7]);
            event.setAttribute('data-userid', x[8]);
            //finding index
            let i = 0;let index = 1000;//1000 to avoid continuing the loop when 0
            while (index === 1000) {
                if (x[4] === arrays.previous_days[i].get('date'))
                    index = i;
                i++;
            }
            //html append
            days[index].appendChild(event);
        }
        console.log(arrays);
    }
    if (events.current) {
        for (let x of events.current) {
            //html creation
            let event = document.createElement('div');
            event.className = 'e';
            //adding info to html
            event.setAttribute('data-id', x[0]);
            event.setAttribute('data-title', x[1]);
            event.setAttribute('data-type', x[2]);
            event.setAttribute('data-des', x[3]);
            event.setAttribute('data-date', x[4]);
            event.setAttribute('data-time', x[7]);
            event.setAttribute('data-userid', x[8]);
            //finding index
            let index = (x[4] - 1) + arrays.previous_days.length;
            //html append
            days[index].appendChild(event);
        }
    }
    console.log(events.next);
    if (events.next) {
        for (let x of events.next) {
            //html creation
            let event = document.createElement('div');
            event.className = 'e';
            //adding info to html
            event.setAttribute('data-id', x[0]);
            event.setAttribute('data-title', x[1]);
            event.setAttribute('data-type', x[2]);
            event.setAttribute('data-des', x[3]);
            event.setAttribute('data-time', x[7]);
            event.setAttribute('data-userid', x[8]);
            //finding index
            let index = x[4] + (arrays.previous_days.length -1) + arrays.current_days.length;
            //html append
            if (index < days.length)
                days[index].appendChild(event);
        }
    }
}


function hide_events()
{
    document.querySelectorAll('.e').forEach(div => {div.remove()});
}
