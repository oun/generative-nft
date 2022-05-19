import fs from 'fs/promises';

export const fileExists = async (file): Promise<boolean> => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

export const listDirectory = async (
  dir,
  isDirectory = false
): Promise<string[]> => {
  return (await fs.readdir(dir, { withFileTypes: true }))
    .filter((f) => f.isDirectory() === isDirectory)
    .map((f) => f.name);
};
