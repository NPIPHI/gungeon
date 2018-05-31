define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Keyboard {
        constructor() {
            this.map = {};
            window.addEventListener('keydown', evt => {
                this.map[evt.keyCode] = true;
            });
            window.addEventListener('keyup', evt => {
                this.map[evt.keyCode] = false;
            });
        }
        getKey(code) {
            return !!this.map[code];
        }
    }
    let kbrd = new Keyboard;
    exports.default = kbrd;
});
//# sourceMappingURL=keyboard.js.map