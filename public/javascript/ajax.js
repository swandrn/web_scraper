const scrapeAPI = './api/scrape-request';

const scrapeRequestWrapper = document.getElementById('scrape-request-wrapper');
const urlInput = document.getElementById('url-input');
const selectorInput = document.getElementById('selector-input');
const hasAjaxInput = document.getElementById('has-ajax-input');
const scrapeButton = document.getElementById('scrape-button');

async function getScrapedData(requestUrl, urlToScrape, selector, hasAjax){
    let params = `urlToScrape=${urlToScrape}&selector=${selector}&hasAjax=${hasAjax}`;
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

async function main(){
    let urlValue = urlInput.value;
    let selectorValue = selectorInput.value;
    let hasAjaxValue = hasAjaxInput.checked ? 'true' : 'false';

    let response = await getScrapedData(scrapeAPI, urlValue, selectorValue, hasAjaxValue);
    let textResponse = document.createElement('p');
    textResponse.textContent = response.responseText;
    scrapeRequestWrapper.append(textResponse);
}

scrapeButton.addEventListener('click', main);