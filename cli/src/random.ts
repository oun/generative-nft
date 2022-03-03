export default class Random {
  private rarities: Array<RarityRange> = [];

  constructor(rarities: Array<Rarity>) {
      let offset = 0;
      for (let i = 0; i < rarities.length; i++) {
          const r = rarities[i];
          this.rarities.push(new RarityRange(r, offset));
          offset += r.chance;
      }
      if (offset !== 100) {
          throw new Error("Sum of rarity chance is not equal to 100");
      }
  }

  rand(): Rarity {
    const n = Math.floor(Math.random() * 100);
    return this.rarities.find(r => r.include(n)).rarity;
  }
}

class RarityRange {
    private lower: number;
    private upper: number;
    private r: Rarity;

    constructor(rarity: Rarity, offset: number = 0) {
        this.lower = offset;
        this.upper = offset + rarity.chance;
        this.r = rarity;
    }

    include(n: number) {
        return n >= this.lower && n < this.upper;
    }

    get rarity(): Rarity {
        return this.r;
    }
}