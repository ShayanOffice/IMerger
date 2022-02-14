//  https://github.com/ashbeech/moralis-mutants-nft-engine
//  https://moralis.io/how-to-mint-nfts-for-free-without-paying-gas-fees/

import { choose } from "./chooser.js";
import { compose } from "./composer.js";


const main = async ()=>{
const probArr = await choose(5);
// console.log(probArr);
const img = await compose(probArr);
}
main();