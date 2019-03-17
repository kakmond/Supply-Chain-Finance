/*
* Use this file for functional testing of your smart contract.
* Fill out the arguments and return values for a function and
* use the CodeLens links above the transaction blocks to
* invoke/submit transactions.
* All transactions defined in your smart contract are used here
* to generate tests, including those functions that would
* normally only be used on instantiate and upgrade operations.
* This basic test file can also be used as the basis for building
* further functional tests to run as part of a continuous
* integration pipeline, or for debugging locally deployed smart
* contracts by invoking/submitting individual transactions.
*/
/*
* Generating this test file will also trigger an npm install
* in the smart contract project directory. This installs any
* package dependencies, including fabric-network, which are
* required for this test file to be run locally.
*/

import * as assert from 'assert';
import * as fabricNetwork from 'fabric-network';
import * as yaml from 'js-yaml';
import * as fs from 'fs-extra';

describe('org.papernet.commercialpaper-papernet-js@0.0.4' , () => {

    const gateway: fabricNetwork.Gateway = new fabricNetwork.Gateway();
    const fabricWallet: fabricNetwork.FileSystemWallet = new fabricNetwork.FileSystemWallet(
        '/Users/kanchanok/.fabric-vscode/local_fabric/wallet');
    let identityName: string;
    let connectionProfile: any;

    before(async () => {
        const connectionProfilePath: string = '/Users/kanchanok/.vscode/extensions/ibmblockchain.ibm-blockchain-platform-0.2.1/basic-network/connection.json';

        const connectionProfileContents: any = await fs.readFile(connectionProfilePath, 'utf8');
        if (connectionProfilePath.endsWith('.json')) {
            connectionProfile = JSON.parse(connectionProfileContents);
        } else if (connectionProfilePath.endsWith('.yaml') || connectionProfilePath.endsWith('.yml')) {
            connectionProfile = yaml.safeLoad(connectionProfileContents);
        };

        const identities: fabricNetwork.IdentityInfo[] = await fabricWallet.list();
        // TODO: edit to use different identities in wallet
        identityName = identities[0].label;

    });

    beforeEach(async () => {
        const connectOptions: fabricNetwork.GatewayOptions = {
            discovery: {
                asLocalhost: true,
            },
            identity: identityName,
            wallet: fabricWallet,
        };
        await gateway.connect(connectionProfile, connectOptions);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    it('createContext', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('createContext', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    it('instantiate', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('instantiate', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    it('showallissue', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('showallissue', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    it('issue', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('issue', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    it('buy', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('buy', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    it('redeem', async () => {
        // TODO: Update with parameters of transaction
        const args: string[] = [''];

        const response: Buffer = await submitTransaction('redeem', args);
        // submitTransaction returns buffer of transcation return value
        // TODO: Update with return value of transaction
        assert.equal(true, true);
        // assert.equal(JSON.parse(response.toString()), undefined);
    }).timeout(10000);

    async function submitTransaction(functionName: string, args: string[]): Promise<Buffer> {
        // Submit transaction

        const network: fabricNetwork.Network = await gateway.getNetwork('mychannel');
        const contract: fabricNetwork.Contract = await network.getContract('papernet-js');

        const responseBuffer: Buffer = await contract.submitTransaction(functionName, ...args);
        return responseBuffer;
    }

});
