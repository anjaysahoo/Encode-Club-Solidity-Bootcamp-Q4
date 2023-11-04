import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Ballot, Ballot__factory } from "../typechain-types";
dotenv.config();

async function main() {
    const parameters = process.argv.slice(2);
    if (!parameters || parameters.length < 2) {
        throw new Error("Contract address and delegate address not provided");
    }

    const contractAddress = parameters[0];
    const delegateAddress = parameters[1];

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

    // Call the delegate function to delegate the vote
    const tx = await ballotContract.delegate(delegateAddress);
    const receipt = await tx.wait();
    console.log(`Transaction completed ${receipt?.hash}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
