const p = document.getElementById('myP');

async function getAjax(url){
    return new Promise(function (resolve, reject){
        const request = new XMLHttpRequest();
        request.open('GET', url);
        //request.setRequestHeader('Content-Type', 'application/json');
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                resolve(this);
            }
        }
        request.send();
    });
}

async function main(){
    p.textContent = 'empty';
    let response = await getAjax('./api/scrape-request');
    p.textContent = response.responseText;
    console.log(response.response);
}

main();