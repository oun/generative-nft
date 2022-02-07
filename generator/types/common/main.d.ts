interface TraitType {
  name: string;
  values: Array<string>;
}

interface Config {
  layers: Array<Layer>;
  metadata: Metadata;
  imageSize: ImageSize;
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

interface Layer {
  name: string;
}

interface Trait {
  name: string;
  value: string;
}

interface Collectible {
  name: string;
  traits: Array<Trait>;
}
