import assert from 'assert';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import Config from './config';
import { listDirectory } from './helper';
import RarityRandom from './random';

export async function generate(): Promise<void> {
  try {
    const { output, limit, configFile, layerDirectory } = this.opts();
    const config = await Config.loadFromFile(configFile);
    const collectibles = await generateCollectibles(
      limit,
      layerDirectory,
      config
    );
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, JSON.stringify(collectibles, null, 2));
  } catch (error) {
    console.log(`Error creating collectibles`, error);
  }
}

async function scanLayerDirectory(
  dir
): Promise<Map<string, Map<string, Trait[]>>> {
  const results = new Map();
  for (const traitType of await listDirectory(dir, true)) {
    const rarityToTraitsMap = new Map<string, Trait[]>();
    for (const rarity of await listDirectory(path.join(dir, traitType), true)) {
      const files = await listDirectory(path.join(dir, traitType, rarity));
      const traits = files
        .filter((f) => path.extname(f)?.toLowerCase() === '.png')
        .map((f) => ({
          name: f,
          type: traitType,
          labels: getImageInfo(f).labels,
          rarity
        }));
      rarityToTraitsMap.set(rarity, traits);
    }
    results.set(traitType, rarityToTraitsMap);
  }
  return results;
}

function getImageInfo(file: string): ImageInfo {
  const delim = '__';
  const fileName = path.basename(file, '.png');
  if (fileName.indexOf(delim) > -1) {
    const parts = fileName.split(delim);
    const name = parts[0];
    const labels = parts[1].split('_');
    return { name, labels };
  }
  return { name: fileName, labels: [] };
}

function formatAttributeValue(attr: string): string {
  return attr.replace('-', '_');
}

function randomAttributes(
  config: Config,
  traitStore: Map<string, Map<string, Trait[]>>
): Attribute[] {
  const traits: Trait[] = [];
  const defaultRandom = new RarityRandom(config.rarities);

  for (const traitType of config.types) {
    const emptyTrait = { type: traitType.name, name: null };
    const chance = traitType.chance ?? 100;
    const n = Math.floor(Math.random() * 100);
    if (n > chance || !validateTraitTypeRequirements(traitType, traits)) {
      traits.push(emptyTrait);
    } else {
      const random = traitType.rarities
        ? new RarityRandom(traitType.rarities)
        : defaultRandom;
      const affinities = traitType.affinities?.map((a) => {
        const labels = traits.find((t) => t.type === a.type)?.labels;
        return { exist: a.exist, labels };
      });
      const trait = randomTrait(
        random,
        affinities,
        traitStore.get(traitType.name)
      );
      traits.push(trait ?? emptyTrait);
    }
  }
  const orderedTraits = reorderTraits(traits, config);
  return orderedTraits
    .filter((t) => t.name)
    .map((t) => ({
      name: t.type,
      rarity: t.rarity,
      value: t.name
    }));
}

function reorderTraits(traits: Trait[], config: Config): Trait[] {
  let result = traits;
  traits.slice().forEach((t) => {
    const order = config.traits.find(
      (r) => r.type === t.type && r.name === t.name
    )?.order;
    if (order) {
      result = result.filter((e) => !(e.name === t.name && e.type === t.type));
      if (order.after) {
        const i = result.findIndex((e) => e.type === order.after);
        result = result.slice(0, i + 1).concat([t], result.slice(i + 1));
      }
    }
  });
  assert(traits.length === result.length);
  return result;
}

function validateTraitTypeRequirements(
  rule: TraitTypeRule,
  traits: Trait[]
): boolean {
  if (!rule.requires) {
    return true;
  }
  for (const matchRule of rule.requires) {
    const traitValue =
      traits.find((t) => t.type === matchRule.type)?.name ?? 'none';
    if (!matchRule.value.includes(traitValue)) {
      return false;
    }
  }
  return true;
}

function randomTrait(
  random: RarityRandom,
  affinities: TraitAffinity[],
  rarityToTraitsMap: Map<string, Trait[]>
): Trait {
  const rarity = random.rand();
  const traits = filterTraitsByAffinities(
    rarityToTraitsMap.get(rarity.name) ?? [],
    affinities
  );
  if (!traits || traits.length === 0) {
    return null;
  }
  const i = Math.floor(Math.random() * traits.length);
  return traits[i];
}

function filterTraitsByAffinities(
  traits: Trait[],
  affinities: TraitAffinity[]
) {
  if (!affinities || affinities.length === 0) {
    return traits;
  }
  return traits.filter((t) => {
    if (!t.labels || t.labels.length === 0) {
      return true;
    }
    for (const affinity of affinities) {
      if (
        affinity.exist &&
        !t.labels?.some((l) => affinity.labels.includes(l))
      ) {
        return false;
      } else if (
        !affinity.exist &&
        t.labels?.some((l) => affinity.labels.includes(l))
      ) {
        return false;
      }
    }
    return true;
  });
}

async function generateCollectibles(
  total: number,
  layerDirectory: string,
  config: Config
): Promise<Collectible[]> {
  const results: Collectible[] = [];
  const traitStore = await scanLayerDirectory(layerDirectory);
  for (let i = 0; i < total; i++) {
    results.push({
      id: i + 1,
      attributes: randomAttributes(config, traitStore)
    });
  }
  return results;
}

export async function createImages(): Promise<void> {
  try {
    const {
      outputDirectory,
      source,
      layerDirectory,
      imageWidth,
      imageHeight,
      filter
    } = this.opts();
    let collectibles: Collectible[] = JSON.parse(
      (await fs.readFile(source)).toString()
    );
    if (filter) {
      collectibles = collectibles.filter((c) => c.id === +filter);
    }
    await fs.mkdir(outputDirectory, { recursive: true });
    for (const collectible of collectibles) {
      const canvas = createCanvas(+imageWidth, +imageHeight);
      const ctx = canvas.getContext('2d');
      for (const trait of collectible.attributes) {
        const image = await loadImage(
          path.join(layerDirectory, trait.name, trait.rarity, trait.value)
        );
        ctx.drawImage(image, 0, 0, image.width, image.height);
      }
      const outputFile = path.join(outputDirectory, `${collectible.id}.png`);
      console.log(`Writing image ${outputFile}`);
      await fs.writeFile(outputFile, canvas.toBuffer('image/png'));
    }
  } catch (error) {
    console.log(`Error creating images`, error);
  }
}

export async function createMetadata(): Promise<void> {
  try {
    const { outputDirectory, source, config, imageUrlPrefix } = this.opts();
    const configuration: Config = await Config.loadFromFile(config);
    const collectibles: Collectible[] = JSON.parse(
      (await fs.readFile(source)).toString()
    );
    const { metadata } = configuration;
    await fs.mkdir(outputDirectory, { recursive: true });
    for (const collectible of collectibles) {
      const attributes = collectible.attributes.map((e) => ({
        trait_type: e.name,
        value: `${formatAttributeValue(getImageInfo(e.value).name)}`
      }));
      writeMetadata(
        metadata,
        collectible,
        `${imageUrlPrefix}/${collectible.id}.png`,
        attributes,
        outputDirectory
      );
    }
  } catch (error) {
    console.log(`Error creating metadata ${error}`);
  }
}

export async function createPreRevealMetadata(): Promise<void> {
  try {
    const { outputDirectory, source, config, imageUrl } = this.opts();
    const configuration: Config = await Config.loadFromFile(config);
    const collectibles: Collectible[] = JSON.parse(
      (await fs.readFile(source)).toString()
    );
    const { metadata } = configuration;
    await fs.mkdir(outputDirectory, { recursive: true });
    for (const collectible of collectibles) {
      await writeMetadata(
        metadata,
        collectible,
        imageUrl,
        undefined,
        outputDirectory
      );
    }
  } catch (error) {
    console.log(`Error creating metadata ${error}`);
  }
}

async function writeMetadata(
  metadata: Metadata,
  c: Collectible,
  imageUrl: string,
  attributes: any[],
  outputDirectory: string
): Promise<void> {
  const json = JSON.stringify(
    {
      name: `${metadata.name}${c.id}`,
      description: metadata.description,
      image: imageUrl,
      attributes
    },
    null,
    2
  );
  const outputFile = path.join(outputDirectory, c.id.toString());
  console.log(`Writing metadata ${outputFile}`);
  await fs.writeFile(outputFile, json);
}
