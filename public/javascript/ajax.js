const scrapeAPI = './api/scrape-request';

const scrapeRequestWrapper = document.getElementById('scrape-request-wrapper');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const tagToScrapeInput = document.getElementById('tag-to-scrape-input');
const expectedUrlInput = document.getElementById('expected-url-input');
const hasAjaxInput = document.getElementById('has-ajax-input');
const scrapeButton = document.getElementById('scrape-button');

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

async function createTable(array) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

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
            return table;
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
                td.textContent = array[row][keys[i]];
                tr.append(td);
            }
            tbody.append(tr);
        }
        table.append(tbody);
        return table;
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
            return table;
        }
    }

    return 'Element is not an array';
}

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
        elementToDisplay = await createTable(parsedElement);
    }
    
    scrapeRequestWrapper.append(elementToDisplay);
}

scrapeButton.addEventListener('click', main);
tagToScrapeInput.addEventListener('change', function(event){
    toggleInputs(event);
});