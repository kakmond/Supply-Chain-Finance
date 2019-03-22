/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const CommercialPaper = require('./paper.js');
const PaperList = require('./paperlist.js');
const QueryUtils = require('./query.js');

/**
 * A custom context provides easy access to list of all papers
 */
class CommercialPaperContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.paperList = new PaperList(this);
    }

}

/**
 * Define invoice paper smart contract by extending Fabric Contract class
 *
 */
class CommercialPaperContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.papernet.commercialpaper');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new CommercialPaperContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * Issue invoice paper
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} issueDateTime paper issue date
     * @param {Integer} faceValue face value of paper
    */
    async issue(ctx, issuer, paperNumber, issueDateTime, maturityDateTime, faceValue) {
        // create an instance of the paper
        let paper = CommercialPaper.createInstance(issuer, paperNumber, issueDateTime, maturityDateTime, faceValue);

        // Smart contract, rather than paper, moves paper into ISSUED state
        paper.setIssued();

        // Newly issued paper is owned by the issuer
        paper.setIssuer(issuer);

        // Add the invoking CN, to the Paper state for reporting purposes later on
        let invokingId = await this.getInvoker(ctx);
        paper.setCreator(invokingId);

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.addPaper(paper);

        // Must return a serialized paper to caller of smart contract
        return paper.toBuffer();
    }

    /**
     * approve invoice
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} buyer trader of paper
    */
    async approve(ctx, issuer, paperNumber, buyer) {
        // Retrieve the current paper using key fields provided
        let paperKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);
    
        // Validate current owner
        if (paper.getIssuer() !== issuer) {
            throw new Error('Paper ' + issuer + paperNumber + ' is not owned by ' + issuer);
        }
    
        // First buy moves state from ISSUED to APPROVED
        if (paper.isIssued()) {
            paper.setApproved();
        }
    
        // Check paper is APPROVED
        if (paper.isApproved()) {
            paper.setBuyer(buyer);
        } else {
            throw new Error('Paper ' + issuer + paperNumber + ' is not approved. Current state = ' + paper.getCurrentState());
        }
    
        // Update the paper
        await ctx.paperList.updatePaper(paper);
        return paper.toBuffer();
    }

    /**
     * Buy invoice
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer commercial paper issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} trader trader of paper
    */
    async trade(ctx, issuer, paperNumber, trader) {

        // Retrieve the current paper using key fields provided
        let paperKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate current owner
        if (paper.getIssuer() !== issuer) {
            throw new Error('Paper ' + issuer + paperNumber + ' is not owned by ' + issuer);
        }

        // First buy moves state from APPROVE to TRADING
        if (paper.isApproved()) {
            paper.setTrading();
        }

        // Check paper is TRADING
        if (paper.isTrading()) {
            paper.setTrader(trader)
        } else {
            throw new Error('Paper ' + issuer + paperNumber + ' is not trading. Current state = ' + paper.getCurrentState());
        }

        // Update the paper
        await ctx.paperList.updatePaper(paper);
        return paper.toBuffer();
    }

    /**
     * Redeem invoice
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer invoice issuer
     * @param {Integer} paperNumber paper number for this issuer
     * @param {String} redeemingOwner redeeming owner of paper
     * @param {String} redeemDateTime time paper was redeemed
    */
    async redeem(ctx, issuer, paperNumber, redeemingOwner, redeemDateTime) {

        let paperKey = CommercialPaper.makeKey([issuer, paperNumber]);

        let paper = await ctx.paperList.getPaper(paperKey);

        // Check paper is not REDEEMED
        if (paper.isRedeemed()) {
            throw new Error('Paper ' + issuer + paperNumber + ' already redeemed');
        }

        // Verify that the redeemer owns the commercial paper before redeeming it
        if (paper.getBuyer() === redeemingOwner) {
            paper.setRedeemed();
        } else {
            throw new Error('Redeeming owner does not own paper' + issuer + paperNumber);
        }

        await ctx.paperList.updatePaper(paper);
        return paper.toBuffer();
    }


    /**
    * grab the invoking CN from the X509 transactor cert
    * @param {Context} ctx the transaction context
    */

    async getInvoker(ctx) {

        // Use the Client Identity object to get the invoker info.
        let cid = ctx.clientIdentity;
        let id = cid.getID(); // X509 Certificate invoker is in CN form
        let CN = id.substring(id.indexOf("CN=") + 3, id.lastIndexOf("::"));
        return CN;
    }

    /**
    * queryHist commercial paper
    * @param {Context} ctx the transaction context
    * @param {String} issuer commercial paper issuer
    * @param {Integer} paperNumber paper number for this issuer
    */
    async queryHist(ctx, issuer, paperNumber) {
        // Get a key to be used for History query
        let cpKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let myObj = new QueryUtils(ctx, 'org.papernet.commercialpaperlist');
        let results = await myObj.getHistory(cpKey);
        //console.log('main: queryHist was called and returned ' + JSON.stringify(results) );
        return results;

    }

    /**
    * queryOwner commercial paper
    * @param {Context} ctx the transaction context
    * @param {String} issuer commercial paper issuer
    */
    async queryOwner(ctx, owner) {
        // Get a key to be used for the paper, and get this from world state
        // let cpKey = CommercialPaper.makeKey([issuer, paperNumber]);
        let myObj = new QueryUtils(ctx, 'org.papernet.commercialpaperlist');
        let owner_results = await myObj.queryKeyByOwner(owner);
        return owner_results;
    }

}

module.exports = CommercialPaperContract;
