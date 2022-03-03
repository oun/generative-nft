import fs from 'fs/promises';
import path from 'path';
import { fileExists } from './helper';

export default class Config {
  private constructor(
    public traitTypes: Array<TraitType>,
    public rarities: Array<Rarity>,
    public metadata: Metadata,
    public imageSize: ImageSize,
    public layerDirectory: string
  ) {}

  public static async loadFromFile(
    file: string,
  ): Promise<Config> {
    const f = await fs.readFile(file);
    const s = JSON.parse(f.toString());
    const config = new Config(
      s.traitTypes,
      s.rarities,
      s.metadata,
      s.imageSize,
      s.layerDirectory
    );
    await this.validateConfig(config);
    return config;
  }

  private static async validateConfig(
    config: Config
  ): Promise<void> {
    // Validate trait images exist
    for (let i = 0; i < config.traitTypes.length; i++) {
      const traitType = config.traitTypes[i];
      for (let j = 0; j < traitType.traits.length; j++) {
        const trait = traitType.traits[j];
        if (
          !(await fileExists(path.join(config.layerDirectory, traitType.name, trait.image)))
        ) {
          throw Error(
            `Trait image ${traitType.name}/${trait.image} does not exists`
          );
        }
      }
    }

    // Validate rarities
    if (
      config.rarities.reduce((result, rarity) => result + rarity.chance, 0) !=
      100
    ) {
      throw Error(`Sum of rarity chance is not equal to 100`);
    }
  }

  public traitsByRarity(traitTypeName: string, rarity: number): Array<Trait> {
    const traitType = this.traitTypes.find((t) => t.name === traitTypeName);
    return traitType?.traits.filter((t) => t.rarity === rarity);
  }
}
