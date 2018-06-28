import {gameEngine} from "./gameEngine";
let app = new PIXI.Application({width: screen.width, height: screen.height});
document.body.appendChild(app.view);
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.loader.add("res/playerSmile.png");
PIXI.loader.add("res/backGroundTexture.json");
PIXI.loader.add("res/bullets.json");
PIXI.loader.add("res/UIElements.json");
PIXI.loader.add("res/gunData.json");
PIXI.loader.add("res/characters.json");
PIXI.loader.add("res/guns.json");
PIXI.loader.add("res/gunShot.mp3");
PIXI.loader.load(setup);
function setup() {
  function gameLoop(delta: number) {
    game.cycle(delta, time);
    time += delta;
  }
  app.renderer.backgroundColor = 0x0000ff;
  let game = new gameEngine(app);
  app.ticker.add(delta => gameLoop(delta));
}
var time = 0;

export class load{
  static loadBoardered(json: string, file: string):PIXI.Texture{
      let bufferTexture = PIXI.loader.resources["res/"+json+".json"].textures[file+".png"];
      return new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x+1,bufferTexture.frame.y+1,bufferTexture.width-2,bufferTexture.height-2));
  }
  static loadUnboardered(json: string, file: string):PIXI.Texture{
      return PIXI.loader.resources["res/"+json+".json"].textures[file+".png"];
  }
}
/*class Thing {

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
x.status = Thing.STATUS.OFF;*/
