const http = require('http');
const fs = require('fs');

function serverStaticFile(res, path, contetType, responseCode) {
    if(!responseCode) { responseCode = 200; }
    fs.readFile(__dirname + path, (err, data) => {
        if(err) {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('500 - Internal Error');
        } else {
            res.writeHead(responseCode, {'Content-Type': contetType});
            res.end(data);
        }
    })
}

http.createServer((req, res) => {
    const path = req.url.replace(/\/?(?:\?.*)?$/, '');
    console.log(path);
    switch (path) {
        case '':
            serverStaticFile(res, '/public/home.html', 'text/plain');
            break;
        case '/about':
            serverStaticFile(res, '/public/about.html', 'text/plain');
            break;
        default:
            serverStaticFile(res, '/public/notfound.html', 'text/plain', 404);
            break;
    }
}).listen(3053, () => console.log('Server running on port 3053'));