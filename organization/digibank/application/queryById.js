/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to query commercial paper history
 * 5. Submit query transactions
 * 6. Process responses that are returned (eg display, render in a browser etc)
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('../identity/user/balaji/wallet');
const yaml = require('js-yaml');


// Main program function
async function main() {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {
        // Specify userName for network access
        const userName = 'Admin@org1.example.com';
        // path below is variable
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:false, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.commercialpaper smart contract.');

        const contract = await network.getContract('papercontract', 'org.papernet.commercialpaper');

        console.log(' ');
        console.log('Calling queryHist to get the history of Transaction instance');
        console.log('=======================================================================');
        // QUERY the history of a transaction providing it the Issuer/paper number combo below
        const queryResponse = await contract.submitTransaction('queryHist', 'MagnetoCorp', '00016');
        //let queryresult = CommercialPaper.fromBuffer(queryResponse);

        var decodedString = String.fromCharCode.apply(null, new Uint8Array(queryResponse));
        var tempQueryRes = JSON.parse(decodedString);
        tempQueryRes.forEach(element => {
            console.log('============================================');
            console.log('TxId: ' + element.TxId)
            console.log('Paper Number: ' + element.Value.paperNumber)
            console.log('Timestamp: ' + element.Timestamp)
            console.log('Issuer: ' + element.Value.issuer)
            console.log('Created By ' + element.Value.creator)
            if(element.Value.currentState == 1){
                console.log('Current State: ISSUED')
            }
            else if(element.Value.currentState == 2){
                console.log('Current State: APPROVED')
                console.log('Buyer: ' + element.Value.buyer)
            }
            else if(element.Value.currentState == 3){
                console.log('Current State: TRADING')
                console.log('Buyer: ' + element.Value.buyer)
            }
            else if(element.Value.currentState == 4){
                console.log('Current State: REDEEMED')
                console.log('Buyer: ' + element.Value.buyer)
            }
            console.log('Issue Date Time: ' + element.Value.issueDateTime)
            console.log('Price: ' + element.Value.faceValue)
            console.log('Maturity Date Time: ' + element.Value.maturityDateTime)
         });

        console.log('============================================ End of Queries ============================================');
        console.log(' ');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('Query program complete.');

}).catch((e) => {

    console.log('Issue program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
