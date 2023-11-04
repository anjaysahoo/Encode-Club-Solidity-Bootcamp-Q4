import { ethers } from "ethers";
import * as dotenv from 'dotenv';
import {Ballot, Ballot__factory} from "../typechain-types";
dotenv.config();

async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1) {
        throw new Error("Contract address not provided");
    }

    const contractAddress = parameters[0];

    //Confiuring wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    //Attaching the smart contract using Typechain
    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

    // Call the winnerName function to get the name of the winning proposal
    const winnerName = await ballotContract.winnerName();
    console.log(`The name of the winning proposal is ${winnerName}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
