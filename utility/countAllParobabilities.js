import { Cache } from '../bin/explorer.js';
import {
  ReadObjFromFile,
  WriteObjToFile,
  readDir,
} from '../bin/fileHandler.js';
import { CacheDir, CachedHierarchyFileName } from '../config.js';
var Count = 0;
const main = async () => {
  await Cache();
  const Hierarchies = await ReadObjFromFile(CacheDir + CachedHierarchyFileName);
};
for (const ht of Hierarchies) {
  if (hr.childCount > 0) {
    if (isHrOrdered(hr)) {
      var probs = 1;
      hr.orderedChildren.forEach((childHr) => {
        if (childHr.childCount) probs = probs * childHr.childCount;
      });
    }
  }
}

main();

const isHrOrdered = (hr) => {
  if (hr.orderedChildren.length > 0) return true;
};
