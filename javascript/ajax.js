const tableUrl = 'https://www.scrapethissite.com/pages/forms/';
const websiteUrl = 'https://www.scrapethissite.com';

function receivePage(fileUrl, pageUrl) {
    return new Promise(function (resolve) {
        const request = new XMLHttpRequest();
        request.open('POST', fileUrl, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this);
            }
        };
        request.send(`url=${pageUrl}`);
    });
}

async function scrapeTable() {
    let resArray = new Array();
    const rawData = await receivePage('./php/proxy.php', tableUrl);
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

async function scrapePagination(){
    let resArray = new Array();
    const rawData = await receivePage('./php/proxy.php', tableUrl);
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(rawData.responseText, 'text/html');

    let paginationAnchors = htmlDoc.querySelectorAll('.pagination a');
    for(let i = 0; i < paginationAnchors.length; ++i){
        if(paginationAnchors[i].ariaLabel != null){
            continue;
        }
        resArray.push(paginationAnchors[i].getAttribute('href'));
    }
    return resArray;
}