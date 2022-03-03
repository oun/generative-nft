import { Command } from 'commander';
import { createImages, createMetadata, generate, uploadDirectory } from './main';

const program = new Command();

program
  .name('generator')
  .description('CLI to generate NFT images and metadata')
  .version('0.0.1');

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
  .option('-u, --unreveal-image <file>', 'path to unreveal image')
  .option(
    '-p, --image-path-prefix <path>',
    'path prefix to image',
    'ipfs://xxx/'
  )
  .requiredOption('-o, --output-directory <dir>', 'output directory')
  .action(createMetadata);

program
  .command('upload-dir')
  .description('Upload directory to Pinata')
  .requiredOption('-k, --api-key <string>', 'Pinata API key')
  .requiredOption('-s, --api-secret <string>', 'Pinata API secret')
  .requiredOption('-d, --directory <dir>', 'directory to upload')
  .action(uploadDirectory);

program.parseAsync(process.argv);
