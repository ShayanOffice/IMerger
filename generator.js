//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/

import { choose } from "./chooser.js";
import { compose } from "./canvasComposer.js";
import { size } from "./config.js";

const main = async () => {
  const probArr = await choose(1);
  console.log(probArr[0][0].metaName + probArr[0][0].hueVariant.colorName);
  const img = await compose(probArr, size);
};
main();
