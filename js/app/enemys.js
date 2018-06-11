define(["require", "exports", "./gameObject", "./gameEngine", "./shapes"], function (require, exports, gameObject_1, gameEngine_1, shapes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class enemy extends gameObject_1.default {
    }
    class walker extends enemy {
        constructor() {
            super();
            this.state = 0;
            this.legState = 0;
            this.animImgs = Array();
        }
        update(deltaTime) {
            this.time += deltaTime;
            switch (this.state) {
                case 0:
                    if (shapes_1.rectangle.getDistance(gameEngine_1.p1.hitbox.getCenter(), this.hitbox.getCenter()) > 300) {
                        this.moveTo(deltaTime, shapes_1.rectangle.getAngle(this.hitbox.getCenter(), gameEngine_1.p1.hitbox.getCenter()));
                    }
                    else {
                        this.changeState(1);
                    }
                    if (this.time - this.eventTime > 15) {
                        this.incrememtLegs();
                        this.eventTime = this.time;
                    }
                    break;
                case 1:
                    if (this.time - this.eventTime > 40) {
                        this.shoot();
                        this.changeState(2);
                    }
                case 2:
                    if (this.time - this.eventTime > 60) {
                        this.changeState(0);
                    }
            }
            if (this.y + this.x - gameEngine_1.p1.hitbox.x > gameEngine_1.p1.hitbox.y) {
                if (this.y - this.x + gameEngine_1.p1.hitbox.x > gameEngine_1.p1.hitbox.y) {
                    this.body.texture = this.animImgs[1];
                }
                else {
                    this.body.texture = this.animImgs[2];
                }
            }
            else {
                if (this.y - this.x + gameEngine_1.p1.hitbox.x > gameEngine_1.p1.hitbox.y) {
                    this.body.texture = this.animImgs[3];
                }
                else {
                    this.body.texture = this.animImgs[0];
                }
            }
            this.hitbox = this.hitbox.translateAbsolute(this.x, this.y);
            gameEngine_1.playerBullets.forEach(bul => {
                if (bul.hitbox.touches(this.hitbox)) {
                    bul.destroy();
                    this.hp -= bul.dammage;
                    this.dx += Math.cos(bul.heading) * 0.1 * (bul.speed * bul.dammage);
                    this.dy += Math.sin(bul.heading) * 0.1 * (bul.speed * bul.dammage);
                    if (this.hp <= 0) {
                        this.dx = Math.cos(bul.heading) * Math.sqrt(bul.speed * bul.dammage);
                        this.dy = -Math.sin(bul.heading) * Math.sqrt(bul.speed * bul.dammage);
                        this.destroy();
                    }
                }
            });
            this.x += this.dx;
            this.y += this.dy;
            let modFric = this.getFrictionModifyer();
            this.dx *= this.friction * modFric;
            this.dy *= this.friction * modFric;
            this.body.x = this.x;
            this.body.y = this.y;
        }
        moveTo(deltaTime, angle) {
            this.dx += deltaTime * Math.cos(angle) * this.speed;
            this.dy += deltaTime * Math.sin(angle) * this.speed;
        }
        getFrictionModifyer() {
            return 1;
        }
        changeState(state) {
            switch (state) {
                case 0:
                    this.state = 0;
                    break;
                case 1:
                    this.setLegs(0);
                    this.state = 1;
                    break;
                case 2:
                    this.setLegs(0);
                    this.state = 2;
            }
            this.eventTime = this.time;
        }
    }
    class bulletMan extends walker {
        constructor(x, y, enemyType) {
            super();
            this.x = x;
            this.y = y;
            this.dx = 0;
            this.dy = 0;
            this.time = 0;
            this.getTypeProperties(enemyType);
            gameEngine_1.foreGroundImage.addChild(this.body);
            this.body.addChild(this.legs);
        }
        getTypeProperties(type) {
            switch (type) {
                case 1:
                    this.AI = 1;
                    this.hp = 200;
                    this.speed = 3;
                    this.friction = 0.3;
                    this.body = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletMan.png"]);
                    this.legs = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletManLegs0.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletMan.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManBack.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManLeft.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManRight.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManLegs0.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManLegs1.png"]);
                    this.animImgs.push(PIXI.loader.resources["res/characters.json"].textures["bulletManLegs2.png"]);
                    break;
            }
            this.body.position.x = this.x;
            this.body.position.y = this.y;
            this.legs.position.y = this.body.height;
            this.hitbox = new shapes_1.rectangle(this.x, this.y, this.body.width, this.body.height + this.legs.height);
        }
        shoot() {
            gameEngine_1.gameEngine.makeBullet(this.hitbox.getCenter().x, this.hitbox.getCenter().y, shapes_1.rectangle.getAngle(this.hitbox.getCenter(), gameEngine_1.p1.hitbox.getCenter()), 3, 4, 1, true);
        }
        destroy() {
            super.destroy();
            gameEngine_1.foreGroundImage.removeChild(this.body);
            gameEngine_1.currentRoom.addFloorObject(this.body.position.x, this.body.position.y, 1, this.dx, -this.dy);
        }
        incrememtLegs() {
            this.legState++;
            this.legState %= 4;
            if (this.legState == 2 || this.legState == 0) {
                this.setLegs(0);
            }
            else {
                this.setLegs(this.legState);
            }
        }
        setLegs(index) {
            switch (index) {
                case 0:
                    this.legs.texture = this.animImgs[4];
                    break;
                case 1:
                    this.legs.texture = this.animImgs[5];
                case 2:
                    this.legs.texture = this.animImgs[6];
            }
        }
    }
    exports.bulletMan = bulletMan;
});
//# sourceMappingURL=enemys.js.map