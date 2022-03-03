import { Command } from "commander";
import { sign } from "./main";

const program = new Command();

program
  .name("signer")
  .description("CLI to sign pass for whitelist minting")
  .version("0.0.1");

program
  .command("sign")
  .description("Sign account addresses")
  .requiredOption(
    "-i, --input <file>",
    "input file path containing addresses"
  )
  .requiredOption(
    "-k, --private-key <string>",
    "private key used for signing message"
  )
  .requiredOption(
    "-o, --output <file>",
    "output file path containing list of signed message",
    "signatures.json"
  )
  .action(sign);

program.parseAsync(process.argv);
