const fs = require('fs')
const path= require('path')
const http = require('http');
const { HttpsProxyAgent } = require('https-proxy-agent');
const proxyscraper = require('./functions/proxyscraper.js');


let proxies = fs.readFileSync(path.join(__dirname, './dumps/rawProxies.txt'), 'UTF-8').split('\n')

function isValidIpPort(str) {
    var regex = /^((25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d):([0-5]?[0-9]{1,4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
    return regex.test(str);
}

// Generate a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//SERVICE
const MINUTES = 10;

async function start() {

    if(!isValidIpPort(proxies[0]))
        proxies = await proxyscraper.updateProxies()
    //await proxyscraper.updateProxies()
    setInterval(async function(){

        proxies = await proxyscraper.updateProxies()
    }, MINUTES * 1000 * 60)
}

start()


const getRandomProxy = () => {
    return proxies[getRandomInt(0, proxies.length - 1)]
}



const server = http.createServer((req, res) => {
    // Handle HTTP requests here...
});

server.on('connect', (req, clientSocket, head) => {
    const agent = new HttpsProxyAgent(getRandomProxy());

    // Connect to the target through the proxy
    const { port, hostname } = new URL(`http://${req.url}`);
    const options = {
        host: hostname,
        port: port,
        agent: agent,
    };

    const proxySocket = net.connect(options);

    proxySocket.on('connect', () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: Node.js-Proxy\r\n' +
                        '\r\n');
        proxySocket.write(head);
        proxySocket.pipe(clientSocket);
        clientSocket.pipe(proxySocket);
    });

    // Add error handling for both sockets
});

const PORT = 8005;
server.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});