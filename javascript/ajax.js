const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');

const tableUrl = 'https://www.scrapethissite.com/pages/forms/';
const moviesUrl = 'https://www.scrapethissite.com/pages/ajax-javascript/';
const websiteUrl = 'https://www.scrapethissite.com';

async function scrapeRequest(pPage, selector, hasAjax = false) {
    let resArray = new Array();
    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);

    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }
    
    let elements = await pPage.$$(selector);

    if (!hasAjax) {
        for(let element of elements){
            const el = await pPage.evaluate(el => el.textContent, element);
            resArray.push(el);
        }
    }

    if (hasAjax) {
        if (elements?.length) {
            for (let i = 0; i < elements.length; ++i) {
                await elements[i].evaluate(el => el.click());

                const response = await pPage.waitForResponse(async resp => {
                    return (await resp.url().includes('https://www.scrapethissite.com/pages/ajax-javascript/'));
                });

                if (response.ok()) {
                    let jsonArray = await (response.json());
                    for (let row = 0; row < jsonArray.length; ++row) {
                        resArray.push(jsonArray[row]);
                    }
                }
            }
        }
    }
    console.log(resArray);
    return resArray;
}

async function escapeNumberSelector(numbers){
    let cssEscape = '\\3';
    let escapedSelectors = new Array();
    for(let row = 0; row < numbers.length; ++row){
        let escapedSelector = '';
        for(let col = 0; col < numbers[row].length; ++col){
            if(col == 1){
                escapedSelector += `${cssEscape}${numbers[row][col]} `;
                continue
            }
            escapedSelector += numbers[row][col];
        }
        escapedSelectors.push(escapedSelector);
    }
    return escapedSelectors;
}

async function main() {
    const app = express();

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../index.html'));
    });

    app.get('/api/scrape-request', async (req, res) => {
        const scrapedData = await scrapeRequest(page, '.year-link#2012', true);
        res.json(scrapedData);
    });

    app.listen(8080, async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto(moviesUrl);
        await page.setViewport({ width: 1080, height: 1024 });

    
        await browser.close();
    });    
}

main();