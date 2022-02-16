import PinataSDK from '@pinata/sdk';
import { createCanvas, loadImage } from 'canvas';
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';

async function createTraitTypes(
  config: Config,
  inputDir: string
): Promise<Array<TraitType>> {
  const traits = [];
  for (const layer of config.layers) {
    const traitDir = path.join(inputDir, layer.name);
    const files = await fs.readdir(traitDir);
    const values = files.map((e) => path.parse(e).name);
    const trait: TraitType = { name: layer.name, values };
    traits.push(trait);
  }
  return traits;
}

function generate(
  total: number,
  traitTypes: Array<TraitType>
): Array<Collectible> {
  const results = [];
  for (let i = 0; i < total; i++) {
    const traits = traitTypes.map((t) => {
      const r = Math.floor(Math.random() * t.values.length);
      return {
        name: t.name,
        value: t.values[r]
      };
    });
    results.push({ traits });
  }
  return results;
}

async function createMetadata(
  collectibles: Array<Collectible>,
  imagePathPrefix: string,
  metadata: Metadata,
  outputDir: string
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  for (let i = 0; i < collectibles.length; i++) {
    const c = collectibles[i];
    const n = i + 1;
    const attr = c.traits.map((e) => ({ trait_type: e.name, value: e.value }));
    const json = JSON.stringify(
      {
        name: `${metadata.name}${n}`,
        description: metadata.description,
        image: `${imagePathPrefix}/${n}.png`,
        attributes: attr
      },
      null,
      2
    );
    const outputFile = path.join(outputDir, `${n}`);
    console.log(`Writing metadata ${outputFile}`);
    await fs.writeFile(outputFile, json);
  }
}

async function updateMetadata(
  metadataDir: string,
  imagePrefixPath: string
): Promise<void> {
  const files = await fs.readdir(metadataDir);
  for (const f of files) {
    const filePath = path.join(metadataDir, f);
    const s = await fs.readFile(filePath);
    const metadata: Metadata = JSON.parse(s.toString());
    const { name } = path.parse(f);
    metadata.image = `${imagePrefixPath}/${name}.png`;
    await fs.writeFile(filePath, JSON.stringify(metadata, null, 2));
  }
}

async function createImages(
  collectibles: Array<Collectible>,
  layerDir: string,
  imageSize: ImageSize,
  outputDir: string
): Promise<void> {
  const canvas = createCanvas(imageSize.width, imageSize.height);
  const ctx = canvas.getContext('2d');
  await fs.mkdir(outputDir, { recursive: true });
  for (let i = 0; i < collectibles.length; i++) {
    const c = collectibles[i];
    for (const trait of c.traits) {
      const image = await loadImage(
        path.join(layerDir, trait.name, `${trait.value}.png`)
      );
      ctx.drawImage(image, 0, 0, image.width, image.height);
    }
    const outputFile = path.join(outputDir, `${i + 1}.png`);
    console.log(`Writing image ${outputFile}`);
    await fs.writeFile(outputFile, canvas.toBuffer('image/png'));
  }
}

async function uploadDirectory(
  key: string,
  secret: string,
  directory: string
): Promise<string> {
  console.log(`Uploading directory ${directory}...`);
  const pinata = PinataSDK(key, secret);
  const result = await pinata.pinFromFS(directory);
  return result.IpfsHash;
}

async function readConfig(configFile: string): Promise<Config> {
  const f = await fs.readFile(configFile);
  return JSON.parse(f.toString());
}

async function create(): Promise<void> {
  try {
    const config: Config = await readConfig(this.opts().config);
    const imagesDir = path.join(this.opts().outputDirectory, 'images');
    const metadataDir = path.join(this.opts().outputDirectory, 'metadata');
    const traitTypes = await createTraitTypes(
      config,
      this.opts().inputDirectory
    );
    const list = generate(this.opts().limit, traitTypes);
    await createImages(
      list,
      this.opts().inputDirectory,
      config.imageSize,
      imagesDir
    );
    await createMetadata(list, '', config.metadata, metadataDir);
  } catch (error) {
    console.log('Error generating images', error);
  }
}

async function upload(): Promise<void> {
  try {
    const { apiKey, apiSecret, outputDirectory } = this.opts();
    const imagesDir = path.join(outputDirectory, 'images');
    const metadataDir = path.join(outputDirectory, 'metadata');
    const imagesDirCid = await uploadDirectory(apiKey, apiSecret, imagesDir);
    console.log(`Images directory CID: ${imagesDirCid}`);
    await updateMetadata(
      metadataDir,
      `https://gateway.pinata.cloud/ipfs/${imagesDirCid}`
    );
    const metadataDirCid = await uploadDirectory(
      apiKey,
      apiSecret,
      metadataDir
    );
    console.log(`Metadata directory CID: ${metadataDirCid}`);
  } catch (error) {
    console.log('Error uploading files', error);
  }
}

const program = new Command();

program
  .name('generator')
  .description('CLI to generate NFT images and metadata')
  .version('0.0.1');

program
  .command('create')
  .description('Create NFT images and metadata')
  .requiredOption(
    '-c, --config <file>',
    'path to configuration file',
    'config.json'
  )
  .requiredOption('-n, --limit <number>', 'number of images to create', '10')
  .requiredOption('-o, --output-directory <dir>', 'output directory', 'build')
  .requiredOption(
    '-i, --input-directory <dir>',
    'input directory contains layer images',
    'layers'
  )
  .action(create);

program
  .command('upload')
  .description('Upload NFT images and metadata to Pinata')
  .requiredOption('-k, --api-key <string>', 'Pinata API key')
  .requiredOption('-s, --api-secret <string>', 'Pinata API secret')
  .requiredOption('-o, --output-directory <dir>', 'output directory', 'build')
  .action(upload);

program.parseAsync(process.argv);
