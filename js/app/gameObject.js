define(["require", "exports", "./gameEngine"], function (require, exports, gameEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameObject {
        constructor() {
            this.rem = false;
            gameEngine_1.bufferGameObjects.push(this);
        }
        update(deltaTime) {
        }
        destroy() {
            if (!this.rem) {
                gameEngine_1.removeGameObjects.push(this);
                this.rem = true;
            }
        }
    }
    exports.default = gameObject;
});
//# sourceMappingURL=gameObject.js.map