"use strict"
const nodemailer = require("nodemailer");

//used to initialised auto response data and send message confirmation emails
function autoEmailer() {
    
    // create reusable transporter object using the default SMTP transporter
    var transporterDetails = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "auto.awesomesite@gmail.com", // generated ethereal user
            pass: "Auto1234" // generated ethereal password
        }
    }
    const transporter = nodemailer.createTransport(transporterDetails);

    //Used to send an email, the message sent depends on whether the transaction in the db is successful
    function sendEmail(added, email) {

        var message = added? "The message has been received successfully, we will get back to you if necessary.":"Something went wrong when saving your message";
        var htmlMessage = added? "<b>The message has been received successfully, we will get back to you if necessary.</b>":"<b>Something went wrong when saving your message</b>";

        // setup email data with unicode symbols
        let mailOptions = {
            from: 'auto.awesomesite@gmail.com', // sender address
            to: email, // list of receivers
            subject: 'AutRe: Message Received', // Subject line
            text: message, // plain text body
            html: htmlMessage // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, reportSend);
        function reportSend(error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
    }

    return {sendEmail}
}

//used to allow loading via require
module.exports.initAutoEmailer = function() {
    return autoEmailer();
}