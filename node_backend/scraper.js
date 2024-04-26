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

/**
 * Anchor scraper
 * @param {page} pPage web page
 * @param {string} selector CSS selector
 * @param {string} expectedUrl the URL the ajax takes you to
 * @param {boolean} hasAjax whether the request requires ajax handling
 * @returns array
 */
async function scrapeAnchor(pPage, selector, expectedUrl, hasAjax = false) {
    let resArray = new Array();
    const metaData = {
        dataType: 'anchor'
    };
    resArray.push(metaData);

    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g;
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

/**
 * Table scraper
 * @param {page} pPage web page
 * @param {string} selector CSS selector
 * @returns array
 */
async function scrapeTable(pPage, selector){
    const metaData = {
        dataType: 'table'
    };

    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    
    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }

    let result = await pPage.$eval(selector, tbody => [...tbody.rows].
    map(row => [...row.cells].
    map(cell => cell.innerText)));

    let resArray = await result;
    resArray.unshift(metaData);

    return resArray;
}

/**
 * Text scraper
 * @param {page} pPage web page
 * @param {string} selector CSS selector
 * @returns array
 */
async function scrapeText(pPage, selector){
    const metaData = {
        dataType: 'text'
    };
    
    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    
    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }

    let result = pPage.$$eval(selector, elements => {
        let res = new Array();
        for(let i = 0; i < elements.length; ++i){
            res.push(elements[i].innerText);
        }
        return res;
    });

    let resArray = await result;
    resArray.unshift(metaData);

    return resArray;
}

async function scrapeImage(pPage, selector){
    const metaData = {
        dataType: 'image'
    };
    
    let selectorIsNumberRegexp = /(#\d+)|(.\d+)/g
    let digitOnlySelectors = selector.match(selectorIsNumberRegexp);
    
    //Escapes all digit only CSS selectors;
    if(digitOnlySelectors?.length){
        let escapedSelectors = await escapeNumberSelector(digitOnlySelectors);
        for(let i = 0; i < digitOnlySelectors.length; ++i){
            selector = selector.replace(digitOnlySelectors[i], escapedSelectors[i]);
        }
    }
    
    let result = pPage.$$eval(selector, elements => {
        let res = new Array();
        for(let i = 0; i < elements.length; ++i){
            res.push(elements[i].src);
        }
        return res;
    });
    
    let resArray = await result;
    resArray.unshift(metaData);

    return resArray;
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

async function parseRobotsTxt(robotsTxt){
    //INSPIRED BY https://github.com/chrisakroyd/robots-txt-parser/blob/master/src/parser.js
    const USER_AGENT = 'user-agent';
    const ALLOW = 'allow';
    const DISALLOW = 'disallow';
    const SITEMAP = 'sitemap';
    const CRAWL_DELAY = 'crawl-delay';
    const HOST = 'host';

    //Regex to cleanup the file
    const comments = /#.*$/gm;
    const whitespace = ' ';
    const lineEndings = /[\r\n]+/g;
    const blockSlices = /(\w+-)?\w+:\s\S*/g;

    //Remove comments and whitespaces
    const removeComments = (rawString) => rawString.replace(comments, '');
    const removeSpaces = (rawString) => rawString.replace(whitespace, '').trim();
    const splitOnLines = (string) => string.split(lineEndings);

    const parseBlock = (line) => {
        const firstColon = line.indexOf(':');
        return {
            field: line.slice(0, firstColon).toLowerCase().trim(),
            value: line.slice(firstColon + 1).trim()
        };
    };

    //I don't know why I need to parse disallow block values
    // const parsePattern = (pattern) => {
    //     const regexSpecialChars = /[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g;
    //     const wildCard = /\*/g;
    //     const endOfLine = /\\\$$/;
    //     const flags = 'm';

    //     const regexString = pattern
    //         .replace(regexSpecialChars, '\\&')
    //         .replace(wildCard, '.*')
    //         .replace(endOfLine, '$');

    //     return new RegExp(regexString, flags);
    // }

    const groupMemberBlock = (value) => ({
        specificity: value.length,
        path: value
    });

    let pureString = removeSpaces(removeComments(robotsTxt));
    let lines = splitOnLines(pureString);

    const robotsObj = {
        sitemaps: [],
    };
    let agent = '';

    //Parse robots.txt
    for (let line of lines) {
        const block = parseBlock(line);
        switch (block.field) {
            case USER_AGENT:
                const blockValue = block.value.toLowerCase();
                //If user-agent is set
                if (blockValue !== agent && blockValue.length > 0) {
                    agent = blockValue;
                    robotsObj[agent] = {
                        allow: [],
                        disallow: [],
                        crawlDelay: 0
                    };
                }
                break;
            case ALLOW:
                if (agent.length > 0 && block.value.length > 0) {
                    robotsObj[agent].allow.push(groupMemberBlock(block.value));
                }
                break;
            case DISALLOW:
                if (agent.length > 0 && block.value.length > 0) {
                    robotsObj[agent].disallow.push(groupMemberBlock(block.value));
                }
                break;
            //Get sitemap
            case SITEMAP:
                if (block.value.length > 0) {
                    robotsObj.sitemaps.push(block.value);
                }
                break;
            case CRAWL_DELAY:
                if (agent.length > 0) {
                    robotsObj[agent].crawlDelay = Number.parseInt(block.value, 10);
                }
                break;
            case HOST:
                //If no host already present, input this one
                if (!('host' in robotsObj)) {
                    robotsObj.host = blockValue;
                }
                break;
            default:
                break;
        }
    }

    robotsObj.sitemaps = robotsObj.sitemaps.filter((val, i, s) => s.indexOf(val) === i);
    return robotsObj;
}

async function createError(message){
    return [{
        dataType: 'error',
        errorMessage: message
    }];
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
        let matches = urlToScrape.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i);
        let domain = matches && matches[1];
        let canScrape = true;
        let scrapedData;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const userAgent = 'Coll';
        await page.setUserAgent(userAgent);

        scrape : try {
            await page.goto(`https://${domain}/robots.txt`);
            const robotsTxtContent = await page.evaluate(() => document.body.textContent);

            //If robots.txt is not empty
            if(robotsTxtContent.length > 0){
                const robotsTxt = await parseRobotsTxt(robotsTxtContent);
    
                
                if(robotsTxt[userAgent]?.length){
                    //Directives specific to this scrape bot
                } else{
                    //Directives for all bots
                    let disallowedPaths = [];
                    for(let i = 0; i < robotsTxt['*'].disallow.length; ++i){
                        disallowedPaths.push(robotsTxt['*'].disallow[i].path);
                    }
    
                    for(let i = 0; i < disallowedPaths.length; ++i){
                        if(urlToScrape.includes(disallowedPaths[i])){
                            canScrape = false;
                        }
                    }
                }
            }

            if(!canScrape){
                scrapedData = await createError('You cannot scrape this website');
                break scrape;
            }

            await page.goto(urlToScrape);
            await page.setViewport({ width: 1080, height: 1024 });

            switch (tagToScrape) {
                case 'table':
                    scrapedData = await scrapeTable(page, selector);
                    break;
                case 'text':
                    scrapedData = await scrapeText(page, selector);
                    break;
                case 'anchor':
                    scrapedData = await scrapeAnchor(page, selector, expectedUrl, hasAjax);
                    break;
                case 'image':
                    scrapedData = await scrapeImage(page, selector);
                    break;
                default:
                    scrapedData = await createError('Select a HTML tag to scrape');
                    break;
            }
        } catch (error) {
            scrapedData = await createError(error.message);
        }

        await browser.close();

        res.type('json');
        res.json(scrapedData);
    });

    app.listen(5000);
}

main();