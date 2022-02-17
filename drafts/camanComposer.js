import com from "caman";
const destination = "built/";
const baseImgAddress = "./Traits/02-Body/01-Back/General.png";
const overlayImgAddress =
  "./Traits/02-Body/02-SkinPatterns/BrightReptile_Screen.png";

const compose = async () => {
  com.Caman(baseImgAddress, function () {
    // this.brightness(40);
    this.hue(60);
    this.newLayer(function () {
    //   this.overlayImage(overlayImgAddress);
    });
    this.render(function () {
      this.save("./output.png");
    });
  });
};

compose();
