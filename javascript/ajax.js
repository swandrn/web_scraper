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


