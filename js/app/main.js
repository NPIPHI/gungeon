define(["require", "exports", "./gameEngine"], function (require, exports, gameEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let app = new PIXI.Application({ width: screen.width, height: screen.height });
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
        function gameLoop(delta) {
            game.cycle(delta, time);
            time += delta;
        }
        app.renderer.backgroundColor = 0x0000ff;
        let game = new gameEngine_1.gameEngine(app);
        app.ticker.add(delta => gameLoop(delta));
    }
    var time = 0;
    class load {
        static loadBoardered(json, file) {
            let bufferTexture = PIXI.loader.resources["res/" + json + ".json"].textures[file + ".png"];
            return new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x + 1, bufferTexture.frame.y + 1, bufferTexture.width - 2, bufferTexture.height - 2));
        }
        static loadUnboardered(json, file) {
            return PIXI.loader.resources["res/" + json + ".json"].textures[file + ".png"];
        }
    }
    exports.load = load;
});
//# sourceMappingURL=main.js.map