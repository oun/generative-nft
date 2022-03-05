import fs from 'fs/promises';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import Config from './config';
import Random from './random';

export async function generate(): Promise<void> {
  try {
    const { output, limit, config } = this.opts();
    const configuration: Config = await Config.loadFromFile(config);
    const collectibles = generateCollectibles(limit, configuration);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, JSON.stringify(collectibles, null, 2));
  } catch (error) {
    console.log(`Error creating collectibles: ${error}`);
  }
}

function generateCollectibles(
  total: number,
  config: Config
): Array<Collectible> {
  const random = new Random(config.rarities);
  const results: Array<Collectible> = [];
  for (let i = 0; i < total; i++) {
    const [score, attributes] = randomAttributes(random, config);
    results.push({
      id: i + 1,
      rarity: score,
      attributes
    });
  }
  return results;
}

function randomAttributes(
  random: Random,
  config: Config
): [number, Array<Attribute>] {
  let score = 0;
  const attributes = config.traitTypes.map((t) => {
    const rarity = random.rand();
    const traits = config.traitsByRarity(t.name, rarity.id);
    const i = Math.floor(Math.random() * traits.length);
    const trait = traits[i];
    score += rarity.id;
    return {
      name: t.name,
      value: path.parse(trait.image).name
    };
  });
  return [score, attributes];
}

export async function createImages(): Promise<void> {
  try {
    const { outputDirectory, source, config } = this.opts();
    const configuration: Config = await Config.loadFromFile(config);
    const { imageSize, layerDirectory } = configuration;
    const canvas = createCanvas(imageSize.width, imageSize.height);
    const ctx = canvas.getContext('2d');
    const collectibles: Array<Collectible> = JSON.parse(
      (await fs.readFile(source)).toString()
    );
    await fs.mkdir(outputDirectory, { recursive: true });
    for (let i = 0; i < collectibles.length; i++) {
      const c = collectibles[i];
      for (const trait of c.attributes) {
        const image = await loadImage(
          path.join(layerDirectory, trait.name, `${trait.value}.png`)
        );
        ctx.drawImage(image, 0, 0, image.width, image.height);
      }
      const outputFile = path.join(outputDirectory, `${i + 1}.png`);
      console.log(`Writing image ${outputFile}`);
      await fs.writeFile(outputFile, canvas.toBuffer('image/png'));
    }
  } catch (error) {
    console.log(`Error creating images ${error}`);
  }
}

export async function createMetadata(): Promise<void> {
  try {
    const { outputDirectory, source, config, imagePath, unreveal } =
      this.opts();
    const configuration: Config = await Config.loadFromFile(config);
    const collectibles: Array<Collectible> = JSON.parse(
      (await fs.readFile(source)).toString()
    );
    console.log(unreveal);
    const { metadata } = configuration;
    for (const c of collectibles) {
      const attributes = c.attributes.map((e) => ({
        trait_type: e.name,
        value: e.value
      }));
      const json = JSON.stringify(
        {
          name: `${metadata.name}${c.id}`,
          description: metadata.description,
          image: unreveal ? imagePath : `${imagePath}/${c.id}.png`,
          attributes: unreveal ? undefined : attributes
        },
        null,
        2
      );
      await fs.mkdir(outputDirectory, { recursive: true });
      const outputFile = path.join(outputDirectory, c.id.toString());
      console.log(`Writing metadata ${outputFile}`);
      await fs.writeFile(outputFile, json);
    }
  } catch (error) {
    console.log(`Error creating metadata ${error}`);
  }
}
