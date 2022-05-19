import fs from 'fs/promises';

export default class Config {
  private constructor(
    public rarities: Rarity[],
    public metadata: Metadata,
    public types: TraitTypeRule[],
    public traits: TraitRule[]
  ) {}

  public static async loadFromFile(file: string): Promise<Config> {
    const f = await fs.readFile(file);
    const s = JSON.parse(f.toString());
    const config = new Config(s.rarities, s.metadata, s.types, s.traits);
    await this.validateConfig(config);
    return config;
  }

  private static async validateConfig(config: Config): Promise<void> {
    // Validate rarities
    if (
      config.rarities.reduce((result, rarity) => result + rarity.chance, 0) !=
      100
    ) {
      throw Error(`Sum of rarity chance is not equal to 100`);
    }
  }
}
