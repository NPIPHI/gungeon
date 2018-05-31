define(["require", "exports", "./keyboard", "./gameObject", "./rectangle"], function (require, exports, keyboard_1, gameObject_1, rectangle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameEngine {
        constructor(app) {
            pixi = app;
            testRects = new Array();
            testRects.push(new rectangle_1.default(0, 0, 500, 30));
        }
        makePlayer(x, y) {
            new player(x, y);
        }
        cycle(deltaTime, time) {
            gameObjects.forEach(element => {
                element.update();
            });
        }
    }
    exports.gameEngine = gameEngine;
    ;
    let pixi;
    let gameObjects = new Array();
    let testRects;
    class player extends gameObject_1.default {
        constructor(x, y) {
            super();
            this.mov = new PIXI.Point(0, 0);
            this.hitbox = new rectangle_1.default(0, 0, 40, 40);
            this.grounded = false;
            this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("images/playerSmile.png"));
            this.sprite.position = new PIXI.Point(x, y);
            gameObjects.push(this);
            pixi.stage.addChild(this.sprite);
        }
        update() {
            this.keyboardManage();
            this.sprite.position.x += this.mov.x;
            this.sprite.position.y += this.mov.y;
            this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
            this.collision();
            this.mov.set(0, 0);
        }
        keyboardManage() {
            if (keyboard_1.default.getKey(87)) {
                this.mov.y -= 3;
            }
            if (keyboard_1.default.getKey(65)) {
                this.mov.x += -3;
            }
            if (keyboard_1.default.getKey(83)) {
                this.mov.y += 3;
            }
            if (keyboard_1.default.getKey(68)) {
                this.mov.x += 3;
            }
        }
        collision() {
            let collisionRects = new Array();
            testRects.forEach(r => {
                if (r.touches(this.hitbox)) {
                    collisionRects.push(r);
                }
            });
            collisionRects.forEach(r => {
                if (this.mov.x > 0) {
                    if ((this.sprite.position.x + this.hitbox.width) - r.x < this.mov.x * 2 && !(r.y + this.mov.y >= this.sprite.position.y + this.hitbox.height || r.y + r.height - this.mov.y <= this.sprite.position.y)) {
                        this.sprite.position.x = -this.hitbox.width + r.x;
                        this.mov.set(0, this.mov.y);
                    }
                }
                if (this.mov.x < 0) {
                    if ((r.x + r.width) - this.sprite.position.x < -this.mov.x * 2 && !(r.y + this.mov.y >= this.sprite.position.y + this.hitbox.height || r.y + r.height - this.mov.y <= this.sprite.position.y)) {
                        this.sprite.position.x = r.x + r.width;
                        this.mov.set(0, this.mov.y);
                    }
                }
                if (this.mov.y > 0) {
                    if ((this.sprite.position.y + this.hitbox.height) - r.y <= this.mov.y * 2 && !(r.x >= this.sprite.position.x + this.hitbox.width || r.x + r.width <= this.sprite.position.x)) {
                        this.sprite.position.y = -this.hitbox.height + r.y;
                        this.grounded = true;
                        this.mov.set(this.mov.x, 0);
                    }
                }
                if (this.mov.y < 0) {
                    if ((r.y + r.height) - this.sprite.position.y < -this.mov.y * 2 && !(r.x >= this.sprite.position.x + this.hitbox.width || r.x + r.width <= this.sprite.position.x)) {
                        this.sprite.position.y = r.y + r.height;
                        this.mov.set(this.mov.x, 0);
                    }
                }
            });
        }
    }
});
//# sourceMappingURL=gameEngine.js.map