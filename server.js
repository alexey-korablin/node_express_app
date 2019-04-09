const http = require('http');

http.createServer((req, res) => {
    const path = req.url.replace(/\/?(?:\?.*)?$/, '');
    console.log(path);
    switch (path) {
        case '':
            res.writeHead(200, {'Content-Type': 'text/plain'}) ;
            res.end('Homepage');
            break;
        case '/about':
            res.writeHead(200, {'Content-Type': 'text/plain'}) ;
            res.end('About page');
            break;
        default:
            res.writeHead(404, {'Content-Type': 'text/plain'}) ;
            res.end('Not Found');
            break;
    }
}).listen(3053, () => console.log('Server running on port 3053'));