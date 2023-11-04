import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import {Ballot__factory} from "../typechain-types";
dotenv.config();

async function main() {
    const proposals = process.argv.slice(2);
    if (!proposals || proposals.length < 1)
        throw new Error("Proposals not provided");
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });

    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = await ballotFactory.deploy(
        proposals.map(ethers.encodeBytes32String)
    );
    await ballotContract.waitForDeployment();
    console.log(`Contract deployed to ${ballotContract.target}`);
    for (let index = 0; index < proposals.length; index++) {
        const proposal = await ballotContract.proposals(index);
        const name = ethers.decodeBytes32String(proposal.name);
        console.log({ index, name, proposal });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
