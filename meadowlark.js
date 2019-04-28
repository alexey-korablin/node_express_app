const express = require('express');
const handlebars = require('express3-handlebars').create({ 
    defaultLayout: 'main' ,
    helpers: {
        section: function(name, option) {
            if (!this._sections) { this._sections = {}; }
            this._sections[name] = option.fn(this);
            return null;
        }
    }
});
const formidable = require('formidable');

const fortune = require('./lib/fortune').getFortune;

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3053);

app.use(require('body-parser')());

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    // console.log(res.locals); // {}
    // console.log(app.get('env')); // development
    // console.log(req.query); // { test: '1' }
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    // console.log(res.locals.showTests); // true
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/headers', (req, res) => {
    res.set('Content-Type', 'text/plain');
    let s = '';
    for (let name in req.headers) { s += name + ': ' + req.headers[name] +  '\n';}
    res.send(s);
});

app.get('/about', (req, res) => {
    res.render('about',
        {
            fortune: fortune(),
            pageTestScript: '/qa/test-about.js'
        });
});

app.get('/newsletter', (req, res) => {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.post('/process', (req, res) => {
    console.log(req.accepts('html'));
    if (req.xhr || req.accepts('html') === 'html') {
        res.send({ success: true });
    } else {
        console.log(`Form (from querystring): ${req.query.form}`);
        console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
        console.log(`Name (from visible form field): ${req.body.name}`);
        console.log(`Email (from visible form field): ${req.body.email}`);
        res.redirect(303, '/thank-you');
    }
});

app.get('/contest/vacation-photo', (req, res) => {
    const now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getMonth()
    });
});

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) { return res.redirect(303, '/error'); }
        console.log('Received fields');
        console.log(fields);
        console.log('Received files');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', (req, res) => {
    res.render('tours/request-group-rate');
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


if (app.thing === null) { console.log('bleat!'); }

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
// Middlewares - provide modularization to make it easier to handle requests
// |__ static middleware - allows to simple delivering it to the client. It might be put things like CSS, images and client-side JS

// express.static(path, handler) - creates middleware to serve all files within specified directory