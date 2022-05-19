interface Rarity {
  name: string;
  chance: number;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
}

interface TraitTypeRule {
  name: string;
  chance?: number;
  rarities?: Rarity[];
  requires?: RequireRule[];
  affinities?: AffinityRule[];
}

interface TraitRule {
  name: string;
  type: string;
  order?: Record<string, string>;
}

interface Trait {
  name: string;
  type: string;
  rarity?: string;
  labels?: string[];
}

interface RequireRule {
  value: string[];
  type: string;
}

interface AffinityRule {
  exist: boolean;
  type: string;
}

interface TraitAffinity {
  exist: boolean;
  labels: string[];
}

interface Attribute {
  name: string;
  rarity: string;
  value: string;
}

interface Collectible {
  id: number;
  attributes: Attribute[];
}

interface ImageInfo {
  name: string;
  labels: string[];
}
