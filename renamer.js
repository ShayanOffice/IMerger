const fs = require("fs");

fs.readdir("./Traits/Background", (err, files) => {
  for (const file of files) {
    if (/.a\./.test(file)) {
      console.log(file.replace(/(.*)\./, `$1_hoo.`));
    }
  }
});
