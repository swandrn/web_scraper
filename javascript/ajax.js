function receiveAjax(url) {
    return new Promise(function (resolve, reject) {
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

function scrapeTable(){
    let resArray = new Array();
    receiveAjax('./php/proxy.php').then(function (rawData){
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(rawData.responseText, 'text/html');

        let tableHeaders = htmlDoc.getElementsByTagName('th');
        let tableHeadersContent = new Array();
        for(let i = 0; i < tableHeaders.length; ++i){
            tableHeadersContent.push(tableHeaders[i].textContent.trim());
        }
        resArray.push(tableHeadersContent);

        let tableRows = htmlDoc.getElementsByTagName('tr');
        for(let i = 0; i < tableRows.length; ++i){
            let tableData = tableRows[i].getElementsByTagName('td');
            let tableDataContent = new Array();
            if(Array.isArray(tableData) || tableData.length){
                for (let j = 0; j < tableData.length; j++) {
                    tableDataContent.push(tableData[j].textContent.trim());
                }
                resArray.push(tableDataContent);
            }
        }
    });
    return resArray;
}

console.log(scrapeTable());