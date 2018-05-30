let app = new PIXI.Application({ width: 800, height: 800 });
document.body.appendChild(app.view);
let rocket;
PIXI.loader
    .add("images/rocket.png")
    .load(setup);
function setup() {
    rocket = new PIXI.Sprite(PIXI.loader.resources["images/rocket.png"].texture);
    rocket.y = 200;
    app.stage.addChild(rocket);
    app.ticker.add(delta => gameLoop(delta));
}
let time = 0;
function gameLoop(delta) {
    time += delta;
    rocket.x = 400 + 400 * Math.sin(time / 73);
    rocket.rotation += 0.01;
    let scale = 0.5 + Math.sin(time / 100) * 0.25;
    rocket.scale = new PIXI.Point(scale, scale);
}
//# sourceMappingURL=main.js.map