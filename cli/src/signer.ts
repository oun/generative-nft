import { ethers } from "ethers";
import fs from 'fs/promises';

export async function sign(): Promise<void> {
  try {
    const { privateKey, input, output } = this.opts();
    console.log(`Reading addresses from: ${input}`);
    const wallet = new ethers.Wallet(privateKey);
    const signatures = [];
    for (const account of await readAccountsFromFile(input)) {
      const hash = Buffer.from(
        ethers.utils.solidityKeccak256(['address'], [account]).slice(2),
        'hex'
      );
      const signature = await wallet.signMessage(hash);
      signatures.push({ account, signature });
    }
    console.log(`Writing signatures to: ${output}`);
    await fs.writeFile(output, JSON.stringify(signatures, null, 2));
  } catch (error) {
    console.log(`Error signing pass:`, error);
  }
}

async function readAccountsFromFile(inputFile: string): Promise<Array<string>> {
  const raw = await fs.readFile(inputFile);
  return JSON.parse(raw.toString()) as Array<string>;
}