import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import { google } from 'googleapis';

export const registerPartenaire = async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        // Vérifier si le partenaire existe déjà
        const existingPartenaire = await UserModel.findOne({ username });

        if (existingPartenaire) {
            return res.status(400).json({ message: "Partenaire already exists", partenaire: existingPartenaire });
        }        

        const existingEmail = await UserModel.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPartenaire = new UserModel({
           username,
            email,
            password: hashedPassword,
            role: 'partner',
            image: 'default image', 
            phoneNumber,
            adressBlockchain: 'static blockchain address', 
            prohibitedProductTypes: ['type1', 'type2'],
            verified : false,
            banned:false
        });

        console.log("aaaaaa")

        console.log("aaaaaa")

        const partenaire = await newPartenaire.save();

        // const token = jwt.sign(
        //     { username: partenaire.Username, id: partenaire._id },
        //     process.env.JWT_KEY,
        //     { expiresIn: "1h" }
        // );        
        // const token = jwt.sign(
        //     { username: partenaire.Username, id: partenaire._id },
        //     process.env.JWT_KEY,
        //     { expiresIn: "1h" }
        // );        

        // Send verification email
        // await sendVerificationEmail(Email, Username);
        // await sendVerificationEmail(Email, Username);

        res.status(200).json({ partenaire });
        res.status(200).json({ partenaire });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const sendVerificationEmail = async (email, username) => {
    try {

        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
          );
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
        console.log("Access token:", ACCESS_TOKEN);

        // Create nodemailer transporter with OAuth2 authentication
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });
    try {

        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
          );
        oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

        const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
        console.log("Access token:", ACCESS_TOKEN);

        // Create nodemailer transporter with OAuth2 authentication
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: ACCESS_TOKEN,
            },
        });

        // Define email options
       
        // Define email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Email',
            html: `Hey ${username}, click <a href="http://localhost:9090/partenaire/verifyEmail/${email}">here</a> to verify your email.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Error sending verification email.");
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const email = req.params.email;
        
        // Find the user by email and update the Verified field to true
        const user = await UserModel.findOneAndUpdate(
            { email: email }, 
            { verified: true }, 
            { new: true, projection: { username: 1, email: 1, role: 1, verified: 1 } }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Email ${email} verified`);
        res.status(200).json({ message: 'User verified with success', user }); // Respond with success message and user
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};
