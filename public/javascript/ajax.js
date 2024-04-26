const scrapeAPI = './api/scrape-request';

const scrapeResponseWrapper = document.getElementById('scrape-response-wrapper');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const tagToScrapeInput = document.getElementById('tag-to-scrape-input');
const expectedUrlInput = document.getElementById('expected-url-input');
const hasAjaxInput = document.getElementById('has-ajax-input');
const scrapeButton = document.getElementById('scrape-button');

/**
 * Sends POST request to node.js API
 * @param {string} requestUrl url to the node API
 * @param {string} urlToScrape url of the website to scrape
 * @param {string} tagToScrape html tag to scrape
 * @param {string} selector CSS selector
 * @param {string} expectedUrl url the web page will call upon AJAX request
 * @param {string} hasAjax whether the scrape request requires AJAX handling
 * @returns Promise<XMLHttpRequest>
 */
async function getScrapedData(requestUrl, urlToScrape, tagToScrape, selector, expectedUrl, hasAjax){
    let params = `urlToScrape=${urlToScrape}&tagToScrape=${tagToScrape}&selector=${selector}&expectedUrl=${expectedUrl}&hasAjax=${hasAjax}`;
    return new Promise(function (resolve, reject){
        const request = new XMLHttpRequest();
        request.open('POST', requestUrl);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                resolve(this);
            }
        }
        request.send(params);
    });
}

/**
 * Create a table from 1D or 2D arrays, also handles array of Objects
 * @param {array} array 
 * @returns array | string
 */
async function createTable(array) {
    const tableWrapper = document.createElement('div');
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    tableWrapper.classList.add('table-wrapper');

    // True for array
    if (Object.prototype.toString.call(array[0]) === '[object Array]') {
        //2D array
        if (Array.isArray(array[0])) {
            for (let row = 0; row < array.length; ++row) {
                let tr = document.createElement('tr');
                for (let col = 0; col < array[row].length; ++col) {
                    let td = document.createElement('td');
                    td.textContent = array[row][col];
                    tr.append(td);
                }
                tbody.append(tr);
            }
            table.append(tbody);
            tableWrapper.append(table);
            return tableWrapper;
        } // True for JSON objects
    } else if (Object.prototype.toString.call(array[0]) === '[object Object]') {
        const keys = Object.keys(array[0]);

        //Append table headers
        let tr = document.createElement('tr');
        for (let key of keys) {
            let th = document.createElement('th');
            th.textContent = key;
            tr.append(th);
        }
        tbody.append(tr);

        for (let row = 0; row < array.length; ++row) {
            let tr = document.createElement('tr');
            for (let i = 0; i < keys.length; ++i) {
                let td = document.createElement('td');
                td.textContent = array[row][keys[i]];
                tr.append(td);
            }
            tbody.append(tr);
        }
        table.append(tbody);
        tableWrapper.append(table);
        return tableWrapper;
    } else {
        //1D array
        if (!Array.isArray(array[0])) {
            let tr = document.createElement('tr');
            for (let col = 0; col < array.length; ++col) {
                let td = document.createElement('td');
                td.textContent = array[col];
                tr.append(td);
            }
            tbody.append(tr);
            table.append(tbody);
            tableWrapper.append(table);
            return tableWrapper;
        }
    }

    return 'Element is not an array';
}

/**
 * Create an array of HTML img element
 * @param {array} imagesUrls url of the images
 * @returns img
 */
async function createImgs(imagesUrls){
    let images = new Array();
    for(let i = 0; i < imagesUrls.length; ++i){
        const img = document.createElement('img');
        img.src = imagesUrls[i];
        images.push(img);
    }
    return images;
}

/**
 * Toggle input display
 * @param {event} event 
 */
function toggleInputs(event){
    switch (event.target.value) {
        case 'table':
            expectedUrlInput.parentElement.classList.add('hidden');
            hasAjaxInput.parentElement.classList.add('hidden');
            break;
        case 'text':
            expectedUrlInput.parentElement.classList.add('hidden');
            hasAjaxInput.parentElement.classList.add('hidden');
            break;
        case 'anchor':
            expectedUrlInput.parentElement.classList.remove('hidden');
            hasAjaxInput.parentElement.classList.remove('hidden');
            break;
        case 'image':
            expectedUrlInput.parentElement.classList.add('hidden');
            hasAjaxInput.parentElement.classList.add('hidden');
            break;
        default:
            break;
    }
}

async function main(){
    let urlValue = urlInput.value;
    let tagToScrapeValue = tagToScrapeInput.value;
    let selectorValue = selectorInput.value;
    let hasAjaxValue = hasAjaxInput.checked ? 'true' : 'false';
    let expectedUrlValue = expectedUrlInput.value;

    let elements = await getScrapedData(scrapeAPI, urlValue, tagToScrapeValue, selectorValue, expectedUrlValue, hasAjaxValue);
    let parsedElement = JSON.parse(elements.responseText);
    let elementToDisplay;

    const metaData = parsedElement.shift();

    switch (metaData['dataType']) {
        case 'table':
            elementToDisplay = await createTable(parsedElement);
            break;
        case 'text':
            elementToDisplay = await createTable(parsedElement);
            break;
        case 'anchor':
            elementToDisplay = await createTable(parsedElement);
            break;
        case 'image':
            let images = await createImgs(parsedElement);
            for(let image of images){
                scrapeResponseWrapper.append(image);
            }
            break;
        default:
            scrapeResponseWrapper.append(elementToDisplay);
            break;
    }
}

scrapeButton.addEventListener('click', main);
tagToScrapeInput.addEventListener('change', function(event){
    toggleInputs(event);
});