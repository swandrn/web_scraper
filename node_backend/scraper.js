const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * General scraper
 * @param {page} pPage web page
 * @param {string} selector CSS selector
 * @param {string} expectedUrl the URL the ajax takes you to
 * @param {boolean} hasAjax whether the request requires ajax handling
 * @returns array
 */
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

async function scrapeTable(pPage, selector){
    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    
    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }

    let result = await pPage.$eval('.table tbody', tbody => [...tbody.rows].
    map(row => [...row.cells].
    map(cell => cell.innerText)));

    return result;
}

/**
 * Applies a CSSS escape on all selectors that are numbers only
 * @param {array} numbers strings of numbers only selectors
 * @returns array
 */
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
        let tagToScrape = req.body.tagToScrape;
        let selector = req.body.selector;
        let expectedUrl = req.body.expectedUrl;
        let hasAjax = req.body.hasAjax == 'true' ? true : false;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(urlToScrape);
        await page.setViewport({ width: 1080, height: 1024 });
        
        let scrapedData;

        switch (tagToScrape) {
            case 'table':
                scrapedData = await scrapeTable(page, selector);
                break;
            case 'text':
                scrapedData = await scrapeRequest(page, selector);
                break;
            case 'anchor':
                scrapedData = await scrapeRequest(page, selector, expectedUrl, hasAjax);
            default:
                break;
        }
        
        await browser.close();

        res.type('json');
        res.json(scrapedData);
    });
    
    app.listen(5000);
}

main();