///<reference types="pixi.js"/>
import gameEngine from "./gameEngine";
let app = new PIXI.Application({width: 800, height: 800});
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);
PIXI.loader.add("images/rocket.png");
//load an image and run the `setup` function when it's done
PIXI.loader.load(setup);

//This `setup` function will run when the image has loaded
function setup() {
  function gameLoop(delta: number) {
    game.cycle(delta);
    time += delta;
  }
  let game = new gameEngine(app);
  app.ticker.add(delta => gameLoop(delta));
}
var time = 0;

class Thing {

  private _status: string;

  static readonly STATUS = {
    OFF: "off",
    ON: "on"
  }

  // "on" or "off"
  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
    console.log("someone chnged status")
  }
}

let x = new Thing();
x.status == Thing.STATUS.ON;
x.status = Thing.STATUS.OFF;
