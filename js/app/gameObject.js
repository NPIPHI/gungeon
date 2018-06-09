define(["require", "exports", "./gameEngine"], function (require, exports, gameEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameObject {
        constructor() {
            gameEngine_1.bufferGameObjects.push(this);
        }
        update(deltaTime) {
        }
        destroy() {
            gameEngine_1.removeGameObjects.push(this);
        }
    }
    exports.default = gameObject;
});
//# sourceMappingURL=gameObject.js.map