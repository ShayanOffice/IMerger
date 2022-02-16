import { promises as fs } from 'fs';
import { cacheDir, traitsDir, cachedHierarchyFileName } from './config.js';


export const readDir = async (traitsDir) =>
  await fs.readdir(traitsDir, { withFileTypes: true });

export const HierarchyToFile = async (cachedHierarchy) => {
  await fs.writeFile(
    cacheDir + cachedHierarchyFileName,
    JSON.stringify(cachedHierarchy, null, 2),
    function (err) {
      if (err) console.log(err);
    }
  );
};

export const HierarchyFromFile = async () => {
  const fileDir = cacheDir + cachedHierarchyFileName;
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};


export const HueVariantsFromFolder = async (fileDir) => {
  const data = await fs.readFile(fileDir);
  return JSON.parse(data);
};
