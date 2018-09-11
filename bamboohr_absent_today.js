// ==UserScript==
// @name         Absent Today
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Absent at Toronto office
// @author       Me
// @match        https://ringukraine.bamboohr.co.uk/home
// @grant        none
// @require      https://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

$(document).ready(function () {
    let d = new Date(), cd = d.toISOString().slice(0, 10);
    // fetch list of all absent people for this date
    fetch('https://ringukraine.bamboohr.co.uk/calendar/time_off/' + cd + '/' + cd)
        .then(people_json => {
            // get json
            people_json.json().then(list => {
                // make fetches of individual pages for each person and ask for page html
                let promises = list.map(person => fetch(person.employeeProfileUrl).then(r => r.text()));
                // collect all responses
                Promise.all(promises)
                    .then(texts => texts.map(text => {
                        // get person name and location
                        let dom = $(text),
                            name = dom.find('h2').text(),
                            location = dom.find('li.location').text();
                        return {'name': name, 'loc': location}
                    }))
                    // filter only Toronto
                    .then(name_locs => name_locs.filter(nl => nl.loc == 'Toronto'))
                    // leave only name
                    .then(list => list.map(a => a.name).sort())
                    // output
                    .then(list => console.info(list.reduce((p, v) => p + v + '\n', '')));
            })
        })
});