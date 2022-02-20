//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/
import { choose } from "./bin/chooser.js";
import { compose } from "./bin/composer.js";
import { size } from "./bin/config.js";

const main = async () => {
  const probArr = await choose(1);
  console.log(probArr);
  const img = await compose(probArr, size);
};
main();
