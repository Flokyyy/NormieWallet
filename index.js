const https = require('https');
const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const crypto = require('crypto');
const app = express();

const options = {
  key: fs.readFileSync('/home/key.pem'),
  cert: fs.readFileSync('/home/cert.pem'),
};

function decryptPrivateKey(encryptedPrivateKey, password) {
  const decipher = crypto.createDecipher('aes-256-cbc', password);
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'hex');
  decrypted += decipher.final('hex');

  return decrypted;
}

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  port: '3306',
  password: 'password',
  database: 'database'
});
let connected = false;

function handleDisconnect() {

const query = 'SELECT * FROM testwallets LIMIT 1'; //This is used to maintain the connection over a long period without requests. Change this to the table you are using to store the wallets!
  connection.query(query, (err, result) => {
    if (err) throw err;
  });

  connection.connect((err) => {
    if (err) {
      console.error(`Error connecting to database: ${err.message}`);
      setTimeout(handleDisconnect, 2000);
      return;
    }
    connected = true;
    console.log(`MySQL connection state: ${connection.state}`);
  });

  connection.on('error', (err) => {
    console.error(`MySQL connection error: ${err.message}`);
    if (!connected) {
      handleDisconnect();
    }
  });
}

setInterval(handleDisconnect, 3600000);


app.get('/getWallet', async (req, res) => {

    const secretPass = req.query.secret;
    	if (!secretPass ) {
	    res.status(500).send({ error: 'No token found' });
      return;
    }

    const userUUID = req.query.uuid;
    	if (!userUUID ) {
	    res.status(500).send({ error: 'No uuid found' });
      return;
    }

        connection.query(`SELECT WALLET FROM testwallets WHERE USER_ID='${userUUID}'`, (error, results) => {
        if (error) {
        res.status(500).send({ error: `Error while fetching wallet: ${error}` });
		    return;
        } else {
          if (results.length > 0) {
              console.log(`Wallet exists for user ID ${userUUID}`);
              results[0].CHAIN = "SOLANA";
   			      res.send({ results });
			        return;
         } else {

          const seed = nacl.randomBytes(32);
          const keyPair = Keypair.fromSeed(seed);
          const publicKey = keyPair.publicKey;
          const privateKey = keyPair.secretKey;
          const password = secretPass;

          // Encrypt wallet private key with the password hash as the encryption key
          const cipher = crypto.createCipher('aes256', password);
          let encrypted = cipher.update(privateKey, 'hex', 'hex');
          encrypted += cipher.final('hex');

          // Save encrypted wallet private key to file
          const walletJson = {
            privateKey: encrypted
          };
          fs.writeFileSync(`/home/testapi/${userUUID}.json`, JSON.stringify(walletJson));

         // Save wallet to database
         connection.query(`INSERT INTO testwallets (USER_ID, WALLET) VALUES ('${userUUID}', '${publicKey}')`, (error) => {
          if (error) {
              console.error(`Error while saving wallet to database: ${error}`);
              res.status(500).send({ error: `Error while saving wallet to database: ${error}` });
          } else {
              console.log(`Wallet saved to database for user ID ${userUUID}`);
              let response = {};
              response.results = [{}];
              response.results[0].WALLET = publicKey.toString();
              response.results[0].CHAIN = "SOLANA";
              res.send(response);                    
                      }
                                      });
                                  }
                              }
                          });
                      
                  
              });

        app.get('/send-solana-transaction', async (req, res) => {
        if (!req.query.receiver || !req.query.amount) {
          return res.status(400).send({ error: 'Missing required field: wallet, amount or token' });
        }

      

        const receiver = req.query.receiver;
        const amount = req.query.amount;

          // Check if the amount is a valid double
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
          res.send({ message: 'Invalid SOL amount' });
          return;
        }

        if(parsedAmount == 0 || parsedAmount == 0.0) {
          res.send({ message: 'Invalid SOL amount' });
          return; 
        }

        const secretPass = req.query.secret;
        if (!secretPass) {
        res.status(500).send({ error: 'No token found' });
        return;
      }

      const UUID = req.query.uuid;
        if (!UUID) {
        res.status(500).send({ error: 'No uuid found' });
        return;
      }

      fs.readFile(`/home/testapi/${UUID}.json`, 'utf8', (err, decryptedWallet) => {
        if (err) {
          res.status(500).send({ error: `Error reading wallet file: ${err}` });
          return;
        }
      
        const wallet = JSON.parse(decryptedWallet);

      if (!wallet) {
        res.status(500).send({ error: 'Wallet not found' });
        return;
      }

      (async () => {

        const web3 = require("@solana/web3.js");
        // Connect to cluster
        const connection = new web3.Connection(
          web3.clusterApiUrl("mainnet-beta"),
          "confirmed"
        );
      
         let decrypted;
    try {
      const privateKeyEncrypted = wallet.privateKey;
      const decipher = crypto.createDecipher("aes256", secretPass);
      decrypted = decipher.update(privateKeyEncrypted, "hex", "hex");
      decrypted += decipher.final("hex");
    } catch (error) {
      res.status(500).send({ error: `Error decrypting private key: Check your secret!` });
      return;
    }

    const seed = Buffer.from(decrypted, 'hex').slice(0, 32);
    const keyPair = Keypair.fromSeed(seed);
    const from = keyPair;
    const walletKey = receiver.toString();    
        
        // Add transfer instruction to transaction
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: walletKey,
            lamports: parsedAmount * web3.LAMPORTS_PER_SOL,
          })
          );

    try {
      const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [from],
      );
      console.log('Transaction success: ', signature);
      res.send({ message: 'Transaction success: ', signature});

      } catch (error) {
        res.send({ message: error.message});
      console.error('Transaction failed: ', error.message);
      }
      })();
    });
    });        
      
    https.createServer(options, app).listen(1111, () => {
      console.log('HTTPS REST API listening on port 1111');
    });