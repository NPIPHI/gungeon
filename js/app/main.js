define(["require", "exports", "./gameEngine"], function (require, exports, gameEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let app = new PIXI.Application({ width: screen.width, height: screen.height });
    document.body.appendChild(app.view);
    PIXI.loader.add("images/playerSmile.png");
    PIXI.loader.add("images/backGroundTexture.json");
    PIXI.loader.add("images/bullets.json");
    PIXI.loader.add("images/UIElements.json");
    PIXI.loader.load(setup);
    function setup() {
        function gameLoop(delta) {
            game.cycle(delta, time);
            time += delta;
        }
        app.renderer.backgroundColor = 0x0000ff;
        let game = new gameEngine_1.gameEngine(app);
        app.ticker.add(delta => gameLoop(delta));
    }
    var time = 0;
});
//# sourceMappingURL=main.js.map