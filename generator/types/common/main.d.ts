interface Rarity {
  id: number;
  name: string;
  chance: number;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
}

interface ImageSize {
  width: number;
  height: number;
}

interface TraitType {
  name: string;
  traits: Array<Trait>;
}

interface Trait {
  id: number;
  image: string;
  rarity: number;
}

interface Attribute {
  name: string;
  value: string;
}

interface Collectible {
  id: number;
  rarity: number;
  attributes: Array<Attribute>;
}
