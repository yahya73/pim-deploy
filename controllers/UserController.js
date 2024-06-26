import User from "../models/User.js";
import bcrypt from 'bcrypt';
import {validationResult} from "express-validator";
import {sendNotificationReact} from "./notificationController.js"

import {generateKeysFromMnemonic,transferNft} from './parentController.js'
import identifiers from "../models/identifiers.js";
import bip39 from 'bip39';
import hdkey from 'hdkey';
import {
    HDNode as ethersHdNode,
} from '@ethersproject/hdnode';
import {
    AccountId,
    PrivateKey,
    Client,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
    Mnemonic,
    Hbar
  } from "@hashgraph/sdk";
  import dotenv from 'dotenv';
  dotenv.config();
  import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
  const accountIdString = process.env.ACCOUNT_ID;
const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;
const tokenId = process.env.TOKEN_ID;
if (accountIdString === undefined || privateKeyString === undefined) { throw new Error('account id and private key in env file are empty') }

const operatorAccountId = AccountId.fromString(accountIdString);
const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);
import nodemailer from 'nodemailer';

export async function signin(req, res) {
    const { identifier, password, fcmtoken } = req.body;
  
    try {
      console.log('Identifier:', identifier);
      console.log('password:', password);
      console.log('fcmtoken:', fcmtoken);
  
      // Determine if the identifier is an email or a username
      let user = await User.findOne({
        $or: [
          { "email": identifier },
          { "username": identifier }
        ]
      });
  
      console.log('User:', user);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }
  
      // Check if fcmtoken exists and is not already in the array
      if (fcmtoken && !user.fcmtokens.includes(fcmtoken)) {
        user.fcmtokens.push(fcmtoken); // Add fcmtoken to the array
      }
      if (user.fcmtokens.includes(fcmtoken)) {
        console.log("token already exists"); // Add fcmtoken to the array
      } 
  
      // Save the updated user object
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

export function updateOnce(req, res) {
  // Check if there are validation errors
  if (!validationResult(req).isEmpty()) {
      // Respond with 400 Bad Request and the validation errors
      return res.status(400).json({ errors: validationResult(req).array() });
  } else {
      // If there are no validation errors, update the user by Username
      User.findOneAndUpdate(
          { username: req.body.Username }, // Query based on the unique Username
          {
              // Updating 'PhoneNumber', 'image', and 'Email' with the values from the request body
              phoneNumber: req.body.PhoneNumber,
              image: req.body.image,
              email: req.body.Email,
          },
          { new: true } // Return the updated user
      )
          .then((updatedUser) => {
              // Check if the user exists
              if (!updatedUser) {
                  return res.status(404).json({ message: 'User not found' });
              }
              // Respond with the updated user details
              res.json(updatedUser);
          })
          .catch((err) => {
              // Respond with 500 Internal Server Error and the error details
              res.status(500).json({ error: err });
          });
  }
}

  export function updateUser(req, res) {
      // Check if there are validation errors
      if (!validationResult(req).isEmpty()) {
          // Respond with 400 Bad Request and the validation errors
          return res.status(400).json({ errors: validationResult(req).array() });
      } else {
          // If there are no validation errors, update the user by Username
      User.findByIdAndUpdate(
          req.params.id,
              {
                  // Query based on the unique Username
                  // Updating 'PhoneNumber', 'image', and 'Email' with the values from the request body
                  PhoneNumber: req.body.PhoneNumber,
                  Email: req.body.Email,
                  Role: req.body.Role,
              },
              { new: true } // Return the updated user
          )
              .then((updatedUser) => {
                  // Check if the user exists
                  if (!updatedUser) {
                      return res.status(404).json({ message: 'User not found' });
                  }
                  // Respond with the updated user details
                  res.json(updatedUser);
              })
              .catch((err) => {
                  // Respond with 500 Internal Server Error and the error details
                  res.status(500).json({ error: err });
              });
      }
  }




    export function getAll(req, res) {
    // Retrieve all tests from the database
    User.find()
        .then((users) => {
            // Respond with the array of tests
            res.json(users);
        })
        .catch((err) => {
            // Respond with 500 Internal Server Error and the error details
            res.status(500).json({ error: err });
        });
}

export function banUser(req, res) {
    // Check if there are validation errors
    if (!validationResult(req).isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        // If there are no validation errors, update the user by ID
        User.findByIdAndUpdate(
            req.params.id,
            {
                banned:req.body.banned,
            },
            { new: true } // Return the updated user
        )
            .then((bannedUser) => {
                // Check if the user exists
                if (!bannedUser) {
                    return res.status(404).json({ message: 'user not found' });
                }
                // Respond with the updated user details
                res.json({
                    message:'user banned  successfully'
                });
            })
            .catch((err) => {
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
}
export function unbanUser(req, res) {
    // Check if there are validation errors
    if (!validationResult(req).isEmpty()) {
        // Respond with 400 Bad Request and the validation errors
        return res.status(400).json({ errors: validationResult(req).array() });
    } else {
        // If there are no validation errors, update the user by ID
        User.findByIdAndUpdate(
            req.params.id,
            {
                banned:false,
            },
            { new: true } // Return the updated user
        )
            .then((bannedUser) => {
                // Check if the user exists
                if (!bannedUser) {
                    return res.status(404).json({ message: 'user not found' });
                }
                // Respond with the updated user details
                res.json({
                    message:'user unbanned  successfully'
                });
            })
            .catch((err) => {
                // Respond with 500 Internal Server Error and the error details
                res.status(500).json({ error: err });
            });
    }
}

export async function createchildinblockchain(){
    
    console.log('- Creating a new account...\n');
    const mnemonic = await Mnemonic.generate12();
    console.log(mnemonic._mnemonic.toString())
    const hdNodeRoot = ethersHdNode.fromMnemonic(mnemonic._mnemonic.toString());
    const accountHdPath = `m/44'/60'/0'/0/0`;
    const hdNode = hdNodeRoot.derivePath(accountHdPath);
    const privateKey = PrivateKey.fromStringECDSA(hdNode.privateKey);
    
    const aliasAccountId = privateKey.publicKey.toAccountId(0, 0);
    console.log(`- New account ID: ${aliasAccountId.toString()}`);
    if (aliasAccountId.aliasKey === null) {
        throw new Error('alias key is empty');
    }
    await sendToken(client, tokenId, operatorAccountId, aliasAccountId, 2, operatorPrivateKey);
    const accountId =await getAccountIdByAlias(client, aliasAccountId);
    console.log(`The normal account ID of the given alias: ${accountId}`);
    console.log(privateKey.toString())
    console.log(mnemonic)
    const privateString = privateKey.toString();
    const mnemonicString = mnemonic._mnemonic.toString()
    const acountIdString = accountId.toString();
    return({ privateString ,acountIdString, mnemonicString })
}


// Function to create a new child user
export  async function createChild(req, res) {
    const child = req.body;
    child.role="child"
    try {
      const {privateString ,acountIdString} =  await  createchildinblockchain();
      console.log("private"+privateString);
      child.adressblockchain = acountIdString;
      const hashedPassword = await bcrypt.hash(child.password, 10);
      child.password = hashedPassword;
       //702016452439
      const identifier = await  identifiers.findOne({nfc_id :child.rfid_tag});
      console.log(identifier)
       if(identifier){
        await transferNft( identifier.nft_id, client, acountIdString, privateString);
        const childcreated = await User.create(child);
        
        const key =  await transformString(childcreated.username);
         const encrypted = encryptText(privateString,key);
         console.log(encrypted.encryptedText);
         const decrypted =  decryptText(encrypted.encryptedText,key);
          res.status(200).json({
              
              encrypted:encrypted.encryptedText,
              
              
          });
       }

       
   
    } catch (error) {
        throw new Error('Error creating child user'+ error);
    }
}
    export async function getusersolde(req,res){
        try {
            //
        let username= req.params.username;
       let user= await User.findOne( { username : username});
      
        const query = new AccountBalanceQuery().setAccountId(user.adressblockchain);

        //Sign with the client operator account private key and submit to a Hedera network
        let accountBalance = await query.execute(client);
        
        console.log(accountBalance.tokens._map.get("0.0.3567431").low);
        res.status(200).json(accountBalance.tokens._map.get("0.0.3567431").low);
        }catch(error){
            console.log(error);
            res.status(404).json(1);
        }
    }
// Function to get all children by parent ID
export  async function getAllChildrenByParentId(req, res) {
    try {
        const children = await User.find({ parentid: req.params.parentid, role: 'child' });
      console.log("children");
      console.log(children);
      if(children != 0){
        res.json(children)
      }
      else{
        res.status(204).json(children);
      }
    } catch (error) {
        throw new Error('Error fetching children');
    }
}

// Function to get all children
export async function getAllChildren(req, res) {
    try {
        const children = await User.find({ role: 'child' });
        res.json(children)
    } catch (error) {
        throw new Error('Error fetching children');
    }
}

// Function to delete a child by ID
export async function deleteChildById(req, res) {
    try {
        const deletedChild = await User.findByIdAndDelete(req.body.childId);
        res.json(deletedChild)
    } catch (error) {
        throw new Error('Error deleting child');
    }
}
export async function getAccountIdByAlias (client, aliasAccountId){
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(aliasAccountId)
        .execute(client);
   
    return accountInfo.accountId;
}
export async function sendToken(client, tokenId, owner, aliasAccountId, sendBalance, treasuryAccPvKey) {
    console.log(sendBalance);
    try{
    const tokenTransferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, owner, -sendBalance)
        .addTokenTransfer(tokenId, aliasAccountId, sendBalance)

        .freezeWith(client);
     
    // Sign the transaction with the operator key
    let tokenTransferTxSign = await tokenTransferTx.sign(treasuryAccPvKey);
    // Submit the transaction to the Hedera network
    let tokenTransferSubmit = await tokenTransferTxSign.execute(client);
    // Get transaction receipt information
    await tokenTransferSubmit.getReceipt(client);
    }catch(e){
        console.log(e);
    }
}
export async function transformString(input) {
    if (input.length <= 6) {
        return input; // If the input length is 6 or less, return the input as is
    }
try {
   

    let middleIndex = Math.floor(input.length / 2);
    
    // Find the index of the middle character
    let transformedString = 'a'; // Initialize the transformed string
    
    // Add the characters according to the specified pattern
    transformedString += input[middleIndex];
    transformedString += 'za'
    transformedString += input[middleIndex + 2];
    transformedString += 'bz'
    middleIndex = middleIndex +2;
    transformedString += input[middleIndex - 3];
    transformedString += 'xb'
    middleIndex = middleIndex -3;
    transformedString += input[middleIndex - 1];
    transformedString += 'cx'
    
    transformedString += input[input.length - 1];
    transformedString += 'uc'
    transformedString += input[input.length - 2];
    transformedString += input[1];
    transformedString += 'du'
    transformedString += input[middleIndex+1];
    transformedString += 'qd'
    transformedString += input[0];
    transformedString += 'eq'
    if (input.length >= 10) {

       transformedString += input[middleIndex+2];
    transformedString += 'le'
    transformedString += input[middleIndex+3];
    transformedString += 'fl' 
    transformedString += input[middleIndex+1];// If the input length is 6 or less, return the input as is
    }
   

    // Add characters from the alphabet in the specified pattern
 

    return transformedString;
} catch (error) {
    console.log(error)
}
}
export function encryptText(text, key) {
    try{
      let  keybytes = Buffer.from(key, 'utf-8');
     // console.log(keybytes.length);
        if (keybytes.length > 32) {
            // Truncate the key if it's longer than 32 bytes
           keybytes= keybytes.subarray(0, 32);
        } else if (keybytes.length < 32) {
            // Pad the key with null bytes if it's shorter than 32 bytes
           keybytes =  key.padEnd(32, '\0');
        } 
       
   //     const data =  Buffer.from(text);
    var iv = Buffer.from(process.env.IV, 'hex');
    
  // Generate a random initialization vector
    const cipher = createCipheriv('aes-256-cbc', keybytes, iv);
    let encryptedText = cipher.update(text.toString(), 'utf8', 'hex');
    encryptedText += cipher.final('hex');
    
    return {  encryptedText:encryptedText };
    }catch(error){
        console.log("ppppp"+error)
    }
    
}

// Function to decrypt an encrypted string using a key and initialization vector (iv)
export function decryptText(encryptedText,key) {
    var iv = Buffer.from(process.env.IV, 'hex');
  let  keybytes = Buffer.from(key, 'utf-8');
    if (keybytes.length > 32) {
        // Truncate the key if it's longer than 32 bytes
      keybytes=  keybytes.subarray(0, 32);
    } else if (keybytes.length < 32) {
        // Pad the key with null bytes if it's shorter than 32 bytes
       keybytes =  key.padEnd(32, '\0');
    } 
    const decipher = createDecipheriv('aes-256-cbc', keybytes, Buffer.from(iv, 'hex'));
    let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedText += decipher.final('utf8');
    return decryptedText;
}

const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 8); // Generate a random 6-character alphanumeric code
};

// Function to send the password reset email
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body; // Assuming you're sending the email address in the request body

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.verified === false) {
      return res.status(401).json({ error: "User not verified" });
    }

    // Generate a random code for password reset
    const resetCode = generateRandomCode();

    // Update the user document in the database with the reset code
    user.ResetCode = resetCode;
    await user.save();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'mootez202@gmail.com', // Your Gmail email address
        pass: 'ylaq roin svpz colq ' // Your Gmail password
      }
    });

    // Email message options
    const mailOptions = {
      from: 'mootez202@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Your password reset code is: ${resetCode}`
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Password reset email sent successfully', resetCode });
      }
    });
  } catch (error) {
    console.log('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Controller function to reset the password
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
export const resetPasswordFirsttime = async (req, res) => {
  const { email, newPassword } = req.body;
 console.log(email);
  try {
    // Find the user by email
    const user = await User.findOne({email :email});
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
     const {privateString ,acountIdString,mnemonicString} =  await  createchildinblockchain();
     user.adressblockchain = acountIdString;
     const key =  await transformString(user.username);
     const encrypted = encryptText(privateString,key);
     console.log(encrypted.encryptedText);
     const decrypted =  decryptText(encrypted.encryptedText,key);
    // Update the user's password in the database
    user.password = hashedPassword;
    user.first_time = false;
    await user.save();
     
    return res.status(200).json({    encrypted:encrypted.encryptedText , mnemonic:mnemonicString});
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export async function paymentnotification(req, res){
  try {
      const { notification, iduser ,owner, aliasAccountId,sendBalance,treasuryAccPvKey} = req.body;
await sendToken(client, tokenId, owner, aliasAccountId, sendBalance, treasuryAccPvKey) 
      // Call sendNotificationReact function
      await sendNotificationReact(notification, iduser);

      res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
  }
}
export { sendPasswordResetEmail,resetPassword };