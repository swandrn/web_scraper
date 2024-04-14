const tableUrl = 'https://www.scrapethissite.com/pages/forms/';

async function postUrl(url) {
    const request = new XMLHttpRequest();
    request.open('POST', './php/proxy.php', true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.log(this.responseText);
        }
    }
    request.send(`url=${url}`);
    return 'success';
}

function receiveAjax(url) {
    return new Promise(function (resolve) {
        const request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this);
            }
        };
        request.send(null);
    });
}

function scrapeCountries() {
    receiveAjax('./php/proxy.php').then(function (rawData) {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(rawData.responseText, 'text/html');
        let countries = htmlDoc.getElementsByClassName('country-name');
        for (let i = 0; i < countries.length; ++i) {
            console.log(countries[i].textContent.trim());
        }
    });
}

async function scrapeTable() {
    let resArray = new Array();
    const rawData = await receiveAjax('./php/proxy.php');
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(rawData.responseText, 'text/html');

    let tableHeaders = htmlDoc.getElementsByTagName('th');
    let tableHeadersContent = new Array();
    for (let i = 0; i < tableHeaders.length; ++i) {
        tableHeadersContent.push(tableHeaders[i].textContent.trim());
    }
    resArray.push(tableHeadersContent);

    let tableRows = htmlDoc.getElementsByTagName('tr');
    for (let i = 0; i < tableRows.length; ++i) {
        let tableData = tableRows[i].getElementsByTagName('td');
        let tableDataContent = new Array();
        if (Array.isArray(tableData) || tableData.length) {
            for (let j = 0; j < tableData.length; j++) {
                tableDataContent.push(tableData[j].textContent.trim());
            }
            resArray.push(tableDataContent);
        }
    }
    return resArray;
}

scrapeTable().then(rawTable => {
    for (let row = 0; row < rawTable.length; ++row) {
        console.log(rawTable[row].join(' '));
    }
});