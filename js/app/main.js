define(["require", "exports", "./gameEngine"], function (require, exports, gameEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let app = new PIXI.Application({ width: 800, height: 800 });
    document.body.appendChild(app.view);
    PIXI.loader.add("images/rocket.png");
    PIXI.loader.load(setup);
    function setup() {
        function gameLoop(delta) {
            game.cycle(delta);
            time += delta;
        }
        let game = new gameEngine_1.default(app);
        app.ticker.add(delta => gameLoop(delta));
    }
    var time = 0;
    class Thing {
        get status() {
            return this._status;
        }
        set status(value) {
            this._status = value;
            console.log("someone chnged status");
        }
    }
    Thing.STATUS = {
        OFF: "off",
        ON: "on"
    };
    let x = new Thing();
    x.status == Thing.STATUS.ON;
    x.status = Thing.STATUS.OFF;
});
//# sourceMappingURL=main.js.map