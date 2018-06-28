define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Keyboard {
        constructor() {
            this.mouseX = 0;
            this.mouseY = 0;
            this.APressed = false;
            this.BPressed = false;
            this.XPressed = false;
            this.YPressed = false;
            this.map = {};
            this.toggleMap = {};
            window.addEventListener('keydown', evt => {
                if (!this.map[evt.keyCode]) {
                    this.toggleMap[evt.keyCode] = true;
                }
                else {
                    this.toggleMap[evt.keyCode] = false;
                }
                if (evt.keyCode == 9) {
                    evt.preventDefault();
                }
                this.map[evt.keyCode] = true;
            });
            window.addEventListener('keyup', evt => {
                this.map[evt.keyCode] = false;
                this.toggleMap[evt.keyCode] = false;
            });
            window.addEventListener('mousemove', evt => {
                this.mouseX = evt.x;
                this.mouseY = evt.y;
            });
            window.addEventListener('mousedown', evt => {
                switch (evt.which) {
                    case 1:
                        this.leftToggle = true;
                        this.leftDown = true;
                        break;
                    case 2:
                        this.middleToggle = true;
                        this.middleDown = true;
                        break;
                    case 3:
                        this.rightToggle = true;
                        this.rightDown = true;
                        break;
                }
            });
            window.addEventListener("mouseup", evt => {
                switch (evt.which) {
                    case 1:
                        this.leftDown = false;
                        this.leftToggle = false;
                        break;
                    case 2:
                        this.middleDown = false;
                        this.middleToggle = false;
                        break;
                    case 3:
                        this.rightDown = false;
                        this.rightToggle = false;
                        break;
                }
            });
        }
        getKey(code) {
            return !!this.map[code];
        }
        getToggle(code) {
            return !!this.toggleMap[code];
        }
        getMouse(clickType) {
            switch (clickType) {
                case 1:
                    return this.leftDown;
                case 2:
                    return this.middleDown;
                case 3:
                    return this.rightDown;
            }
        }
        getMouseToggle(clickType) {
            switch (clickType) {
                case 1:
                    return this.leftToggle;
                case 2:
                    return this.middleToggle;
                case 3:
                    return this.rightToggle;
            }
        }
        resetToggle() {
            this.leftToggle = false;
            this.middleToggle = false;
            this.rightToggle = false;
            for (let i = 0; i < 250; i++) {
                this.toggleMap[i] = false;
            }
        }
    }
    let kbrd = new Keyboard;
    exports.default = kbrd;
});
//# sourceMappingURL=keyboard.js.map