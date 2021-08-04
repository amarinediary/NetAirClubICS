let constants = require(`${__dirname}/_required/constants.js`);

/**
 * @link https://nodejs.org/api/fs.html
 * 
 * @package fs
 */
 let fs = require('fs');

/**
 * @link https://github.com/puppeteer/puppeteer/
 * 
 * @package puppeteer
 */
let puppeteer = require(`puppeteer`);

/**
 * @link https://github.com/adamgibbons/ics
 * 
 * @package ics
 */
let ics = require(`ics`);

/**
 * @link https://github.com/moment/moment
 * 
 * @package moment
 * 
 * Required for @package ics, alarm support.
 */
let moment = require(`moment`);

let scraper = async (aeroclub, login, password, host) => {

    let events = [], 
        fileID = [],
        found = '0',
        webcal;

    let netairclub = {
        index: `https://app.netairclub.com/${aeroclub}/index.php`,
        parameters: `https://app.netairclub.com/${aeroclub}/parametres.php`,
        members: `https://app.netairclub.com/${aeroclub}/liste_mb.php`,
    };

    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.setRequestInterception(!0), page.on(`request`, (page => {

        /**
         * @see https://github.com/puppeteer/puppeteer/blob/v0.12.0/docs/api.md#requestresourcetype
         */
        -1 !== [
            //`document`,
            `stylesheet`,
            `image`,
            `media`,
            `font`,
            //`script`,
            `texttrack`,
            `xhr`,
            `fetch`,
            `eventsource`,
            `websocket`,
            `manifest`,
            `other`,
        ].indexOf(page.resourceType()) ? page.abort() : page.continue()
    }));

    let status = await page.goto(netairclub.index, {
        waitUntil: `domcontentloaded`,
    });
    status = status.status();

    let url = page.url();

    if (status != 404) {
        await page.type(`input[type="text"]`, login);
        await page.type(`input[type="password"]`, password);
        await Promise.all([
            page.$eval(`input[type="submit"]`, element =>
                element.click()
            ),
            await page.waitForNavigation(),
        ]);
        if (!page.url().includes(`?lg=X`)) {
            let location = await page.$eval(`#nomAC > h1`, element =>
                element.innerText
            );
            location = constants.capitalize(location);

            let bookings = [];
            for (let i = 0; i < 32; i++) {
                if (await page.$(`tr.avion > td.booked_user > a`) !== null) {
                    let flights = await page.$$eval(`tr.avion > td.booked_user > a`, elements =>
                        elements.map(element => element.title)
                    );
                    for (let k = 0; k < flights.length; k++) {
                        flights[k] = [constants.sanitize_whitespaces(flights[k])];
                    };

                    let aircrafts = await page.$$eval(`tr.avion > td.booked_user > a`, elements =>
                        elements.map(element => element.parentNode.parentNode.firstElementChild.innerText)
                    );
                    for (let k = 0; k < aircrafts.length; k++) {
                        aircrafts[k] = [constants.sanitize_whitespaces(aircrafts[k])];
                    };

                    for (let k = 0; k < flights.length; k++) {
                        bookings.push(aircrafts[k].concat(flights[k]));
                    };
                };

                await Promise.all([
                    page.$eval(`#reserv > div:nth-child(14) > table > tbody > tr > td:nth-child(6) > a`, element =>
                        element.click()
                    ),
                    await page.waitForNavigation(),
                ]);
            };

            let buffer = [];
            bookings = bookings.filter(elements => !buffer.includes(elements[1]) ? buffer.push(elements[1]) : false);

            if (bookings.length > 0) {
                await page.goto(netairclub.members, {
                    waitUntil: `domcontentloaded`,
                });

                let members = await page.$$eval(`#table1 > div > table > tbody > tr`, elements =>
                    elements.map(element => element.innerText)
                );
                for (let k = 0; k < members.length; k++) {
                    members[k] = constants.sanitize_whitespaces(members[k]);
                };

                for (let booking of bookings) {
                    let start = constants.sanitize_start(booking[1]);
                    start = [`20${start[2]}`, start[1], start[0], start[3], start[4],].map(i => Number(i));

                    let end = constants.sanitize_end(booking[1]);
                    end = [`20${end[2]}`, end[1], end[0], end[3], end[4],].map(i => Number(i));

                    let destination;
                    if (booking[1].includes(`Destination:`)) {
                        destination = `Destination: ${constants.sanitize_destination(booking[1])}`;
                    };

                    let organizer = ``, attendee = ``;
                    members.forEach(member => {
                        if (booking[1].includes(`en instruction avec`)) {
                            if (member.match(new RegExp(`${constants.sanitize_instructor_firstname(booking[1])}`, ``)) && member.match(new RegExp(`${constants.sanitize_instructor_lastname(booking[1])}`, ``))) {
                                organizer = constants.sanitize_contact(member) || member;
                            };
                        } else {
                            if (member.match(new RegExp(`${constants.sanitize_organizer_firstname(booking[1])}`, ``)) && member.match(new RegExp(`${constants.sanitize_organizer_lastname(booking[1])}`, ``))) {
                                organizer = constants.sanitize_contact(member) || member;
                            };
                        };

                        if (member.match(new RegExp(`${constants.sanitize_attendee_firstname(booking[1])}`, ``)) && member.match(new RegExp(`${constants.sanitize_attendee_lastname(booking[1])}`, ``))) {
                            attendee = constants.sanitize_contact(member) || member;
                        };
                    });

                    if (organizer.every((v,i) => v === attendee[i])) {    
                        organizer = attendee = ``;
                    } else {
                        organizer = `Organizer: ${organizer}`;
                        attendee = `Attendee: ${attendee}`;
                    };

                    let description = {
                        ...destination && ({ destination }),
                        ...organizer && ({ organizer }),
                        ...attendee && ({ attendee }),
                    };
                    description = Object.values(description).join(`\n`);

                    let alarms = [{
                        action: 'audio',
                        trigger: { 
                            hours: 1, 
                            before: true 
                        },
                    }];

                    /**
                     * @see https://github.com/adamgibbons/ics#attributes
                     */
                    events.push({
                        start: start,
                        startInputType: `local`,
                        startOutputType: `local`,
                        end: end,
                        endInputType: `local`,
                        endOutputType: `local`,
                        title: `✈️ Réservation ${booking[0]}`,
                        description: description,
                        location: location,
                        url: netairclub.index,
                        status: `CONFIRMED`,
                        categories: [`flight`,],
                        alarms: alarms,
                        productId: `NetAirClubICS`,
                        method: `PUBLISH`,
                        sequence: 1,
                        busyStatus: `BUSY`,
                        calName: `NetAirClubICS`,
                    });
                };

                let fileID_letters = location.replace(/\s+/gm, '').split(``);
                for (let fileID_letter of fileID_letters) {
                    fileID.push(parseInt(fileID_letter, 36) - 9);
                };
                fileID = login + fileID.join(``).substring(0, 13);

                let path = `${__dirname}/public/ics/${fileID}.ics`;
                ics.createEvents(events, (error, value) => {
                    if (error) throw error;
                    fs.writeFileSync(path, value, (error) => {
                        if (error) throw error;
                    });
                });

                found = bookings.length;
                
                webcal = `webcal://${host}/ics/${fileID}.ics`;
            };
        } else {
            url = page.url();
        };
    };

    await browser.close();

    console.log({
        ...url && ({ url }),
        ...status && ({ status }),
        ...found && ({ found }),
        ...webcal && ({ webcal }),
    });

    return {
        ...url && ({ url }),
        ...status && ({ status }),
        ...found && ({ found }),
        ...webcal && ({ webcal }),
    };

}; module.exports = scraper;