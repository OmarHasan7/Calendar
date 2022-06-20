import { dateNow } from './calendar.js'



//add button
let add_btn = document.querySelector('.box');
add_btn.addEventListener('click', () => {
    let form = document.querySelector('.task-form');
    form.style.display = 'block';
});


display_tasks();
execute();
async function execute()
{
    let done = await done_tasks();
    done_count(done.week_count, done.month_count, done.all);
}

window.addEventListener('DOMContentLoaded', function() {
    let select = document.querySelector('.sort-list');
    select.addEventListener('change', function() {
        let value = document.querySelector('.sort-list').value;
        if (value === 'priority') {
            priority_sort();
        }
        else {
            display_tasks();
        }
    });
    // note: passing the element to an eventlistener function is a pain in the a**
    let btns = document.querySelectorAll('#done-btn');
    btns[0].addEventListener('click',async () => {
        console.log(btns[0].parentElement);
        if (btns[0].parentElement.children.length < 2) {
            let done = await done_tasks();
            done_btns(done.in_week, 'w');
        }
        else {
            btns[0].nextElementSibling.remove();
        }
    });
    btns[1].addEventListener('click',async () => {
        console.log(btns[1].parentElement);
        if (btns[1].parentElement.children.length < 2) {
            let done = await done_tasks();
            done_btns(done.in_month, 'm');
        }
        else {
            btns[1].nextElementSibling.remove();
        }
    });
});



async function display_tasks()
{
    let user_tasks = await get_tasks();
    date_sort(user_tasks);
}
//get the tasks
export async function get_tasks()
{
    let response = await fetch('http://127.0.0.1:5000/tasks', {method: 'GET'});
    let tasks = await response.json();
    console.log(tasks);
    return tasks
}


function switch_x(x)
{
    let segment;
    switch(x) {
        case 0:
            segment = 'Today';
            return segment;
        case 1:
            segment = 'Yesterday';
            return segment;
        }
    switch(true) {
        case (x > 1 && x < 7):
            segment =  `${x} Days ago`;
            break;
        case (x > 6 && x < 14):
            segment = 'A week ago';
            break;
            case (x > 13 && x < 30):
            segment = `${Math.floor(x / 7)} weeks ago`;
            break;        
        case (x > 29 && x < 60):
            segment = '1 month ago';
            break;
        case (x > 59):
            segment = `${Math.floor(x/30)} months ago`;
    }
    return segment;
}

function date_sort(tasks)
{
    /*let sorted = [];
    let arr0 = [], arr1 = [], arr2 = [], arr3 = [], arr4 = [], arr5 = [], arr6 = [], arr7 = [], arr8 = [], arr9 = [];
    */
    console.log(tasks);
    let dif = dayjs().diff(tasks[(tasks.length -1)][5], 'day');
    console.log(dif);
    //remove tasks if found before sorting
    let list = document.querySelector('.list');
    while (list.firstChild)
    {
        list.firstChild.remove();
    }
    //sort
    while(tasks.length !== 0)
    {
        let counter = 0;
        let i;
        let array = [];

        let div = document.createElement('div');
        div.id = 'seg';
        let segment = document.createElement('div');
        segment.className = 'segment';
        let head = document.createElement('h3');
        head.className = 'task-day';
        head.innerHTML = switch_x(dif);
        let line = document.createElement('div');
        line.className = "h-line";
        segment.append(head, line);
        array.push(segment);
        for (i =tasks.length -1; i >= 0; i--)
        {
            if (switch_x(dayjs().diff(tasks[i][5], 'day')) === switch_x(dif)) {
                let task = document.createElement('div');
                task.className = 'task flex-r';
                task.id = 't';
                task.setAttribute('data-id', tasks[i][0]);
                task.setAttribute('data-date', tasks[i][5]);
                task.setAttribute('data-time', tasks[i][4]);
                task.setAttribute('data-user', tasks[i][3]);
                task.setAttribute('data-title', tasks[i][1]);
                task.setAttribute('data-pri', tasks[i][2]);
                let priority = document.createElement('div');
                priority.className = `priority ${tasks[i][2]}`;
                priority.innerHTML = `${tasks[i][2]}`;
                let title = document.createElement('div');
                title.className = 'task-title';
                title.innerHTML = `${tasks[i][1]}`;
                let check = document.createElement('div');
                check.className = 'check';
                //check button click event
                let data = new FormData();
                data.append('id', tasks[i][0]);
                data.append('title', tasks[i][1]);
                data.append('process', 'check');
                let time = dayjs().get('hour') *60 *60 + dayjs().get('minute') * 60 + dayjs().get('second');
                data
                data.append('time', time)
                data.append('date', `${dateNow['year']}-${months.indexOf(dateNow['month']) +1}-${dateNow['monthDate']}`);            
                check.addEventListener('click', async function() {
                    let res = await fetch('http://127.0.0.1:5000/task', {
                        method: 'POST',
                        body: data,
                    });
                    let response = await res.json();
                    console.log(response);
                    check.style.background = '#555';
                    console.log(check.parentElement.querySelector('.task-title'));
                    let task = check.parentElement;
                    let div = task.parentElement;
                    task.querySelector('.task-title').style.textDecoration = 'line-through';
                    setTimeout(() => {
                        task.remove();
                        //segment removal if needed
                        if (div.children.length === 1) {
                            div.children[0].remove();
                        }            
                    }, 1000);
                    execute();
                });
                task.append(priority, title, check);
                array.push(task);

                tasks.splice(i, 1);
                counter++;
            }
            else {
                if (counter > 0) {
                    for (let x in array) {
                        if (x !== '0') {
                        //adding delete button
                        array[x].addEventListener('click', function() {
                            let btn = document.createElement('div');
                            btn.className = 'task-delete';
                            btn.innerHTML = 'DELETE';
                            btn.setAttribute('data-id', array[x].getAttribute('data-id'));
                            btn.setAttribute('data-title', array[x].getAttribute('data-title'))
                            delete_eventlistener(btn);
                            //task
                            array[x].classList.add('clicked');
                            array[x].append(btn);
                            //hide delete button
                            setTimeout(() =>{btn.remove();array[x].classList.remove('clicked')}, 3000);
                        });
                        }
                        div.append(array[x]);
                    }
                    list.append(div);
                }
                break;
            }
        }
        if (i === -1 ) {
            if (counter > 0) {
                for (let x in array) {
                    list.append(array[x]);
                }
            }
        }
        dif++;
    }

}
//event listener for task deletion
function delete_eventlistener(button)
{
    button.addEventListener('click', async function() {
        let data = new FormData();
        data.append('id', button.getAttribute('data-id'));
        data.append('title', button.getAttribute('data-title'));
        data.append('process', 'delete');
        let post = await fetch('http://127.0.0.1:5000/task', {
            method: 'POST',
            body: data
        });
        let res = await post.json();
        console.log(res);
        let task = button.parentElement;
        let div = task.parentElement;
        task.remove();
        //segment removal if needed
        if (div.children.length === 1) {
            div.children[0].remove();
        }
    });
}
function priority_sort()
{
    let tasks = document.querySelectorAll('#t');
    let list = document.querySelector('.list');
    //let form = document.querySelector('.task-form');
    let high = [];let med = [];let low = [];
    console.log(tasks);
    for (let x =0; x < tasks.length; x++)
    {

        if (tasks[x].getAttribute('data-pri') === 'high') {
            high.push(tasks[x]);
        }
        if (tasks[x].getAttribute('data-pri') === 'med') {
            med.push(tasks[x]);
        }
        if (tasks[x].getAttribute('data-pri') === 'low') {
            low.push(tasks[x]);
        }
    }
    let len = list.children.length;
    for (let x= 0; x < len; x++)
    {
        list.firstChild.remove();
    }
    for (let x in high)
    {
        list.append(high[x]);
    }
    for (let x in med)
    {
        list.append(med[x]);
    }
    for (let x in low)
    {
        list.append(low[x]);
    }
    /*/delete existing elements (children)
    let segs = document.querySelectorAll('.segment');
    for (let x=0; x < segs.length; x++) {
        segs[x].remove();
    }*/
}
//  ***Achieved***
async function done_tasks()
{
    let weekly = dayjs().day(0).format('YYYY-MM-DD');
    console.log(weekly);
    let current = dayjs().format('YYYY-MM-DD');
    let data = new FormData();
    data.append('weekly', weekly);
    data.append('current', current);
    data.append('process', 'done');
    let post = await fetch('http://127.0.0.1:5000/task', { method: 'POST', body: data});
    let res = await post.json();
    let week_count = res.weekly.length;
    console.log(res.all);
    let month_count = res.monthly.length;
    return {
        'week_count': week_count,
        'month_count':month_count,
        'in_week': res.weekly,
        'in_month': res.monthly,
        'all': res.all
    };
}

function done_count(week, month, all)
{
    let c = document.querySelectorAll('#count');
    c[0].innerHTML = week;
    c[1].innerHTML = month;
    //achivement
    let jewelry = document.querySelector('.jewelry');
    let diamond = jewelry.querySelector('#diamond');
    diamond.innerHTML = `${Math.floor(all / 10000)}`;
    let remaining = all % 10000;
    let ruby = jewelry.querySelector('#ruby');
    ruby.innerHTML = `${Math.floor(remaining / 1000)}`;
    remaining = remaining % 1000;
    let gold = jewelry.querySelector('#gold');
    gold.innerHTML = `${Math.floor(remaining / 100)}`;
    remaining = remaining % 100;
    let silver = jewelry.querySelector('#silver');
    silver.innerHTML = `${Math.floor(remaining / 10)}`;
}

async function done_btns(done, id)
{
    let tasks = await done;
    /*let date = `${tasks[(tasks.length -1)][5]}-${tasks[(tasks.length -1)][6]}-${tasks[(tasks.length -1)][7]}`;
    let dif = dayjs().diff(date, 'day');*/
    let div = document.querySelector(`#${id}`);
    let checked = document.createElement('div');
    checked.className = 'checked'; 
    /*while(tasks.length !== 0)
    {
        let counter = 0;
        let i;
        let array = [];
        let div = document.createElement('div');
        let segment = document.createElement('h4');
        segment.className = 'checked-day';
        segment.innerHTML = `${switch_x(dif)}`;
        console.log(segment.innerHTML);
        array.push(segment);*/
        for (let i =tasks.length -1; i >= 0; i--)
        {
            /*let d = `${tasks[i][5]}-${tasks[i][6]}-${tasks[i][7]}`;
            if (dayjs().diff(d, 'day') === dif) {*/
            let d = `${tasks[i][5]}-${tasks[i][6]}-${tasks[i][7]}`;
                let task = document.createElement('div');
                task.className = 'checked-task';
                task.innerHTML = `${tasks[i][1]}  ${d}`;
                checked.append(task);
            /*}
            else {
                if (counter > 0) {
                    for (let x in array) {
                        div.append(array[x]);
                    }
                    checked.append(div);
                }
                break;
            }*/
        }
        /*if (i === -1 ) {
            if (counter > 0) {
                for (let x in array) {
                    div.append(array[x]);
                }
                checked.append(div);
            }
        }*/
        div.append(checked);
        /*dif++;
    }*/

}

//add task
let btn = document.querySelector('.submit-task');
btn.addEventListener('click', async function(btn) {
    btn.preventDefault();
    let form = document.querySelector('.task-form');
    let data = new FormData(form);
    let time = dayjs().get('hour') *60 *60 + dayjs().get('minute') * 60 + dayjs().get('second');
    data
    data.append('time', time);
    data.append('date', `${dateNow['year']}-${months.indexOf(dateNow['month']) +1}-${dateNow['monthDate']}`);
    let res = await fetch('http://127.0.0.1:5000/tasks', {
        method: 'POST',
        body: data });
    let response = await res.json();
    console.log(response);
    display_tasks();
    //reset form
    form.reset(); //not working ?!
    form.style.display = 'none';

});
    
//create the added task html
function create_html_task(response)
{
    let task = document.createElement('div');
    task.className = 'task flex-r';
    task.setAttribute('data-date', response[0][5]);
    task.setAttribute('data-time', response[0][4]);
    task.setAttribute('data-user', response[0][3]);
    task.setAttribute('data-title', response[0][1]);
    task.setAttribute('data-pri', response[0][2]);
    let priority = document.createElement('div');
    priority.className = `priority ${response[0][2]}`;
    priority.innerHTML = `${response[0][2]}`;
    let title = document.createElement('div');
    title.className = 'task-title';
    title.innerHTML = `${response[0][1]}`;
    let check = document.createElement('div');
    check.className = 'check';
    task.append(priority, title, check);
}
