const scrapeAPI = './api/scrape-request';

const scrapeRequestWrapper = document.getElementById('scrape-request-wrapper');
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
                    if(await isImageUrl(array[col])){
                        td.append(await createImg(array[row][col]));
                    } else{
                        td.textContent = array[row][col];
                    }
                    tr.append(td);
                }
                tbody.append(tr);
            }
            table.append(tbody);
            tableWrapper.append(table);
            return tableWrapper;
        } // True for JSON objects
    } else if (Object.prototype.toString.call(array[0]) === '[object Object]') {
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
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
                if(await isImageUrl(array[col])){
                    td.append(await createImg(array[row][keys[i]]));
                } else{
                    td.textContent = array[row][keys[i]];
                }
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
                if(await isImageUrl(array[col])){
                    td.append(await createImg(array[col]));
                } else{
                    td.textContent = array[col];
                }
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
 * Create an img HTML element
 * @param {string} url url of the image
 * @returns img
 */
async function createImg(url){
    const img = document.createElement('img');
    img.src = url;
    return img;
}

/**
 * Checks if a string is an image url
 * @param {string} url url of the element to check
 * @returns boolean
 */
async function isImageUrl(url) {
    url = url.split('?')[0]; //Remove GET parameters
    let parts = url.split('.'); //Separate the URL for each period
    let extension = parts[parts.length-1];
    extension = extension.toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp', 'svg', 'webp'];
    if(imageTypes.indexOf(extension) !== -1) {
        return true;   
    }
    return false;
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

    //If parsedElement is an array
    if(Array.isArray(parsedElement)){
        elementToDisplay = await createTable(parsedElement);
    }
    
    //If parsedElement is not an array
    if(!Array.isArray(parsedElement)){
        elementToDisplay = parsedElement;
    }
    
    scrapeRequestWrapper.append(elementToDisplay);
}

scrapeButton.addEventListener('click', main);
tagToScrapeInput.addEventListener('change', function(event){
    toggleInputs(event);
});