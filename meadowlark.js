const express = require('express');
const handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3053);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

// custom 404 page
app.use((req, res, next) => {
    res.status(404);
    res.render('404');
});

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'),
    () => console.log(`Express started on http://localhost:${app.get('port')} ; press Ctrl + C to terminate`));


// Help Section
//
// .get - to set a route. 
//      Methods .get, .put, .post etc. get 2 params: a route - string like '/' and function
// .use - to set a middleware
// The order of routes and middlewares is significant
// The handlers for errors 404 and 500 can be destinguished by number of arguments
// 
// { defaultLayout: 'main' } - unless you specify otherwise, this is the layout that will be used for any view
//