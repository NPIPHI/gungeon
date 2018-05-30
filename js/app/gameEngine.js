define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameEngine {
        constructor(app) {
            this.shapes = new PIXI.Graphics;
            this.path = [];
            this.rocket = new PIXI.Sprite(PIXI.loader.resources["images/rocket.png"].texture);
            var pixi = app;
            app.stage.addChild(this.shapes);
            app.stage.addChild(this.rocket);
        }
        makeRocket(x, y) {
            this.rocket.y = y;
            this.rocket.x = x;
        }
        cycle(time) {
            this.rocket.x = 400 + 400 * Math.sin(time / 73);
            this.rocket.rotation += 0.01;
            let scale = 0.5 + Math.sin(time / 100) * 0.25;
            this.rocket.scale = new PIXI.Point(scale, scale);
            this.path.push(new PIXI.Point(this.rocket.x, this.rocket.y));
            this.path.forEach(pt => this.shapes.drawRect(pt.x, pt.y, 1, 1));
        }
    }
    exports.default = gameEngine;
    ;
});
//# sourceMappingURL=gameEngine.js.map