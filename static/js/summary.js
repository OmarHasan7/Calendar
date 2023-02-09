import { get_tasks } from './tasks.js'
import { dateNow } from './calendar.js'



summary();
tasks();

weather();
quote();


//fetch upcoming events
async function summary()
{
    //fetch
    let fetc = await fetch('http://127.0.0.1:5000/summary');
    let events = await fetc.json();
    console.log(events);
    //html
    let upcoming = document.querySelector('.u-events');
    let x = events.length;
    let counter = x < 3 ? x : 3;
    //display events in html
    for (let i = 0; i < counter; i++) {
        let event = document.createElement('div');
        event.className = `u-event flex-c ${events[i][2]}`;
        console.log(event);
        let title = document.createElement('div');
        title.className = 'u-t';
        title.innerHTML = `${events[i][1]}`;
        event.append(title);
        let time = document.createElement('div');
        time.className = 'u-time';
        if(events[i][7])
        time.innerHTML = `time: ${events[i][7]}`;
        event.append(time);
        let date = document.createElement('u-date');
        date.className = 'u-date';
        date.innerHTML = `${months[events[i][5]-1]}, ${events[i][4]}  ${events[i][6]}`;
        event.append(date);
        upcoming.append(event);
    }
}


//Tasks
async function tasks()
{
    let tasks = await html_tasks();
    let list = document.querySelector('.st-tasks');
    let high = [];let med = [];let low = [];
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
}
async function html_tasks()
{
    let tasks = await get_tasks();
    let array = [];
    for (let t of tasks) {
        let task = document.createElement('div');
        task.className = 'st-task flex-r';
        task.setAttribute('data-id', t[0]);
        task.setAttribute('data-date', t[5]);
        task.setAttribute('data-time', t[4]);
        task.setAttribute('data-user', t[3]);
        task.setAttribute('data-title', t[1]);
        task.setAttribute('data-pri', t[2]);
        let pri = document.createElement('div');
        pri.className = `priority ${t[2]}`;
        pri.innerHTML = `${t[2]}`
        let title = document.createElement('div');
        title.className = 'st-task-title';
        title.innerHTML = `${t[1]}`;
        let check = document.createElement('div');
        check.className = 'st-check';
        //check button click event
        let data = new FormData();
        data.append('id', t[0]);
        data.append('title', t[1]);
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
            check.style.background = '#fee2ab';
        });
        task.append(pri, title, check);
        array.push(task);
    }
    return array;
}

function weather()
{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            let c = position.coords;
            console.log("latitude: " + c.latitude + "  and longitude: " + c.longitude);
            let data = new FormData();
            data.append('latitude', c.latitude);
            data.append('longitude', c.longitude);
            let f = await fetch('http://127.0.0.1:5000/summary', {
                method: 'POST',
                body: data
            });
            if (f.ok) {
                let res = await f.json();
                console.log(res);
                let current = res["w"]["current"];
                let daily = res["w"]["daily"];
                //weather left part
                let w_main = create_html('div', 'w-main');
                let title = create_html('div', 'w-title l-stroke', 'weather');
                let loc = create_html('div','location', `${res['location']['city']}, ${res['location']['country_code'].toUpperCase()}`);
                let current_tmp = create_html('div', 'w-temp', `${Math.round(current['temp'])}°`);
                let description = create_html('div', 'w-description', `${current['weather'][0]['description']}`);
                w_main.append(title, loc, current_tmp, description);
                //weather cards:
                let cards = create_html('div', 'w-cards');
                //1-weather
                let high = create_html('div', 't', 'High');
                let high_n = create_html('div', 't number', `${Math.round(daily['temp']['max'])}°`);
                let low = create_html('div', 't', 'Low');
                let low_n = create_html('div', 't number', `${Math.round(daily['temp']['min'])}°`);
                let card_tmp = create_html('div', 'w-card temp');
                card_tmp.append(high, high_n, low, low_n);
                //2-wind
                let wind = create_html('div', 'word', 'Wind'); 
                let speed = create_html('div', 'number', `${current['wind_speed']} km`);
                let card_wind = create_html('div', 'w-card wind');
                card_wind.append(wind, speed);
                //3-humadity
                let humidity = create_html('div', 'word', 'Humidity');
                let humidity_n = create_html('div', 'number', `${current['humidity']} %`);
                let card_humid = create_html('div', 'w-card humadity');
                card_humid.append(humidity, humidity_n);
                cards.append(card_tmp, card_wind, card_humid);
                let weather = document.querySelector('.weather');
                weather.append(w_main, cards);
                //weather background
                let w_des = current['weather'][0]['description'];
                let key_words = ['clear', 'few clouds', 'scattered', 'broken', 'overcast', 'cloudy', 'rain', 'storm', 'snow'];
                let urls = ['/static/jeremy-bezanger-Vc1SiK-VoDM-unsplash.jpg', '/static/clyde-rs-4XbZCfU2Uoo-unsplash.jpg', '/static/guillaume-galtier-3YrppYQPoCI-unsplash.jpg', '/static/johan-rydberg-VXm3zdPAIwc-unsplash.jpg', '/static/johan-rydberg-VXm3zdPAIwc-unsplash.jpg', '/static/johan-rydberg-VXm3zdPAIwc-unsplash.jpg', '/static/erik-witsoe-mODxn7mOzms-unsplash.jpg', '/static/layne-lawson-2uOcrLACf_4-unsplash.jpg', '/static/images.jpg'];
                let key = null;
                for (let x in key_words) {
                    if (w_des.includes(key_words[x])) {
                        key = x;
                    }
                    else {
                        continue;
                    }
                    break;
                }
                weather.style.background = `url(${urls[key]})`;
                if (key > 2) {
                    w_main.style.color = '#fff';
                }
            }
            else {
                let massege = create_html('div', 'l-stroke', 'weather info not available (server error)');
                let weather = document.querySelector('.weather');
                weather.append(massege);
                console.log('erorr in weather fetch call', f.status);
            }
        },
        function() {
            let massege = create_html('div', 'w-title l-stroke', 'location access not available or connection problem');
            let weather = document.querySelector('.weather');
            weather.append(massege);
            console.log("not allowed");});
    }
    else {
        let massege = create_html('div', 'w-title l-stroke', 'not available');
        let weather = document.querySelector('.weather');
        weather.append(massege);
        console.log("not available");
    }
}

async function quote()
{
    const api_url ="https://zenquotes.io/api/today/";
    try {
        const response = await fetch(api_url);
        if (response.ok) {
            let data = await response.json();
            console.log(data);
            let quote = document.querySelector('.thequote');
            quote.innerHTML = `"${data[0]['q']}"`;
            let div = document.querySelector('.quote-wrap');
            let auther = document.createElement('p');
            auther.innerHTML = `${data[0]['a']}`;
            auther.className = 'auther';
            div.append(auther);
        }
        else {
            let quote = document.querySelector('.thequote');
            quote.innerHTML = `error has occurred, ${response.status}`;
            console.log(response.status);
        }
    }
    catch(err) {
        let quote = document.querySelector('.thequote');
        quote.innerHTML = `error has occurred (${err})`;
        console.log(err);
    }
}
//utility function
function create_html(tag, clss, inner) {
    let element = document.createElement(tag);
    element.className = clss;
    if (inner) {
        element.innerHTML = inner;
    }
    return element;
}
