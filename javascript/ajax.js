import puppeteer from 'puppeteer';

const tableUrl = 'https://www.scrapethissite.com/pages/forms/';
const ajaxUrl = 'https://www.scrapethissite.com/pages/ajax-javascript/';
const websiteUrl = 'https://www.scrapethissite.com';

async function scrapePagination(pPage, selector) {
    let resArray = new Array();

    let paginationAnchors = await pPage.$$(selector);
    
    for (let paginationAnchor of paginationAnchors) {
        let ariaLabel = await pPage.evaluate(el => el.ariaLabel, paginationAnchor);
        if(ariaLabel != null){
            continue;
        }
        const attr = await pPage.evaluate(el => el.getAttribute('href'), paginationAnchor);
        resArray.push(attr);
    }
    return resArray;
}

async function main() {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto(tableUrl);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    let pagination = await scrapePagination(page, '.pagination a');
    console.log(pagination);

    await browser.close();
}

main();