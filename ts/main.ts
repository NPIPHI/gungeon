///<reference types="pixi.js"/>

let app = new PIXI.Application({width: 800, height: 800});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

let rocket: PIXI.Sprite;

//load an image and run the `setup` function when it's done
PIXI.loader
  .add("images/rocket.png")
  .load(setup);

//This `setup` function will run when the image has loaded
function setup() {

  //Create the cat sprite
  rocket = new PIXI.Sprite(PIXI.loader.resources["images/rocket.png"].texture);
  rocket.y = 200;
  
  //Add the cat to the stage
  app.stage.addChild(rocket);

  app.ticker.add(delta => gameLoop(delta));
}

let time = 0;
function gameLoop(delta: number) {
    time += delta;
    rocket.x = 400 + 400 * Math.sin(time / 73);
    rocket.rotation += 0.01;
    let scale = 0.5 + Math.sin(time / 100) * 0.25;
    rocket.scale = new PIXI.Point(scale, scale);
}
