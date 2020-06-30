const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sudeepkn12@gmail.com',
        subject: 'Welcome to the task manager application',
        text: `Happy to onboard you, ${name}!`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sudeepkn12@gmail.com',
        subject: 'Goodbye!',
        text: `Thanks for using our service, ${name}. We hope to see you soon!`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}