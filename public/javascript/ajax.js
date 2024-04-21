const scrapeAPI = './api/scrape-request';

const scrapeRequestWrapper = document.getElementById('scrape-request-wrapper');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const expectedUrlInput = document.getElementById('expected-url-input');
const hasAjaxInput = document.getElementById('has-ajax-input');
const scrapeButton = document.getElementById('scrape-button');

async function getScrapedData(requestUrl, urlToScrape, selector, expectedUrl, hasAjax){
    let params = `urlToScrape=${urlToScrape}&selector=${selector}&expectedUrl=${expectedUrl}&hasAjax=${hasAjax}`;
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

async function createTable(array){
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    for(let row = 0; row < array.length; ++row){
        let tr = document.createElement('tr');
        if(array[row]?.length){
            for(let col = 0; col < array[row].length; ++col){
                let td = document.createElement('td');
                td.textContent = array[row][col];
                tr.append(td);
            }
            tbody.append(tr);
        }
    }
    table.append(tbody);
    return table;
}

async function main(){
    let urlValue = urlInput.value;
    let selectorValue = selectorInput.value;
    let hasAjaxValue = hasAjaxInput.checked ? 'true' : 'false';
    let expectedUrlValue = expectedUrlInput.value;

    let elements = await getScrapedData(scrapeAPI, urlValue, selectorValue);
    let parsedElements = JSON.parse(elements.responseText);

    let table = await createTable(parsedElements);

    scrapeRequestWrapper.append(table);
}

scrapeButton.addEventListener('click', main);