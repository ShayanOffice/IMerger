import { promises as fs } from 'fs';
import { readDir } from '../bin/fileHandler.js';
import {
  MetaDescription,
  MetaName,
  MetaLinkBase,
  ImagesDir,
  MetaDatasDir,
  MetaAuthor,
} from '../config.js';

const updateMetas = async () => {
  const metaDirents = await readDir(MetaDatasDir);

  for (const metaDirent of metaDirents) {
    const mDName = metaDirent.name.replace(/(.+)(\..+)/, `$1`);
    const metaData = await JSON.parse(
      await fs.readFile(MetaDatasDir + metaDirent.name)
    );

    const imageExtension = metaData.image.replace(
      /(.*)\/(.*\/)*(.+)(\..+)/,
      '$4'
    );
    if (metaData.name !== MetaName + ' #' + mDName)
      metaData.name = MetaName + ' #' + mDName;

    if (metaData.description !== MetaDescription)
      metaData.description = MetaDescription;

    if (metaData.image !== MetaLinkBase + mDName + imageExtension)
      metaData.image = MetaLinkBase + mDName + imageExtension;

    if (metaData.author !== MetaAuthor) metaData.author = MetaAuthor;

    await fs.writeFile(
      MetaDatasDir + metaDirent.name,
      JSON.stringify(metaData, null, 2),
      function (err) {
        if (err) console.log(err);
      }
    );
  }
};

updateMetas();
