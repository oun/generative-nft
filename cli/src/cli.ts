import { Command } from 'commander';
import {
  createImages,
  createMetadata,
  createPreRevealMetadata,
  generate
} from './generator';
import { uploadDirectory } from './uploader';

const program = new Command();

program.name('cli').description('NFT CLI utilities').version('0.0.1');

program
  .command('generate')
  .description('Generate collectibles')
  .requiredOption(
    '-c, --config-file <file>',
    'path to configuration file',
    'config.json'
  )
  .requiredOption(
    '-n, --limit <number>',
    'number of collectibles to create',
    '10'
  )
  .requiredOption(
    '-l, --layer-directory <number>',
    'path to directory containing layer images',
    'layers'
  )
  .requiredOption(
    '-o, --output <file>',
    'output file',
    'build/collectibles.json'
  )
  .action(generate);

program
  .command('create-images')
  .description('Create NFT images from generated collectibles')
  .requiredOption(
    '-l, --layer-directory <number>',
    'path to directory containing layer images',
    'layers'
  )
  .requiredOption(
    '-s, --source <file>',
    'path to generated collectibles file',
    'build/collectibles.json'
  )
  .requiredOption('-w, --image-width <file>', 'width of image', '2000')
  .requiredOption('-h, --image-height <file>', 'height of image', '2000')
  .requiredOption(
    '-o, --output-directory <dir>',
    'output directory',
    'build/images'
  )
  .option('-f, --filter <id>', 'collectible id, default to all ids')
  .action(createImages);

program
  .command('create-metadata')
  .description('Create metadata from generated collectibles')
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
  .requiredOption('-p, --image-url-prefix <path>', 'The image url prefix')
  .requiredOption(
    '-o, --output-directory <dir>',
    'output directory',
    'build/metadata'
  )
  .action(createMetadata);

program
  .command('create-prereveal-metadata')
  .description('Create prereveal metadata from generated collectibles')
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
  .requiredOption('-p, --image-url <path>', 'The url to pre-reveal image')
  .requiredOption(
    '-o, --output-directory <dir>',
    'output directory',
    'build/metadata'
  )
  .action(createPreRevealMetadata);

program
  .command('upload')
  .description('Upload file or directory to Pinata')
  .requiredOption('-k, --api-key <string>', 'Pinata API key')
  .requiredOption('-s, --api-secret <string>', 'Pinata API secret')
  .requiredOption('-f, --file <dir>', 'file or directory to upload')
  .action(uploadDirectory);

program.parseAsync(process.argv);
