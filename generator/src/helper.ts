import fs from 'fs/promises';

export const fileExists = async (file): Promise<boolean> => {
    try {
        await fs.access(file);
        return true;
    } catch {
        return false;
    }
}