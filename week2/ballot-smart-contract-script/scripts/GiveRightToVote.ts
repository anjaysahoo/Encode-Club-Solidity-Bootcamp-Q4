import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot, Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 1) {
        throw new Error("Contract address not provided");
    }

    const contractAddress = parameters[0];
    const voterAddress = parameters[1]; // The address you want to give voting rights to

    //Configuring wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
    console.log(`Using address ${wallet.address}`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${balance} ETH`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }


    // Attach the smart contract using Typechain
    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

    // Call the giveRightToVote function to give voting rights
    const tx = await ballotContract.giveRightToVote(voterAddress);
    const receipt = await tx.wait();
    console.log(`Transaction completed ${receipt?.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
