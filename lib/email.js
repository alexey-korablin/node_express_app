const nodemailer = require('nodemailer');

module.exports = function (creds) {
    const mailTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: creds.gmail.user,
            pass: creds.gmail.password
        }
    });
    const from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
    const errorRecepient = 'youremail@gmail.com';

    return {
        send: function(to, subject, html) {
            mailTransport.sendMail({
                from,
                to,
                subject,
                html,
                generateTextFromHtml: true
            }, (err) => {
                if (err) { console.err('Unable to send email' + err); }
            });
        },
        emailError: function(message, filename, exception) {
            let html = '<h1>Meadowlark travel site error</h1>' + 
                'message:<br><pre>' + message + '</pre><br>';

            if (exception) { html +=  'exception:<br><pre>' + exception + '</pre><br>';}
            if (filename) { html += 'filename:<br><pre>' + filename + '</pre><br>';}
            mailTransport.sendMail({
                from,
                to: errorRecepient,
                subject: 'Meadowlark travel site error',
                html,
                generateTextFromHtml: true
            }, (err) => {
                if (err) { console.err('Unable to send email' + err); }
            })
        }
    };
}