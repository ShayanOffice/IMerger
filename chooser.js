import { traitsDir } from './global.js';
import { readHierarchyFromFile } from './fileHandler.js';

const choose = async () => {
  try {
    const Hierarchy = await readHierarchyFromFile();
    console.log(Hierarchy.orderedChildren[2]);
  } catch (err) {
    console.log(err);
  }
};

choose();
