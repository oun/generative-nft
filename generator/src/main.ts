import yargs from 'yargs/yargs';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import FormData from 'form-data';

async function createTraitTypes(
  config: Config,
  argv: any
): Promise<Array<TraitType>> {
  const traits = [];
  for (const layer of config.layers) {
    const traitDir = path.join(argv.l, layer.name);
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
) {
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
    const outputFile = path.join(outputDir, `${n}.json`);
    console.log(`Writing metadata ${outputFile}`);
    await fs.writeFile(outputFile, json);
  }
}

async function updateMetadata(metadataDir: string, imagePrefixPath: string) {
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
) {
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

async function upload(projectId: string, secret: string, directory: string) {
  const client = axios.create({
    baseURL: 'https://ipfs.infura.io:5001',
    auth: {
      username: projectId,
      password: secret
    }
  });
  const form = new FormData();
  const files = await fs.readdir(directory, { withFileTypes: true });
  for (const file of files.filter((e) => e.isFile()).map((e) => e.name)) {
    const filePath = path.join(directory, file);
    const f = await fs.readFile(filePath);
    if (f.length > 0) {
      form.append('file', f, {
        filename: filePath
      });
    }
  }
  const res = await client.post('/api/v0/add', form, {
    params: { 'wrap-with-directory': true, pin: true },
    headers: form.getHeaders()
  });
  const lines = res.data
    .split('\n')
    .filter((e) => e.trim() !== '')
    .map((e) => JSON.parse(e));
  return lines[lines.length - 1]['Hash'];
}

function parseArgs() {
  return yargs(process.argv.slice(2))
    .options({
      u: {
        type: 'boolean',
        alias: 'upload',
        description: 'Enable upload output directory to IPFS',
        default: false
      },
      g: {
        type: 'boolean',
        alias: 'generate',
        description: 'Enable generating images',
        default: false
      },
      c: {
        type: 'string',
        alias: 'config-file',
        description: 'Path to configuration file',
        default: 'config.json'
      },
      n: {
        type: 'number',
        alias: 'total',
        description: 'Total number of images to generated',
        default: 100
      },
      o: {
        type: 'string',
        alias: 'output-dir',
        description: 'Output directory',
        default: 'build'
      },
      l: {
        type: 'string',
        alias: 'layers-dir',
        description: 'Directory that store layer images',
        default: 'layers'
      },
      'project-id': {
        type: 'string',
        description: 'Influra project ID',
        default: ''
      },
      'project-secret': {
        type: 'string',
        description: 'Influra project secret',
        default: ''
      }
    })
    .parseSync();
}

async function main() {
  try {
    const argv = parseArgs();

    const f = await fs.readFile(argv.c);
    const config: Config = JSON.parse(f.toString());
    const imagesDir = path.join(argv.o, 'images');
    const metadataDir = path.join(argv.o, 'metadata');

    if (argv.g) {
      console.log('Generating images...');
      const traitTypes = await createTraitTypes(config, argv);
      const list = generate(argv.n, traitTypes);
      await createImages(list, argv.l, config.imageSize, imagesDir);

      console.log('Generating metadata...');
      await createMetadata(list, '', config.metadata, metadataDir);
    }

    if (argv.u) {
      console.log(`Uploading ${imagesDir} to IPFS...`);
      const cid = await upload(argv.projectId, argv.projectSecret, imagesDir);
      await updateMetadata(metadataDir, `https://infura-ipfs.io/ipfs/${cid}`);
      console.log(`Uploading ${metadataDir} to IPFS...`);
      await upload(argv.projectId, argv.projectSecret, metadataDir);
    }
  } catch (err) {
    console.log(err);
  }
}

main();
