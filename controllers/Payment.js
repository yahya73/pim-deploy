import axios from "axios";
import User from "../models/User.js";
import {sendToken,decryptText,transformString, encryptText} from '../controllers/UserController.js';
import dotenv from 'dotenv';
import {
    AccountId,
    PrivateKey,
    Client,
    AccountBalanceQuery,
    AccountInfoQuery,
    TransferTransaction,
    Mnemonic
  } from "@hashgraph/sdk";
  dotenv.config();
const accountIdString = process.env.ACCOUNT_ID;
const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;
const tokenId = process.env.TOKEN_ID
if (accountIdString === undefined || privateKeyString === undefined) { throw new Error('account id and private key in env file are empty') }

const operatorAccountId = AccountId.fromString(accountIdString);
const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);

export async function payment(req, res) {
    console.log("in payment "+req.body.userid);
    const url = "https://developers.flouci.com/api/generate_payment";
    const payload = {
        "app_token": process.env.FLOUCT_PUBLIC,
        "app_secret": process.env.FLOUCT_SECRET,
        "accept_card":"true",
        "amount":req.body.amount,
        "success_link": `http://10.0.2.2:9090/api/payment/success/${req.body.amount}/${req.body.userid}`,
        "fail_link": "https://example.website.com/fail",
        "session_timeout_secs": 1200,
        "developer_tracking_id": "814ff20b-114b-4ff3-bd25-0f968e6ef2fc"
    };

    try {
        const result = await axios.post(url, payload);
        res.send(result.data);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while processing payment.");
    }
}
export async function success(req, res) {
    console.log("iheeeeeb");
    // Extracting 'amount' parameter from request URL
    const amount = req.params.amount;
 const userid = req.params.userid;
    // Logging the value of 'amount' to the console
    console.log(amount);
    console.log(userid);
    await User.findById(userid).then( async (user) => {
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Respond with the updated user details
        await sendToken(client, tokenId, operatorAccountId, user.adressblockchain, amount, operatorPrivateKey);
      // return res.status(200).send('Success');
    })
    .catch((err) => {
        // Respond with 500 Internal Server Error and the error details
       return res.status(500).json({ error: err });
    });
    return res.status(202).json('successfull payment and transaction');
    // Sending a response back to the client
    // Sending a simple success message
}
export async function transfertochild(req, res) {
    
    // Extracting 'amount' parameter from request URL
    const amount = req.body.amount;
 const parentid = req.body.parentid;
 const childusername = req.body.childusername;
 const cryptedkey = req.body.cryptedkey;
 const iv = req.body.iv;
    // Logging the value of 'amount' to the console
    console.log(cryptedkey);
    console.log(iv);
     const parent = await User.findById(parentid);
     const key =  await transformString(parent.username);
     console.log(key);
     const decrypted =  decryptText(cryptedkey,iv,key);
     const prvkey = PrivateKey.fromString(decrypted);
    await User.findOne( { username : childusername}).then( async (user) => {
        console.log(user.adressblockchain)
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Respond with the updated user details
        await sendToken(client, tokenId, parent.adressblockchain, user.adressblockchain, amount, prvkey);
      // return res.status(200).send('Success');
    })
    .catch((err) => {
        // Respond with 500 Internal Server Error and the error details
       return res.status(500).json({ error: err });
    });
    return res.status(202);
    // Sending a response back to the client
    // Sending a simple success message
}
export async function verifyPayment(req, res) {
    const paymentId = req.params.id;
    try {
        const response = await axios.get(`https://developers.flouci.com/api/verify_payment/${paymentId}`, {
            headers: {
                'Content-Type': 'application/json',
                'apppublic': process.env.FLOUCT_PUBLIC,
                'appsecret': process.env.FLOUCI_SECRET
            }
        });
        res.send(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("An error occurred while verifying payment.");
    }
}
