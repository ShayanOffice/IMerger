//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/
import { choose } from "./bin/chooser.js";
import { compose } from "./bin/composer.js";
import { Size } from "./bin/config.js";

const main = async () => {
  const probsHolderArr = await choose(2);
  // console.log(probsHolderArr[1]);
  const img = await compose(probsHolderArr[0],probsHolderArr[1], Size);
};
main();