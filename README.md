# NormieWallet
Are you tired of seeing new users struggle with the process of signing up for your web3 application? The traditional approach of creating a wallet and connecting to it via a wallet provider can be daunting and confusing, especially for those who are new to the world of crypto. That's where our REST API solution comes in.

Built on Solana, our REST API provides a streamlined and user-friendly experience for creating a crypto wallet, getting wallet information, encrypting user passwords, and sending SOL over the mainnet. Our API can be easily implemented into any web3 application, making it an ideal solution for developers who want to provide a seamless user experience.

Here are some key features of our API:

Wallet Creation: With our API, new users can easily create a SOL wallet without the need for a wallet provider like Metamask or Coinbase Wallet.

Wallet Info Retrieval: Our API makes it easy to retrieve wallet information such as public keys and balances.

Password Encryption: Our API provides a secure way to encrypt user passwords, ensuring that their personal information is protected.

Mainnet SOL Transactions: Users can easily send SOL over the mainnet, making it easy to participate in any Solana-based web3 application.

Our API is highly customizable and can be tailored to fit the unique needs of any web3 application. Whether you're building a decentralized finance platform, a new blockchain game, or any other web3 application, our API can help simplify the user experience and remove barriers for new users entering the world of crypto.

Don't let a clunky sign-up process discourage new users from joining your web3 community. Try our REST API solution today and see how easy it can be to onboard new users and provide a seamless user experience.

# How does it work?
The project is built using the Express framework for Node.js. It provides two API endpoints /getWallet and /send-solana-transaction to create and manage wallets on the Solana blockchain.

When a user requests a wallet, the API generates a new key pair using Keypair from @solana/web3.js. The private key is encrypted with a user-provided password using the crypto module and saved to disk as a JSON file. The public key is stored in a MySQL database for future reference. The wallet's public key is returned to the user in the API response.

When a user sends SOL tokens from their wallet, the API retrieves the encrypted private key from the user's JSON file and decrypts it with the user-provided password. It then uses the @solana/web3.js library to create and sign a transaction that transfers the specified amount of SOL to the receiver's wallet. Finally, the API broadcasts the transaction to the Solana network.

# Code overview
The project uses the following modules:
```
const https = require('https');
const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const crypto = require('crypto');
const app = express();
```
The app object is an instance of the express module, which provides the HTTP server and routing functionalities.

The two endpoints are implemented in the following functions:

```
app.get('/getWallet', async (req, res) => {
    // ...
});
```

```app.get('/send-solana-transaction', async (req, res) => {
    // ...
});
```

- The /getWallet function generates a new key pair and saves the encrypted private key to a JSON file on disk. It then stores the public key in a MySQL database and returns it in the API response.

- The /send-solana-transaction function retrieves the encrypted private key from the user's JSON file, decrypts it with the user-provided password, and uses the @solana/web3.js library to sign and broadcast a transaction to transfer SOL tokens to the specified wallet.

# Getting started
To get started with contributing to SOL Trek, clone this repository and run the following commands:

npm install
npm start

Before running the application, ensure that you have the following dependencies installed:

```Node.js
npm
MySQL database
```
Also, make sure to set up your MySQL database and provide the necessary credentials in the index.js file and activate a vaild SSL certificate into:
```
key: fs.readFileSync('/home/key.pem'),
cert: fs.readFileSync('/home/cert.pem')
```

Finally, you can test the API by sending requests to https://localhost:1111/getWallet and https://localhost:1111/send-solana-transaction.
