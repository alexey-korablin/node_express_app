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
const jqupload = require('jquery-file-upload-middleware');
const nodemailer = require('nodemailer');
const http = require('http');

const fortune = require('./lib/fortune').getFortune;
const creds = require('./credentials');
const cartValidation = require('./lib/cartValidation');
const emailService = require('./lib/email')(creds);

const VALID_EMAIL_REGEX = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const app = express();
// To change mode perform in console this: export NODE_ENV=production
http.createServer(app).listen(app.get('port'), 
    () => console.log(`Express started in ${app.get('env')} mode on http://localhost:${app.get('port')}; Press Ctrl+C to terminate`));

// Creating nodemailer instance aka "transport"
// const mailTransport = nodemailer.createTransport('SMTP', {
//     service: 'Gmail',
//     auth: {
//         user: creds.gmail.user,
//         pass: creds.gmail.password
//     }
// });
var mailTransport = nodemailer.createTransport("smtps://youruser%40gmail.com:"+encodeURIComponent('yourpass#123') + "@smtp.gmail.com:465");
// If nodemailer doesn't have an appropriate shortcut of email service it is possible to connect to SMTP server directly
// In this case it is necessary  to specify smtp port:
// const mailTransport = nodemailer.createTransport('SMTP', {
//     service: 'smtp.meadowlarktravel.com',
//     port: 465,
//     auth: {
//         user: creds.meadowlarkSmtp.user,
//         pass: creds.meadowlarkSmtp.password
//     }
// });
//
// Sending mail
// to send email to multiple recepients it's need to list them in 'to' property separated with commas
// f.i.: to: 'rec1@exmpl.com, rec2@exmpl.com, rec3@exmpl.com, "Jane Customer" <jane@yahoo.com>'
// mailTransport.sendMail({
//     from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
//     to: 'somecustomer@gmail.com',
//     subject: 'Your meadowlark travel tour',
//     text: 'Thank you for booking your trip with Meadowlark Travel. We look forward to your visit!'
// }, (err) => {
//     if (err) { console.error('Unable to send email: ' + err); }
// });
// If needs to send email with html layout body it's important ot consider option to show plain text
// when/if html couldn't be interpreted by client
// The first option is pass to nodemailer both html and plain text options
// The second and better way is pass only html option and allow nodemailer translate it to plain text
// in case of failure. The option is: 
//  generateTextFromHtml: true
// Images can be added to email as links to image files (good way)
// For testing purposes can be used localhost. In production the layout can look like that:
//  <img src="//meadowlark.com/email/logo.png" alt="Meadowlark Travel">
//
// Sending email with emailService
emailService.send('somecustomer@gmail.com', 'Hood river tours on sale today!', 'Get\'em while they\'re hot!');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3053);

app.use(require('body-parser')());
app.use(require('cookie-parser')(creds.cookieSecret));
app.use(require('express-session')());

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    // console.log(res.locals); // {}
    // console.log(app.get('env')); // development
    // console.log(req.query); // { test: '1' }
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    // console.log(res.locals.showTests); // true
    next();
});

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.get('/', (req, res) => {
    res.cookie('monster', 'nom nom');
    res.render('home');
});

app.get('/headers', (req, res) => {
    res.set('Content-Type', 'text/plain');
    let s = '';
    for (let name in req.headers) { s += name + ': ' + req.headers[name] +  '\n';}
    res.send(s);
});

app.get('/about', (req, res) => {
    res.cookie('signed_monster', 'nom nom', { signed: true });
    res.render('about',
        {
            fortune: fortune(),
            pageTestScript: '/qa/test-about.js'
        });
});

app.get('/newsletter', (req, res) => {
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});

class NewsletterSignup {
    constructor(config) {
        this.name = config.name;
        this.email = config.email;
    }

    save() {
        if (!(this.name && this.email)) {
            return new Error('DB error');
        }
    }
}

app.post('/newsletter', (req, res) => {
    const name = req.body.name || '';
    const email = req.body.email || '';
    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) { return res.json({ error: 'Invalid name or email address' }); }
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid'
        };
        return res.redirect(303, '/newsletter/archive');
    }
    new NewsletterSignup({name, email}).save((err) => {
        if (err) {
            if (req.xhr) { return res.json({ error: 'database error' }); }
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.'
            };
            return res.redirect(303, '/newsletter/archive');
        }
        if (req.xhr) { return res.json({ success: true }); }
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter.'
        };
        return res.redirect(303, '/newsletter/archive');
    });
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

// !!! This render used twice. Normally will be shown only result of first render call.
// In this case it isn't so. Providing a callback fn will prevent rendering, then the second 
//  render will be shown
app.post('/cart/checkout', (req, res) => {
    const cart = req.session.cart;
    if (!cart) {
        next(new Error('Cart does not exist.'));
    }
    const name = req.body.name || '';
    const email = req.body.email || '';
    if (!email.match(VALID_EMAIL_REGEX)) {
        res.next(new Error('Invalid email address'));
    }
    // assign a random cart ID; normally we would use a database ID here
    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name,
        email
    };
    res.render('email/cart-thank-you', {
        layout: null, // necessary to don't show the layout to client
        cart
    }, (err, html) => {
        if (err) {
            console.error('error in email template');
        }
        mailTransport.sendMail({
            from: '"Meadowlark Travel" <info@meadowlarktravel.com>',
            to: cart.billing.email,
            subject: 'Thank you for book your trip with Meadowlark Travel.',
            html,
            generateTextFromHtml: true
        }, (err) => {
            if (err) { console.err('Unable to send confirmation' + err.stack); }
        });
    });
    res.render('cart-thank-you', { cart });
});

app.use('/upload', (req, res, next) => {
    const now = Date.now();
    jqupload.fileHandler({
        uploadDir: () => `${__dirname}/public/uploads/${now}`,
        uploadUrl: () => `/uploads/${now}`
    })(req, res, next);
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

// app.listen(app.get('port'),
    // () => console.log(`Express started on http://localhost:${app.get('port')} ; press Ctrl + C to terminate`));


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

// express-session
// set cookie
// req.session.userName = "Anonimous"
// req.session.colorScheme = "dark"
// delete cookie
// delete req.session.colorScheme
// All this operation performs only with request object! response object doesn't have the session property