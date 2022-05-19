import PinataSDK from '@pinata/sdk';

export async function uploadDirectory(): Promise<void> {
  try {
    const { apiKey, apiSecret, file } = this.opts();
    // TODO: Validate file or directory is exist
    console.log(`Uploading ${file}...`);
    const pinata = PinataSDK(apiKey, apiSecret);
    const result = await pinata.pinFromFS(file);
    console.log(`Uploaded CID: ${result.IpfsHash}`);
  } catch (error) {
    console.log(`Error uploading: ${error}`);
  }
}
