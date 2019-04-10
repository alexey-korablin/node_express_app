const express = require('express');

const app = express();

app.set('port', process.env.PORT || 3053);

app.get('/', (req, res) => {
    res.type('text/plain');
    res.send('Meadowlark Travel');
});

app.get('/about', (req, res) => {
    res.type('text/plain');
    res.send('About Meadowlark Travel');
});

// custom 404 page
app.use((req, res) => {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
});

// custom 500 page
app.use((err, req, res, next) => {
    console.error()
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.listen(app.get('port'),
    () => console.log(`Express started on http://localhost:${app.get('port')} ; press Ctrl + C to terminate`));


// Help Section
// .get - to set a route. 
//      Methods .get, .put, .post etc. get 2 params: a route - string like '/' and function
// .use - to set a middleware
// The order of routes and middlewares is significant
// The handlers for errors 404 and 500 can be destinguished by number of arguments