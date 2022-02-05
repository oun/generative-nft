interface TraitType {
  name: string;
  values: Array<string>;
}

interface Config {
  layers: Array<Layer>;
  imageSize: ImageSize;
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

interface Metadata {
  traits: Array<Trait>;
}
