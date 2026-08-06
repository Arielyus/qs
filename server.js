const http = require('http');
const fs = require('fs');
var querystring = require('querystring');
var crypto = require('crypto');

const hostname = '127.0.0.1';
var port = process.env.PORT || 1337;
const ids = {};

const server = http.createServer((req, res) => {

    // res.statusCode = 200;
    const url = req.url;
    if (url.includes('.html') || url.includes('.js') || url.includes('.png') || url.includes('.jpg') || url.includes('.css') || url.includes('.apk') || url.includes('.ico'))
        getFile(req, res)
    else if (url == '/') {
        req.url = '/index.html';
        getFile(req, res)
    }
    else if (url == '/setUrl') {


        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            // var params = getPostParams(data);
            const id = req.headers.id;
            const url = req.headers.url;
            console.log(id + ':' + url);
            ids[id] = url;
            // var data = Buffer.from('ok');
            // res.setHeader('Content-Type', 'application/json');

            res.writeHead(200);
            res.end();
        });
    }
    else if (url == '/getUrl') {
        var data = '';
        req.on('data', chunk => {
            data += chunk;
        })
        req.on('end', () => {
            // var params = getPostParams(data);
            const json = JSON.parse(data);
            let url = '';
            const idsArray = Object.keys(ids);
            if (idsArray.includes(json.id))
                url = ids[json.id];
            const returnData = Buffer.from(url, 'utf8');
            // res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            // getFile(req, res)
            res.end(returnData);
        })

    }
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

function getPostParams(data) {
    var params = {};
    var list = data.split('&');
    list.forEach(item => {
        var keyVal = item.split('=');
        var key = keyVal[0];
        var val = keyVal[1];
        params[key] = val;
    });

    return params;
}

function getFile(req, res) {
    fs.readFile(__dirname + req.url, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        if (req.url.includes('.html')) {
            let html = data.toString();
            const id = uuidv4();
            // ids[id] = 'https://www.neogaf.com/forums/gaming-discussion.2/page-2'
            html = html.replace("{id}", id);
            data = Buffer.from(html, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
        }
        else if (req.url.includes('.js'))
            res.setHeader('Content-Type', 'text/plain');
        else if (req.url.includes('.xml'))
            res.setHeader('Content-Type', 'application/xml');
        else if (req.url.includes('.apk'))
            res.setHeader('Content-Type', 'application/octet-stream');

        res.writeHead(200);
        res.end(data);
    });
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.webcrypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}