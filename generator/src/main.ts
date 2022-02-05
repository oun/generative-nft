import yargs from 'yargs/yargs';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

async function createTraitTypes(
  config: Config,
  argv: any
): Promise<Array<TraitType>> {
  const traits = [];
  for (const layer of config.layers) {
    const traitDir = path.join(argv.l, layer.name);
    const files = await fs.readdir(traitDir);
    const trait: TraitType = { name: layer.name, values: files };
    traits.push(trait);
  }
  return traits;
}

function generate(
  total: number,
  traitTypes: Array<TraitType>
): Array<Metadata> {
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

async function createImages(
  metadataList: Array<Metadata>,
  layerDir: string,
  imageSize: ImageSize,
  outputDir: string
) {
  const canvas = createCanvas(imageSize.width, imageSize.height);
  const ctx = canvas.getContext('2d');
  await fs.mkdir(outputDir, { recursive: true });
  for (let i = 0; i < metadataList.length; i++) {
    const metadata = metadataList[i];
    for (const trait of metadata.traits) {
      const image = await loadImage(
        path.join(layerDir, trait.name, trait.value)
      );
      ctx.drawImage(image, 0, 0, image.width, image.height);
    }
    const outputFile = path.join(outputDir, `${i}.png`);
    console.log(`Writing image ${outputFile}`);
    await fs.writeFile(outputFile, canvas.toBuffer('image/png'));
  }
}

function parseArgs() {
  return yargs(process.argv.slice(2))
    .options({
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
      }
    })
    .parseSync();
}

async function main() {
  const argv = parseArgs();

  const f = await fs.readFile(argv.c);
  const config: Config = JSON.parse(f.toString());

  if (argv.g) {
    console.log('Generating images...');
    const traitTypes = await createTraitTypes(config, argv);
    //   console.log(traitTypes);

    const list = generate(argv.n, traitTypes);

    await createImages(list, argv.l, config.imageSize, argv.o);
  }
}

main();
