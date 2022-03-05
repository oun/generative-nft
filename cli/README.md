# NFT CLI

CLI let you generate NFT images and metada, upload them to Pinata

## Getting Started
### Prerequisites

- NodeJS 14
- Yarn
- Pinata API key

### Installation

1. Install NPM packages: `yarn install`
2. Sign up [Pinata](https://www.pinata.cloud/) account and get API key
3. Create configuration file e.g. `config.json`
4. Create directory containing trait images

Sample config.json
```json
{
  "imageSize": {
    "width": 500,
    "height": 500
  },
  "metadata": {
    "name": "NFT #",
    "description": "Really cool randomly generated NFT images"
  },
  "rarities": [
    {
      "id": 1,
      "name": "common",
      "chance": 50
    },
    {
      "id": 2,
      "name": "uncommon",
      "chance": 30
    },
    {
      "id": 3,
      "name": "rare",
      "chance": 15
    },
    {
      "id": 4,
      "name": "legendary",
      "chance": 5
    }
  ],
  "layerDirectory": "layers",
  "traitTypes": [
    {
      "name": "trait_1",
      "traits": [
        {
          "id": 1,
          "image": "trait_value1.png",
          "rarity": 1
        },
        {
          "id": 2,
          "image": "trait_value2.png",
          "rarity": 2
        },
        {
          "id": 3,
          "image": "trait_value3.png",
          "rarity": 3
        }
      ]
    },
    {
      "name": "trait_2",
      "traits": [
        {
          "id": 1,
          "image": "trait_value4.png",
          "rarity": 1
        },
        {
          "id": 2,
          "image": "trait_value5.png",
          "rarity": 1
        },
        {
          "id": 3,
          "image": "trait_value6.png",
          "rarity": 1
        }
      ]
    }
  ]
}
```
Sample trait image directories:
```
project
│
└───layers
    │
    └───trait_1
    │      trait_value1.png
    │      trait_value2.png
    │      trait_value3.png
    │   
    └───trait_2
           trait_value4.png
           trait_value5.png
           trait_value6.png
```

## Usage

Generate random 100 items and write to build/collectibles.json file that contains configuration used to create image and metadata.
```bash
yarn cli generate -n 100
```

Create images and save to build/images directory
```bash
yarn cli create-images
```

Create unrevealed metadata using image path ipfs://xxx/unreveal.png and save to build/metadata directory
```bash
yarn cli create-metadata -u -p ipfs://xxx/unreveal.png
```

Upload unrevealed metadata to Pinata service
```bash
yarn cli upload-dir -k <key> -s <secret> -d build/metadata
```

Create revealed metadata using image path prefix ipfs://xxx and save to build/metadata directory
```bash
yarn cli create-metadata -p ipfs://xxx
```

## Command References

```bash
Usage: cli [options] [command]

NFT CLI utilities

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  generate [options]         Generate collectibles
  create-images [options]    Create NFT images
  create-metadata [options]  Create metadata
  upload-dir [options]       Upload directory to Pinata
  sign [options]             Sign account addresses
  help [command]             display help for command
```

### Generate Command

```bash
Usage: cli generate [options]

Generate collectibles

Options:
  -c, --config <file>   path to configuration file (default: "config.json")
  -n, --limit <number>  number of collectibles to create (default: "10")
  -o, --output <file>   output file (default: "build/collectibles.json")
  -h, --help            display help for command
```

### Create Images Command

```bash
Usage: cli create-images [options]

Create NFT images

Options:
  -c, --config <file>           path to configuration file (default: "config.json")
  -s, --source <file>           path to generated collectibles file (default: "build/collectibles.json")
  -o, --output-directory <dir>  output directory (default: "build/images")
  -h, --help                    display help for command
```

### Create Metadata Command

```bash
Usage: cli create-metadata [options]

Create metadata

Options:
  -c, --config <file>           path to configuration file (default: "config.json")
  -s, --source <file>           path to generated collectibles file (default: "build/collectibles.json")
  -u, --unreveal                unreveal flag
  -p, --image-path <path>       if unreveal flag is true, this is full path to unrevealed image. Otherwise path prefix to image
  -o, --output-directory <dir>  output directory (default: "build/metadata")
  -h, --help                    display help for command
```

### Upload Directory Command

```bash
Usage: cli upload-dir [options]

Upload directory to Pinata

Options:
  -k, --api-key <string>     Pinata API key
  -s, --api-secret <string>  Pinata API secret
  -d, --directory <dir>      directory to upload
  -h, --help                 display help for command
```

### Sign Accounts Command

```bash
Usage: cli sign [options]

Sign account addresses

Options:
  -i, --input <file>          input file path containing addresses
  -k, --private-key <string>  private key used for signing message
  -o, --output <file>         output file path containing list of signed message (default: "signatures.json")
  -h, --help                  display help for command
```