//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/
import { choose } from "./bin/chooser";
import { compose } from "./bin/composer";
import { size } from "./bin/config";

const main = async () => {
  const probArr = await choose(60);
  const img = await compose(probArr, size);
};
main();
