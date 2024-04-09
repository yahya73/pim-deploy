import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, username) => {
    try {
        // Create Nodemailer transporter using Outlook SMTP settings
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // Your Outlook email address
                pass: process.env.EMAIL_PASSWORD, // Your Outlook password
            },
        });

        // Define email options
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: email, // Recipient address
            subject: 'Verification Email', // Subject line
            html: `Hey ${username}, click <a href="http://localhost:9090/partenaire/verifyEmail/${email}">here</a> to verify your email.`, // HTML content of the email
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
};
