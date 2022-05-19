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
4. Create directory for all trait images

## Usage

### Generate images

1. Generate random 100 items and write to build/collectibles.json file that will be used to create image and metadata.
```bash
yarn cli generate -n 100
```

2. Create images in build/images directory
```bash
yarn cli create-images
```

### Pre-reveal

1. Upload pre-reveal image to Pinata 
```bash
yarn cli upload -k <key> -s <secret> -f build/images/prereveal.png
``` 

2. Create metadata for pre-reveal image using image url https://gateway.pinata.cloud/ipfs/<cid> in build/metadata directory.
   Where <cid> is content identifier for the uploaded pre-reveal image in step 1.
```bash
yarn cli create-prereveal-metadata -p https://gateway.pinata.cloud/ipfs/<cid>
```

3. Upload pre-reveal metadata to Pinata service
```bash
yarn cli upload -k <key> -s <secret> -f build/metadata
```

### Post-reveal

1. Upload post-reveal images in build/images directory to Pinata 
```bash
yarn cli upload -k <key> -s <secret> -f build/images
``` 

2. Create metadata using image url prefix https://gateway.pinata.cloud/ipfs/<cid> in build/metadata directory.
   Where <cid> is content identifier for the uploaded directory in step 1.
```bash
yarn cli create-metadata -p https://gateway.pinata.cloud/ipfs/<cid>
```

3. Upload metadata to Pinata service
```bash
yarn cli upload -k <key> -s <secret> -f build/metadata
```

## Command References

```bash
Usage: cli [options] [command]

NFT CLI utilities

Options:
  -V, --version                        output the version number
  -h, --help                           display help for command

Commands:
  generate [options]                   Generate collectibles
  create-images [options]              Create NFT images from generated collectibles
  create-metadata [options]            Create metadata from generated collectibles
  create-prereveal-metadata [options]  Create prereveal metadata from generated collectibles
  upload [options]                     Upload file or directory to Pinata
  help [command]                       display help for command
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
  -p, --image-url-prefix <path> Image url prefix e.g. ipfs://xxx
  -o, --output-directory <dir>  output directory (default: "build/metadata")
  -h, --help                    display help for command
```

### Create Pre-reveal Metadata Command

```bash
Usage: cli create-metadata [options]

Create pre-reveal metadata

Options:
  -c, --config <file>           path to configuration file (default: "config.json")
  -s, --source <file>           path to generated collectibles file (default: "build/collectibles.json")
  -p, --image-url <path>        The pre-reveal image url e.g. ipfs://xxx
  -o, --output-directory <dir>  output directory (default: "build/metadata")
  -h, --help                    display help for command
```

### Upload File or Directory Command

```bash
Usage: cli upload [options]

Upload file or directory to Pinata

Options:
  -k, --api-key <string>     Pinata API key
  -s, --api-secret <string>  Pinata API secret
  -f, --file <file>          file or directory to upload
  -h, --help                 display help for command
```
