const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const puppeteer = require('puppeteer');

async function scrapeRequest(pPage, selector, expectedUrl, hasAjax = false) {
    let resArray = new Array();
    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    
    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }

    let elements = await pPage.$$(selector);

    if (!hasAjax) {
        if (elements?.length) {
            for (let row = 0; row < elements.length; ++row) {
                const el = await pPage.evaluate(el => el.textContent.trim(), elements[row]);
                resArray.push(el);
            }
        }
    }

    if (hasAjax) {
        if (elements?.length) {
            for (let i = 0; i < elements.length; ++i) {
                await elements[i].evaluate(el => el.click());

                const response = await pPage.waitForResponse(async resp => {
                    return (await resp.url().includes(expectedUrl));
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

    //Set default route of static files to be called in index.html
    app.use(express.static('public'));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    app.get('/', (req, res) => {
        res.sendFile(path.join(process.cwd(), '/index.html'));
    });
    
    app.post('/api/scrape-request', async (req, res) => {
        let urlToScrape = req.body.urlToScrape;
        let selector = req.body.selector;
        let expectedUrl = req.body.expectedUrl;
        let hasAjax = req.body.hasAjax == 'true' ? true : false;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.goto(urlToScrape);
        await page.setViewport({ width: 1080, height: 1024 });
        
        const scrapedData = await scrapeRequest(page, selector, expectedUrl, hasAjax);
        
        await browser.close();

        res.type('json');
        res.json(scrapedData);
    });
    
    app.listen(5000);
}

main();