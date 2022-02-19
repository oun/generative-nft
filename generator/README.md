# NFT Generator

CLI to generate NFT images and metadata

## Requirements

- NodeJS 14
- Yarn

## Usage

```bash
yarn generator generate -n 20
yarn generator create-images -o build/images
yarn generator -k <key> -s <secret> -d build/images
yarn generator create-metadata -u ipfs://xxx -o build/metadata
yarn generator -k <key> -s <secret> -d build/metadata
yarn generator create-metadata -p ipfs://xxx -o build/metadata
```

## Command Regerences

```bash
Usage: generator [options] [command]

CLI to generate NFT images and metadata

Options:
  -V, --version              output the version number
  -h, --help                 display help for command

Commands:
  generate [options]         Generate collectibles
  create-images [options]    Create NFT images
  create-metadata [options]  Create metadata
  upload-dir [options]       Upload directory to Pinata
  help [command]             display help for command
```

### Generate Command
```bash
Usage: generator generate [options]

Generate collectibles

Options:
  -c, --config <file>   path to configuration file (default: "config.json")
  -n, --limit <number>  number of collectibles to create (default: "10")
  -o, --output <file>   output file (default: "build/collectibles.json")
  -h, --help            display help for command
```

### Create Images Command

```bash
Usage: generator create-images [options]

Create NFT images

Options:
  -c, --config <file>           path to configuration file (default: "config.json")
  -s, --source <file>           path to generated collectibles file (default: "build/collectibles.json")
  -o, --output-directory <dir>  output directory (default: "build/images")
  -h, --help                    display help for command
```

### Create Metadata Command
```bash
Usage: generator create-metadata [options]

Create metadata

Options:
  -c, --config <file>             path to configuration file (default: "config.json")
  -s, --source <file>             path to generated collectibles file (default: "build/collectibles.json")
  -h, --unreveal-image <file>     path to unreveal image
  -p, --image-path-prefix <path>  path prefix to image (default: "ipfs://xxx/")
  -o, --output-directory <dir>    output directory
  --help                          display help for command
```

### Upload Directory Command
```bash
Usage: generator upload-dir [options]

Upload directory to Pinata

Options:
  -k, --api-key <string>     Pinata API key
  -s, --api-secret <string>  Pinata API secret
  -d, --directory <dir>      directory to upload
  -h, --help                 display help for command
```