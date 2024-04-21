const scrapeAPI = './api/scrape-request';

const scrapeRequestWrapper = document.getElementById('scrape-request-wrapper');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const tagToScrapeInput = document.getElementById('tag-to-scrape-input');
const expectedUrlInput = document.getElementById('expected-url-input');
const hasAjaxInput = document.getElementById('has-ajax-input');
const scrapeButton = document.getElementById('scrape-button');
const labels = document.getElementsByTagName('label');

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
    }

    //1D array
    if(!Array.isArray(array[0])){
        let tr = document.createElement('tr');
        for(let col = 0; col < array.length; ++col){
            let td = document.createElement('td');
            td.textContent = array[col];
            tr.append(td);
        }
        tbody.append(tr);
        table.append(tbody);
        return table;
    }

    return 'Element is not a table';
}

function toggleInputs(event){
    switch (event.target.value) {
        case 'table':
            for(let label of labels){
                if(label.htmlFor == expectedUrlInput.id){
                    label.classList.add('hidden');
                    expectedUrlInput.classList.add('hidden');
                }
                if(label.htmlFor == hasAjaxInput.id){
                    label.classList.add('hidden');
                    hasAjaxInput.classList.add('hidden');
                }
            }
            break;
        case 'text':
            for(let label of labels){
                if(label.htmlFor == expectedUrlInput.id){
                    label.classList.add('hidden');
                    expectedUrlInput.classList.add('hidden');
                }
                if(label.htmlFor == hasAjaxInput.id){
                    label.classList.add('hidden');
                    hasAjaxInput.classList.add('hidden');
                }
            }
            break;
        case 'anchor':
            for(let label of labels){
                if(label.htmlFor == expectedUrlInput.id){
                    label.classList.remove('hidden');
                    expectedUrlInput.classList.remove('hidden');
                }
                if(label.htmlFor == hasAjaxInput.id){
                    label.classList.remove('hidden');
                    hasAjaxInput.classList.remove('hidden');
                }
            }
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

    let elements = await getScrapedData(scrapeAPI, urlValue, tagToScrapeValue, selectorValue, hasAjaxValue, expectedUrlValue);
    let parsedElement = JSON.parse(elements.responseText);
    let elementToDisplay;

    console.log(parsedElement[0]);

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