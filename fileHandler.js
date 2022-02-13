import { promises as fs } from 'fs';
import { cacheDir, traitsDir } from './global.js';


export const readDir = async (traitsDir) =>
  await fs.readdir(traitsDir, { withFileTypes: true });

export const writeHierarchyToFile = async (cachedHierarchy) => {
  await fs.writeFile(
    cacheDir + 'cached_hierarchy.json',
    JSON.stringify(cachedHierarchy, null, 2),
    function (err) {
      if (err) console.log(err);
    }
  );
};

export const readHierarchyFromFile = async () => {
  const fileDir = cacheDir + 'cached_hierarchy.json';
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};
