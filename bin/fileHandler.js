import { promises as fs } from 'fs';
import { CacheDir, TraitsDir, CachedHierarchyFileName } from './config.js';


export const readDir = async (traitsDir) =>
  await fs.readdir(traitsDir, { withFileTypes: true });

export const HierarchyToFile = async (cachedHierarchy) => {
  await fs.writeFile(
    CacheDir + CachedHierarchyFileName,
    JSON.stringify(cachedHierarchy, null, 2),
    function (err) {
      if (err) console.log(err);
    }
  );
};

export const HierarchyFromFile = async () => {
  const fileDir = CacheDir + CachedHierarchyFileName;
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};


export const HueVariantsFromFolder = async (fileDir) => {
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};
