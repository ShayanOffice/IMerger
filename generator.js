//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/
import { promises as fs } from "fs";
import { choose } from "./bin/chooser.js";
import { compose } from "./bin/composer.js";
import {
  Size,
  ResyncBeforeStart,
  CachBeforeStart,
  ImagesDir,
  MetaDatasDir,
  CacheDir,
} from "./config.js";
import { ReSyncBuilt } from "./bin/fileHandler.js";
import { Cache } from "./bin/explorer.js";

const main = async () => {
  await fs.mkdir(CacheDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
  await fs.mkdir(ImagesDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });
  await fs.mkdir(MetaDatasDir, { recursive: true }, function (err) {
    if (err) return console.log(err);
  });

  if (ResyncBeforeStart) await ReSyncBuilt();
  if (CachBeforeStart) await Cache();

  const { AllImgProbabilities, AllImgAttributes, MadeChoices } = await choose();

  await compose(AllImgProbabilities, AllImgAttributes, MadeChoices, Size);
};
main();
