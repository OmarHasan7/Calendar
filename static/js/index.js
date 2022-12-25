//import { events_grabber } from './calendar.js';


//global
const months = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
const week_days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

window.addEventListener('DOMContentLoaded', function() {
    //add event button
    let add = document.querySelector('.add-btn');
    add.addEventListener('click', function() {
        //changing the button
        document.querySelector('.add-text').style.display = 'none';
        let options = document.querySelectorAll('.option');
        options.forEach(function(option) {
            option.style.display = 'inline-block';
        });
        //hiding line, date
        document.querySelector('.line2').style.display = 'none';
        document.querySelector('.date').style.display = 'none';
        //outline on your event button
        outline_switch('._2', '._1');
        //change the form
        document.querySelector('.day-window').style.display = 'none';
        document.querySelector('.custom-ev').style.display = 'block';
        //change css button class
        let add_section = document.querySelector('.add');
        add_section.classList.add('add-active');
        add.style.marginLeft = '9px';
        let plus = document.querySelector('.plus');
        plus.style.justifyContent = 'default';
    });
    //your own event button
    let cstm = document.querySelector('._1');
    cstm.addEventListener('click', function() {
        //changing the border
        outline_switch('._2', '._1');
        //changing the form
        document.querySelector('.search').style.display = 'none';
        document.querySelector('.search2').style.display = 'none';
        document.querySelector('.custom-ev').style.display = 'block';       
    });
    //search button
    let search = document.querySelector('._2');
    search.addEventListener('click', function() {
        //changing the border
        outline_switch('._1', '._2');
        //changing the form
        let cstm = document.querySelector('.custom-ev');
        cstm.style.display = 'none';
        let search_form = document.querySelector('.search').style.display = 'block';
        document.querySelector('.search2').style.display = 'flex';

    });
    //Calendar button
    let cal_btn = document.querySelector('#cal-btn');
    cal_btn.addEventListener('click', () => {
        element_display('.tasks-list', 'none');
        element_display('.achieved', 'none');
        element_display('.summary', 'none');
        element_display('.cal-wrapper', 'flex');
        element_display('.events', 'block');
        let active = document.querySelector('.m-active-btn');
        active.className = 'm-btn';
        cal_btn.className = 'm-active-btn';
        let main = document.querySelector('#main');
        main.style.width = '896px';
    });
    //tasks button
    let task_btn = document.querySelector('#task-btn');
    task_btn.addEventListener('click', () => {
        element_display('.cal-wrapper', 'none');
        element_display('.events', 'none');
        element_display('.summary', 'none');
        element_display('.tasks-list', 'block');
        element_display('.achieved', 'block');
        let active = document.querySelector('.m-active-btn');
        active.className = 'm-btn';
        task_btn.className = 'm-active-btn';
        let main = document.querySelector('#main');
        main.style.width = '896px';
    });
    //summary button
    let sum_btn = document.querySelector('#summ-btn');
    sum_btn.addEventListener('click', function() {
        element_display('.cal-wrapper', 'none');
        element_display('.events', 'none');
        element_display('.tasks-list', 'none');
        element_display('.achieved', 'none');
        element_display('.summary', 'grid');
        let active = document.querySelector('.m-active-btn');
        active.className = 'm-btn';
        sum_btn.className = 'm-active-btn';
        let main = document.querySelector('#main');
        main.style.width = '1150px';
    })
    // add event-form change date button
    let date_div = document.querySelector('#marked-date');
    date_div.children[1].addEventListener('click', function() {
        element_display('#marked-date', 'none');
        element_display('#input-date', 'inline-block');
    });
    //add event-form add time button
    let add_time = document.querySelector('#add-time');
    add_time.addEventListener('click', function() {
        add_time.style.display = 'none';
        element_display('.form-time', 'inline-block');
        element_display('#time-hl', 'block');
    });
    //add event-form add description button
    let add_des = document.querySelector('#add-des');
    add_des.addEventListener('click', function() {
        add_des.style.display = 'none';
        element_display('.form-des', 'inline-block');
        element_display('#des-hl', 'block');
    });
    // add event-form cancel button
    let cancel_btn = document.querySelector('#cancel-btn');
    cancel_btn.addEventListener('click', function(btn) {
        btn.preventDefault();
        element_display('._1', 'none');
        element_display('._2', 'none');
        element_display('.custom-ev', 'none');
        element_display('.add-text', 'block');
        //element_display('#day-window', 'block');
        element_display('.line2', 'block');
        element_display('.date', 'block');
        element_display('.day-window', 'flex');

        element_display('#marked-date', 'flex');
        element_display('#input-date', 'none');
        element_display('#add-time', 'flex');
        element_display('.form-time', 'none');
        element_display('#time-hl', 'none');
        element_display('#add-des', 'flex');
        element_display('.form-des', 'none');
        element_display('#des-hl', 'none');
        let add = document.querySelector('.add');
        add.className = 'add';
        let plus = document.querySelector('.add-btn');
        plus.style.marginLeft = '25px';
        document.querySelector('.custom-ev').reset();
    });
    //search cancel button
    let cancel_search = document.querySelector('.cancel-btn2');
    cancel_search.addEventListener('click', function(btn) {
        btn.preventDefault();
        element_display('._1', 'none');
        element_display('._2', 'none');
        element_display('.search', 'none');
        element_display('.search2', 'none');
        clear_search();
        element_display('.add-text', 'block');
        element_display('.line2', 'block');
        element_display('.date', 'block');
        element_display('.day-window', 'flex');
        let add = document.querySelector('.add');
        add.classList.remove('add-active');
        let plus = document.querySelector('.add-btn');
        plus.style.marginLeft = '25px';
        document.querySelector('.custom-ev').reset();
    });
    function element_display(clss, value)
    {
        let element = document.querySelector(clss);
        element.style.display = value;
    }
    function outline_switch(selector1, selector2) {
        document.querySelector(selector1).style.border = 'none';
        document.querySelector(selector2).style.border = '3px solid #50EAEA';
    }
    function clear_search() {
        let search_window = document.querySelector('.search2');
        search_window.innerHTML = '';
        document.querySelector('.search').reset();
    }    
});




