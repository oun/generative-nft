import PinataSDK from '@pinata/sdk';

export async function uploadDirectory(): Promise<void> {
  try {
    const { apiKey, apiSecret, directory } = this.opts();
    // TODO: Validate directory must not be empty
    console.log(`Uploading directory ${directory}...`);
    const pinata = PinataSDK(apiKey, apiSecret);
    const result = await pinata.pinFromFS(directory);
    console.log(`Uploaded directory CID: ${result.IpfsHash}`);
  } catch (error) {
    console.log(`Error uploading directory ${error}`);
  }
}
