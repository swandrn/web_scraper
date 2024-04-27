const scrapeAPI = './api/scrape-request';

const scrapeResponseWrapper = document.getElementById('scrape-response-wrapper');
const errorResponseWrapper = document.getElementById('error-response-wrapper');
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
 * Create an array of HTML p element
 * @param {array} arrayOfText array of strings representing the scraped data
 * @returns array
 */
async function createParagraphs(arrayOfText){
    let paragraphs = new Array();
    for(let i = 0; i < arrayOfText.length; ++i){
        const pararaph = document.createElement('p');
        pararaph.textContent = arrayOfText[i];
        paragraphs.push(pararaph);
    }
    return paragraphs;
}

/**
 * Create array of HTML anchor elements
 * @param {array} arrayOfHref array of urls scraped
 * @returns array
 */
async function createAnchors(arrayOfAnchors){
    console.log(arrayOfAnchors);
    let anchors = new Array();
    for(let i = 0; i < arrayOfAnchors.length; ++i){
        const template = document.createElement('template');
        template.innerHTML = arrayOfAnchors[i];
        const anchor = template.content.firstChild;
        anchors.push(anchor);
    }
    return anchors;
}

/**
 * Create an array of HTML img element
 * @param {array} imagesUrls url of the images
 * @returns array
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

    const metaData = parsedElement.shift();

    switch (metaData.dataType) {
        case 'table':
            let table = await createTable(parsedElement);
            scrapeResponseWrapper.append(table);
            break;
        case 'text':
            let paragraphs = await createParagraphs(parsedElement);
            for(let i = 0; i < paragraphs.length; ++i){
                scrapeResponseWrapper.append(paragraphs[i]);
            }
            break;
        case 'anchor':
            if(metaData.hasAjax){
                let anchorContent = await createTable(parsedElement);
                scrapeResponseWrapper.append(anchorContent);
            } else{
                let anchors = await createAnchors(parsedElement);
                for(let i = 0; i < anchors.length; ++i){
                    scrapeResponseWrapper.append(anchors[i]);
                }
            }
            break;
        case 'image':
            let images = await createImgs(parsedElement);
            for(let i = 0; i < images.length; ++i){
                scrapeResponseWrapper.append(images[i]);
            }
            break;
        case 'error':
            errorResponseWrapper.append(metaData.errorMessage);
            break;
        default:
            scrapeResponseWrapper.append(parsedElement);
            break;
    }
}

scrapeButton.addEventListener('click', function(){
    while(scrapeResponseWrapper.firstChild){
        scrapeResponseWrapper.removeChild(scrapeResponseWrapper.lastChild);
    }
    while(errorResponseWrapper.firstChild){
        errorResponseWrapper.removeChild(errorResponseWrapper.lastChild);
    }
    main();
});

tagToScrapeInput.addEventListener('change', function(event){
    toggleInputs(event);
});


let a = document.querySelector('#test-anchor');
console.log(a.textContent);