const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs')
const path = require('path')
var https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const AbortController = globalThis.AbortController || require("abort-controller")

function isValidIpPort(str) {
    var regex = /^((25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d):([0-5]?[0-9]{1,4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
    return regex.test(str);
}
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function testProxy(proxy) {
    return new Promise((resolve, reject) => {
        const [proxyHost, proxyPort] = proxy.split(':');
        const targetUrl = 'https://cryptorank.io/'; 
        let req;

        const agent = new HttpsProxyAgent('http://' + proxyHost + ':' + proxyPort);

        const AbortTimeout = setTimeout(() => {
            req.destroy();
            resolve({
                status: false,
                proxy,
                error: 'Request timed out'
            });
        }, 10000);


        const requestOptions = {
            headers: {
                Host: new URL(targetUrl).hostname
            },
            agent
        };

        req = https.request(targetUrl, requestOptions, response => {
            let data = '';

            response.on('data', chunk => {
                data += chunk;
            });

            response.on('end', () => {
                
                clearTimeout(AbortTimeout);
                
                resolve({
                    status: response.statusCode === 200,
                    proxy,
                    statusCode: response.statusCode,
                    data: data
                });
            });
        });

        req.on('error', error => {
            clearTimeout(AbortTimeout);
            resolve({
                status: false,
                proxy,
                error: error.message
            });
        });

        

        req.end();
    });
}

async function testProxies(proxies) {
    const proxyChunks = chunkArray(proxies, 50);
    const results = [];

    for (const chunk of proxyChunks) {
        console.log(`Testing ${chunk.length} proxies...`);
        const chunkResults = await Promise.all(chunk.map(testProxy));
        results.push(...chunkResults);
        console.log(' -> Found ' + chunkResults.filter(result => result.status).length + ' valid proxies');
    }

    return results;
}


const providers = [
    async () => {
        const URL = 'https://api.proxyscrape.com/v3/free-proxy-list/get?request=getproxies&protocol=http&anonymity=all&timeout=2300&proxy_format=ipport&format=text';

        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()

        return response
    },

    async () => {
        const URL = 'https://free-proxy-list.net/';
    
        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()
    
        const dom = new JSDOM(response);
    
    
        let proxyNodes = Array.from(dom.window.document.getElementsByClassName("table table-striped table-bordered")[0].querySelector('tbody').childNodes)
        

        return proxyNodes.map(ChildNode => ChildNode.childNodes[0].innerHTML + ':' + ChildNode.childNodes[1].innerHTML).join('\n')
    },

    async () => {
        const URL = 'https://hidemy.io/en/proxy-list/';
    
        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()
    
        const dom = new JSDOM(response);
    
    
        let proxyNodes = Array.from(dom.window.document.getElementsByClassName('table_block')[0].querySelector('tbody').childNodes)
        

        return proxyNodes.map(ChildNode => ChildNode.childNodes[0].innerHTML + ':' + ChildNode.childNodes[1].innerHTML).join('\n')
    },
    async () => {

        const URL = 'https://www.freeproxy.world/';
    
        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()
    
        const dom = new JSDOM(response);
    
    
        let proxyNodes = Array.from(dom.window.document.getElementsByClassName('show-ip-div'))
        

        return proxyNodes.map(ChildNode => ChildNode.textContent.trim() + ':' + ChildNode.nextElementSibling.textContent.trim()).join('\n')
    },

    async () => {

        const URL = 'https://www.proxynova.com/proxy-server-list/';
    
        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()
    
        const dom = new JSDOM(response);
    
    
        let proxyNodes = Array.from(dom.window.document.getElementById('tbl_proxy_list').querySelector('tbody').querySelectorAll('tr'))
        proxyNodes = proxyNodes.map(ChildNode => {

            let ipEval = ChildNode.querySelector('script').textContent.trim().slice(0, -1).slice(15)

            let ip = eval(ipEval)
            let port = ChildNode.childNodes[3].textContent.trim()

            return ip + ':' + port
        })

        return proxyNodes.join('\n')
    },
    async () => {

        const URL = 'https://freeproxylist.cc/';
    
        const rawResponse = await fetch(URL)
        const response = await rawResponse.text()
        const dom = new JSDOM(response);
    
        
        let proxyNodes = Array.from(dom.window.document.getElementsByClassName("table")[0].querySelectorAll('tr')).slice(1).slice(0, -1)
        

        return proxyNodes.map(ChildNode => ChildNode.childNodes[1].textContent.trim() + ':' + ChildNode.childNodes[3].textContent.trim()).join('\n')
    },

]

async function updateProxies(){

    let proxies = await Promise.all(providers.map(provider => provider()))
    proxies = proxies.join('\n')
    
    const proxyList = proxies.split('\n').map(proxy => proxy.trim()).filter(proxy => isValidIpPort(proxy))

    let validProxies = await testProxies(uniq(proxyList))
    validProxies = validProxies.filter(proxy => proxy.status).map(Proxy => Proxy.proxy)

    console.log(validProxies.length)
    fs.writeFileSync(path.join(__dirname, '../dumps/proxies.json'), JSON.stringify(validProxies, null, 2))
    fs.writeFileSync(path.join(__dirname, '../dumps/rawProxies.txt'), validProxies.join('\n'))

    return validProxies
    
}

async function test(){

    const res = await testProxy('34.165.22.141:3128')
    console.log(res)
}

test()

module.exports = {
    updateProxies
}