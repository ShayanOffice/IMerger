import {promises as fs} from'fs';

export const writeCachedHierarchy = async (cachedHierarchy,workingDir) => {
    await fs.writeFile(
      workingDir + 'cached_hierarchy' + '.json',
      JSON.stringify(cachedHierarchy, null, 2),
      function (err) {
        if (err) console.log(err);
      }
    );
  };