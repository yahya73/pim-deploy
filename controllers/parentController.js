import UserModel from "../models/User.js";
import User from "../models/User.js"
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//import { AccountId, AccountRecordsQuery } from "@hashgraph/sdk";
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails
import { TokenCreateTransaction,AccountInfoQuery, TokenType, AccountId,TokenSupplyType, AccountRecordsQuery,TokenMintTransaction, Client,TokenAssociateTransaction, TransferTransaction, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, Mnemonic } from "@hashgraph/sdk";
import { google } from 'googleapis';
import {  } from "@hashgraph/sdk";
import { sendVerificationEmail } from './EmailVerificationController.js'
import { decryptText,encryptText,createchildinblockchain,transformString } from "./UserController.js";
import {
    HDNode as ethersHdNode,
  } from '@ethersproject/hdnode';

import bip39 from 'bip39';
import hdkey from 'hdkey';
import dotenv from 'dotenv';
import identifiers from "../models/identifiers.js";
dotenv.config();
const accountIdString = process.env.ACCOUNT_ID;
const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;

const operatorAccountId = AccountId.fromString(accountIdString);
const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);

export const registerParent = async (req, res) => {
    try {
        const { username, email, password, phoneNumber, nfcIds } = req.body;
      
        // Verify if the parent exists already
        const existingParent = await UserModel.findOne({ username });

        if (existingParent) {
            return res.status(400).json({ message: "User already exists", parent: existingParent });
        }        

        const existingEmail = await UserModel.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: "User with this email already exists" });
        }  

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newParent = new UserModel({
            username,
            email,
            password: hashedPassword,
            role: 'parent',
            image: 'default image', 
            phoneNumber,
            adressblockchain: "", 
            prohibitedProductTypes: ['type1', 'type2'],
            verified: false,
            first_time: true
        });

        const parent = await newParent.save();

        // Create tokens for each NFC ID
        const tokenIds = [];
        for (const nfcId of nfcIds) {
            const tokenId = await createNFTWithNfcTag(nfcId);
            tokenIds.push(tokenId);
            
            // Create identifier associating NFC ID with token ID and parent
            const identifier = new identifiers({
                nfc_id: nfcId,
                nft_id: tokenId,
                parent_id: parent._id
            });
            await identifier.save();
        }
       
        res.status(200).json({ parent, tokenIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// Function to generate a mnemonic phrase
const generateMnemonic = () => {
    return Mnemonic.generate();
};

export async function updateFirstTime(req, res) {
    try {
        const { userId } = req.params; // Assuming userId is passed as a URL parameter
        const user = await UserModel.findByIdAndUpdate(userId, { first_time: false }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Function to generate keys from a mnemonic phrase
export async function generateKeysFromMnemonic(mnemonic)  {
   /* const hdNodeRoot = ethersHdNode.fromMnemonic(mnemonic);
    const accountHdPath = `m/44'/60'/0'/0/0`;
    const hdNode = hdNodeRoot.derivePath(accountHdPath);
  */
 
 const memonic2 = await Mnemonic.fromString(mnemonic.toString());

const privateKey = await memonic2.toStandardEd25519PrivateKey();
    // At this point the account technically does not yet exist,
    // and will need to be created when it receives its first transaction (later).
    // Convert the private key to string format as well as an EVM address.
    //const privateKey = PrivateKey.fromStringECDSA(hdNode.privateKey);
   // const privateKey = Mnemonic.fromString(mnemonic).toPrivateKey();
    const publicKey = privateKey.publicKey;
    
    return { privateKey, publicKey };
};

// Function to reset keys and return the new keys and phrase
const resetKeys = () => {
    const mnemonic = Mnemonic.generate12();
    
    const { privateKey, publicKey } = generateKeysFromMnemonic(mnemonic);
    return { mnemonic, privateKey, publicKey };
};

export const createHederaAccount = async () => {
    try {
        // Grab your Hedera testnet account ID and private key from your .env file
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);

        // If we weren't able to grab it, we should throw a new error
        if (myAccountId == null || myPrivateKey == null) {
            throw new Error(
                "Environment variables myAccountId and myPrivateKey must be present"
            );
        }

        // Create your connection to the Hedera Network
        const client = Client.forTestnet();
        client.setOperator(myAccountId, myPrivateKey);

        // Create new keys
        const newAccountPrivateKey = await PrivateKey.generate();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;

        // Create a new account with 1,000 tinybar starting balance
        const transactionResponse = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(Hbar.fromTinybars(1000))
            .execute(client);

        // Get the new account ID from the transaction receipt
        const newAccountId = (await transactionResponse.getReceipt(client)).accountId;

        // Verify the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        let bcAccountId = "" + newAccountId
        // Generate mnemonic phrase for the new account
        const mnemonic = generateMnemonic();
       

        return { accountId: bcAccountId, mnemonic: await(mnemonic), balance: accountBalance.hbars.toTinybars().toString() };
    } catch (error) {
        throw new Error("Error creating Hedera account: " + error.message);
    }
};



export const getAccountDetails = async (req, res) => {
    try {
        const { accountId } = req.body;

        // Validate the input accountId
        if (!accountId) {
            return res.status(400).json({ message: "AccountId is required" });
        }

        // Initialize your Hedera client configuration
        const client = Client.forTestnet(); // or Client.forMainnet() based on your use case

        // Use your environment variables or another method to authenticate
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = PrivateKey.fromStringECDSA(process.env.MY_PRIVATE_KEY);
        client.setOperator(myAccountId, myPrivateKey);

        // Fetch the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        const balanceInHbars = accountBalance.hbars.toTinybars();

        res.status(200).json({
            message: "Account details fetched successfully",
            accountId: accountId,
            balanceInHbars,
        });
    } catch (error) {
        console.error("Error fetching account details:", error);
        res.status(500).json({ message: "Error fetching account details" });
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


//get child's transactions 
export async function getChildTransactionHistory(req, res) {
    const parentId = req.params.parentId; // Assuming the parent's ID is passed as a URL parameter

    try {
        // Find the child user by parentId
        const child = await User.findOne({ parentid: parentId, role: 'child' });

        if (!child) {
            return res.status(404).json({ error: "Child not found" });
        }

        const accountId = child.Adressblockchain; // Assuming this is where the Hedera account ID is stored
        const recordsQuery = new AccountRecordsQuery()
            .setAccountId(AccountId.fromString(accountId));

        const records = await recordsQuery.execute(client);
        const transactions = records.map(record => ({
            transactionId: record.transactionId.toString(),
            status: record.receipt.status.toString(),
            timestamp: record.consensusTimestamp.toString(),
            memo: record.transactionMemo,
        }));

        res.json({ accountId: accountId, transactions: transactions });
    } catch (error) {
        console.error("Error retrieving child transaction history:", error);
        res.status(500).json({ error: error.toString() });
    }
}



function isValidMnemonic(mnemonic) {
    if (!bip39.validateMnemonic(mnemonic)) {
        return false;
    }
    return true;
}
export const forgetKeys = async (req, res) => {
    const mnemonic = req.body.mnemonic
    try {
        //const mnemonic = "put patch iron feed rocket peanut group embark field twice cover inform";

        if (isValidMnemonic(mnemonic)) {
            console.log("Valid mnemonic");
        }
        const hdNodeRoot = ethersHdNode.fromMnemonic(mnemonic);
    
        const accountHdPath = `m/44'/60'/0'/0/0`;
        const hdNode = hdNodeRoot.derivePath(accountHdPath);
        const privateKey = PrivateKey.fromStringECDSA(hdNode.privateKey);
        const aliasAccountId = privateKey.publicKey.toAccountId(0, 0);
        console.log(`- New account ID: ${aliasAccountId.toString()}`);
        const accountId =await getAccountIdByAlias(client, aliasAccountId);
        const aa = privateKey.toString('hex')
        //0.0.4327773
        res.status(200).json({ privateKey: aa });
    } catch (error) {
        console.error('Error recovering keys:', error);
        res.status(500).json({ message: 'Error recovering keys from mnemonic' });
    }
};
export const loginwithsecretkey = async (req, res) => {
    const mnemonic = req.body.mnemonic
    const fcmtoken = req.body.fcmtoken;
    try {
        //const mnemonic = "put patch iron feed rocket peanut group embark field twice cover inform";

        if (isValidMnemonic(mnemonic)) {
            console.log("Valid mnemonic");
        }
        const hdNodeRoot = ethersHdNode.fromMnemonic(mnemonic);
    
        const accountHdPath = `m/44'/60'/0'/0/0`;
        const hdNode = hdNodeRoot.derivePath(accountHdPath);
        const privateKey = PrivateKey.fromStringECDSA(hdNode.privateKey);
        const aliasAccountId = privateKey.publicKey.toAccountId(0, 0);
        console.log(`- New account ID: ${aliasAccountId.toString()}`);
        const accountId =await getAccountIdByAlias(client, aliasAccountId);
        const aa = privateKey.toString('hex');
        
        //0.0.4327773
        console.log( accountId.toString());
        console.log(aa);
        var user = await  User.findOne({adressblockchain : accountId.toString()});
        if(user){
            console.log(user)
            if (fcmtoken && !user.fcmtokens.includes(fcmtoken)) {
                user.fcmtokens.push(fcmtoken); // Add fcmtoken to the array
              }
              if (user.fcmtokens.includes(fcmtoken)) {
                console.log("token already exists"); // Add fcmtoken to the array
              } 
              const key =  await transformString(user.username);
              const encrypted = encryptText(aa,key);
              // Save the updated user objectt
              await user.save();
              user = user.toObject();

              user.privatekey = encrypted;
              console.log(user)
              res.status(200).json(user);
        //tragic smart switch cabin method cheese extra about good use divide wood
      
        }
    } catch (error) {
        console.error('Error recovering keys:', error);
        res.status(500).json({ message: 'Error recovering keys from mnemonic' });
    }
};
export async function getAccountIdByAlias (client, aliasAccountId){
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(aliasAccountId)
        .execute(client);
   
    return accountInfo.accountId;
}
export async function createNFT(tokenName, tokenSymbol, treasuryAccountId, adminPrivateKey) {

    //treasuryAccountId is the the account where the token will be stored (aka the user's blockchain id)

    try {
        const accountIdString = process.env.ACCOUNT_ID;
        const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;

        const operatorAccountId = AccountId.fromString(accountIdString);
        const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

        const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);

        // Create the NFT
        const nftCreate = await new TokenCreateTransaction()
            .setTokenName(tokenName)
            .setTokenSymbol(tokenSymbol)
            .setTokenType(TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(operatorAccountId)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(1) // For NFTs, typically the maximum supply is 1
            .setSupplyKey(operatorPrivateKey)
            .freezeWith(client);

        // Sign the transaction with the private key
        const nftCreateTxSign = await nftCreate.sign(operatorPrivateKey);

        // Submit the transaction to the Hedera network
        const nftCreateSubmit = await nftCreateTxSign.execute(client);

        // Get the transaction receipt
        const nftCreateRx = await nftCreateSubmit.getReceipt(client);

        // Get the token ID
        const tokenId = nftCreateRx.tokenId;

        console.log(`NFT created with Token ID: ${tokenId}`);

        return tokenId; // Return the token ID
    } catch (error) {
        console.error("Error creating NFT:", error);
        throw new Error("Error creating NFT: " + error.message);
    }
}

export async function mintNFT(tokenId, nfcTagId, metadata, adminPrivateKey) {
    try {
        const accountIdString = process.env.ACCOUNT_ID;
        const privateKeyString = process.env.ACCOUNT_PRIVATE_KEY;

        const operatorAccountId = AccountId.fromString(accountIdString);
        const operatorPrivateKey = PrivateKey.fromString(privateKeyString);

        const client = Client.forTestnet().setOperator(operatorAccountId, operatorPrivateKey);
        const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));
        // Max transaction fee as a constant (adjust as necessary)
        const maxTransactionFee =  new Hbar(50);

        // MINT NEW NFT
        const mintTx = new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata(metadataBytes) // The metadata containing NFC tag ID and other information
            .setMaxTransactionFee(maxTransactionFee)
            .freezeWith(client);

        // Sign the transaction with the supply key
        const mintTxSign = await mintTx.sign(operatorPrivateKey);

        // Submit the transaction to the Hedera network
        const mintTxSubmit = await mintTxSign.execute(client);

        // Get the transaction receipt
        const mintRx = await mintTxSubmit.getReceipt(client);

        // Log the NFC tag ID along with the minted NFT
        console.log(`NFT minted with Token ID ${tokenId} and associated NFC tag ID: ${nfcTagId}`);

        // Return the transaction receipt (optional)
        return mintRx;
    } catch (error) {
        
        throw new Error("Error minting NFT: " + error.message);
    }
}

async function executeTransaction(transaction, key) {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const txSign = await transaction.sign(key);
        const txSubmit = await txSign.execute(client);
        const txReceipt = await txSubmit.getReceipt(client);
  
        // If the transaction succeeded, return the receipt
        return txReceipt;
      } catch (err) {
        // If the error is BUSY, retry the transaction
        if (err.toString().includes('BUSY')) {
          retries++;
          console.log(`Retry attempt: ${retries}`);
        } else {
          // If the error is not BUSY, throw the error
          throw err;
        }
      }
    }
    throw new Error(`Transaction failed after ${MAX_RETRIES} attempts`);
  }

function createNfcMetadata(name) {
    try {
        // Create metadata object
        const metadata = {
            name: name,
        };

        // Convert metadata object to JSON
        const metadataJSON = JSON.stringify(metadata);

        return metadataJSON;
    } catch (error) {
        console.error("Error creating NFC metadata:", error);
        throw new Error("Error creating NFC metadata: " + error.message);
    }
}

export async function createNFTWithNfcTag(nfcTagId) {
    try {
        const treasuryId = operatorAccountId;
        const treasuryKey = operatorPrivateKey;
        const nfctag = nfcTagId.toString()
      //  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
        
        const supplyKey = PrivateKey.generate();
     
            //Create the NFT
            const nftCreate = await new TokenCreateTransaction()
              .setTokenName(nfctag)
              .setTokenSymbol("Bracelet")
              .setTokenType(TokenType.NonFungibleUnique)
              .setDecimals(0)
              .setInitialSupply(0)
              .setTreasuryAccountId(treasuryId)
              .setSupplyType(TokenSupplyType.Finite)
              .setMaxSupply(1)
              .setSupplyKey(supplyKey)
              .freezeWith(client);
          
            //Sign the transaction with the treasury key
            const nftCreateTxSign = await nftCreate.sign(treasuryKey);
          
            //Submit the transaction to a Hedera network
            const nftCreateSubmit = await nftCreateTxSign.execute(client);
          
            //Get the transaction receipt
            const nftCreateRx = await nftCreateSubmit.getReceipt(client);
          
            //Get the token ID
            const tokenId = nftCreateRx.tokenId;
          
            //Log the token ID
            console.log(`- Created NFT with Token ID: ${tokenId} \n`);
          
            // Max transaction fee as a constant
            const maxTransactionFee = new Hbar(20);
          
            //IPFS content identifiers for which we will create a NFT
            const CID = [
              Buffer.from(
                nfcTagId.toString()
              )
            ];
           
            // MINT NEW BATCH OF NFTs
            const mintTx = new TokenMintTransaction()
              .setTokenId(tokenId)
              .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
              .setMaxTransactionFee(maxTransactionFee)
              .freezeWith(client);
          
            //Sign the transaction with the supply key
            const mintTxSign = await mintTx.sign(supplyKey);
          
            //Submit the transaction to a Hedera network
            const mintTxSubmit = await mintTxSign.execute(client);
          
            //Get the transaction receipt
            const mintRx = await mintTxSubmit.getReceipt(client);
          
            //Log the serial number
            console.log(
              `- Created NFT ${tokenId} with serial: ${mintRx.serials[0].low} \n`
            );
          
            //Log the serial number
           
            //await transferNft( tokenId, client, treasuryId, treasuryKey);


        // // Step 1: Create the NFT
        // const tokenId = await createNFT(tokenName, tokenSymbol, treasuryAccountId, adminPrivateKey);

        // // Step 2: Generate metadata with NFC tag ID
        // const metadata = createNfcMetadata(nfcTagId);
        // console.log(metadata)

        // // Step 3: Mint the NFT with associated NFC tag ID
        // const mintReceipt = await mintNFT(tokenId, nfcTagId, metadata, adminPrivateKey);

        return(tokenId.toString())
    } catch (error) {
        console.log(error)
    }
}

export async function transferNft(tokenId, client, aliceId1, aliceKey1) {
    const aliceId = AccountId.fromString(aliceId1);
    const aliceKey = PrivateKey.fromString(aliceKey1);
 try{
    //Create the associate transaction and sign with Alice's key
    const associateAliceTx = await new TokenAssociateTransaction()
    .setAccountId(aliceId)
    .setTokenIds([tokenId])
    .freezeWith(client)
    .sign(aliceKey);

  //Submit the transaction to a Hedera network
  const associateAliceTxSubmit = await associateAliceTx.execute(client);

  //Get the transaction receipt
  const associateAliceRx = await associateAliceTxSubmit.getReceipt(client);

  //Confirm the transaction was successful
  console.log(
    `- NFT association with Alice's account: ${associateAliceRx.status}\n`
  );

  // Check the balance before the transfer for the treasury account


  // Check the balance before the transfer for Alice's account
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(aliceId)
    .execute(client);
  console.log(
    `- Alice's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );

  // Transfer the NFT from treasury to Alice
  // Sign with the treasury key to authorize the transfer
  const tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(tokenId, 1, operatorAccountId, aliceId)
    .freezeWith(client)
    .sign(operatorPrivateKey);

  const tokenTransferSubmit = await tokenTransferTx.execute(client);
  const tokenTransferRx = await tokenTransferSubmit.getReceipt(client);

  console.log(
    `\n- NFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`
  );

  // Check the balance of the treasury account after the transfer


  // Check the balance of Alice's account after the transfer
  var balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(aliceId)
    .execute(client);
  console.log(
    `- Alice's balance: ${balanceCheckTx.tokens._map.get(
      tokenId.toString()
    )} NFTs of ID ${tokenId}`
  );
}
catch(error){
    console.log(error);
}
}