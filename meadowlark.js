const express = require('express');
const handlebars = require('express3-handlebars').create({ defaultLayout: 'main' });

const app = express();

const fortunes = [
    'Conquer your fears or they will conquer you.',
    'Rivers need springs.',
    'Do not fear what you don\'t know.',
    'You will have a pleasant surprise.',
    'Whenever possible, keep it simple.',

];

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3053);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', {fortune: randomFortune});
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
// Middlewares - provide modularization to make it easier to handle requests
// |__ static middleware - allows to simple delivering it to the client. It might be put things like CSS, images and client-side JS

// express.static(path, handler) - creates middleware to serve all files within specified directory