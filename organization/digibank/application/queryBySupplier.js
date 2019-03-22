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

        // query the OWNER of a commercial paper
        console.log(' ');
        console.log('Calling queryOwner to get all MagnetoCorp transactions');
        console.log('==========================================================================');
        const queryResponse2 = await contract.submitTransaction('queryOwner', 'MagnetoCorp');

        // console.log('the query by OWNER response is ' + queryResponse2);

        var decodedString = String.fromCharCode.apply(null, new Uint8Array(queryResponse2));
        var tempQueryRes2 = JSON.parse(decodedString);
        tempQueryRes2.forEach(element => {
            var paperNumber = element.Record.paperNumber
            var issuer = element.Record.issuer
            var createdBy = element.Record.creator
            var state = (element.Record.currentState)
            var issueDateTime = element.Record.issueDateTime
            var price = element.Record.faceValue
            var maturityDateTime = element.Record.maturityDateTime

            console.log('============================================');
            console.log('Paper Number: ' + paperNumber)
            console.log('Issuer: ' + issuer)
            console.log('Created By ' + createdBy)

            if(state == 1){
                console.log('Current State: ISSUED')
            }
            else if(state == 2){
                console.log('Current State: APPROVED')
                var buyer = element.Record.buyer
                console.log('Buyer: ' + buyer)
            }
            else if(state == 3){
                console.log('Current State: TRADING')
                var buyer = element.Record.buyer
                console.log('Buyer: ' + buyer)
            }
            else if(state == 4){
                console.log('Current State: REDEEMED')
                var buyer = element.Record.buyer
                console.log('Buyer: ' + buyer)
            }
            console.log('Issue Date Time: ' + issueDateTime)
            console.log('Price: ' + price)
            console.log('Maturity Date Time: ' + maturityDateTime)

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
