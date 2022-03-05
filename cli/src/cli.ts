import { Command } from 'commander';
import {
    createImages,
    createMetadata, generate
} from './generator';
import { sign } from './signer';
import { uploadDirectory } from './uploader';

const program = new Command();

program.name('cli').description('NFT CLI utilities').version('0.0.1');

program
  .command('generate')
  .description('Generate collectibles')
  .requiredOption(
    '-c, --config <file>',
    'path to configuration file',
    'config.json'
  )
  .requiredOption(
    '-n, --limit <number>',
    'number of collectibles to create',
    '10'
  )
  .requiredOption(
    '-o, --output <file>',
    'output file',
    'build/collectibles.json'
  )
  .action(generate);

program
  .command('create-images')
  .description('Create NFT images')
  .requiredOption(
    '-c, --config <file>',
    'path to configuration file',
    'config.json'
  )
  .requiredOption(
    '-s, --source <file>',
    'path to generated collectibles file',
    'build/collectibles.json'
  )
  .requiredOption(
    '-o, --output-directory <dir>',
    'output directory',
    'build/images'
  )
  .action(createImages);

program
  .command('create-metadata')
  .description('Create metadata')
  .requiredOption(
    '-c, --config <file>',
    'path to configuration file',
    'config.json'
  )
  .requiredOption(
    '-s, --source <file>',
    'path to generated collectibles file',
    'build/collectibles.json'
  )
  .option('-u, --unreveal', 'unreveal flag')
  .requiredOption(
    '-p, --image-path <path>',
    'if unreveal flag is true, this is full path to unrevealed image. Otherwise path prefix to image'
  )
  .requiredOption(
    '-o, --output-directory <dir>',
    'output directory',
    'build/metadata'
  )
  .action(createMetadata);

program
  .command('upload-dir')
  .description('Upload directory to Pinata')
  .requiredOption('-k, --api-key <string>', 'Pinata API key')
  .requiredOption('-s, --api-secret <string>', 'Pinata API secret')
  .requiredOption('-d, --directory <dir>', 'directory to upload')
  .action(uploadDirectory);

program
  .command('sign')
  .description('Sign account addresses')
  .requiredOption('-i, --input <file>', 'input file path containing addresses')
  .requiredOption(
    '-k, --private-key <string>',
    'private key used for signing message'
  )
  .requiredOption(
    '-o, --output <file>',
    'output file path containing list of signed message',
    'signatures.json'
  )
  .action(sign);

program.parseAsync(process.argv);
