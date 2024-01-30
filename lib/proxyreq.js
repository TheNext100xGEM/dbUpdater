
require('dotenv').config();
var https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');


function get(url, headers) {
    return new Promise((resolve, reject) => {
        const [
            proxyHost,
            proxyPort
        ] 
        
        = process.env.NEXTGEM_ROTATOR_ADDRESS.split(':');
        
        const targetUrl = url; 
        
        let req;

        const agent = new HttpsProxyAgent('http://' + proxyHost + ':' + proxyPort);

        const AbortTimeout = setTimeout(() => {
            req.destroy();
            resolve({
                status: false,
                error: 'Request timed out'
            });
        }, 15000);


        const requestOptions = {
            headers: {
                Host: new URL(targetUrl).hostname,
                ...headers
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
                    statusCode: response.statusCode,
                    data: data
                });
            });
        });

        req.on('error', error => {
            clearTimeout(AbortTimeout);
            resolve({
                status: false,
                error: error.message
            });
        });

        

        req.end();
    });
}


module.exports = {
    get: (url) => get(url, {}),
    getJSON: (url) => get(url, { 'Content-Type': 'application/json' }),
}