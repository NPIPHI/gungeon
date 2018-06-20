define(["require", "exports", "./gameObject", "./gameEngine", "./shapes"], function (require, exports, gameObject_1, gameEngine_1, shapes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class enemy extends gameObject_1.default {
        constructor(x, y) {
            super();
            this.sprites = new Array();
            this.hp = 0;
            this.dx = 0;
            this.dy = 0;
            this.x = 0;
            this.y = 0;
            this.time = 0;
            this.maxHp = 0;
            this.isDestroyed = false;
            this.x = x;
            this.y = y;
            this.target = new PIXI.Point(0, 0);
        }
        hitDetect() {
            gameEngine_1.playerBullets.forEach(bul => {
                if (bul.hitbox.touches(this.hitbox)) {
                    bul.destroy();
                    this.hp -= bul.dammage;
                    this.dx += Math.cos(bul.heading) * 0.1 * (bul.speed * bul.dammage);
                    this.dy += Math.sin(bul.heading) * 0.1 * (bul.speed * bul.dammage);
                    if (this.hp <= 0) {
                        if (!this.isDestroyed) {
                            this.dx = Math.cos(bul.heading) * Math.sqrt(bul.speed * bul.dammage);
                            this.dy = -Math.sin(bul.heading) * Math.sqrt(bul.speed * bul.dammage);
                            this.remove();
                            this.isDestroyed = true;
                        }
                    }
                }
            });
        }
    }
    class walker extends enemy {
        constructor(x, y) {
            super(x, y);
            this.state = 0;
            this.legState = 0;
            this.animImgs = Array();
        }
        update(deltaTime) {
            this.target = gameEngine_1.p1.hitbox.getCenter();
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
            this.hitDetect();
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
            super(x, y);
            this.dx = 0;
            this.dy = 0;
            this.time = 0;
            this.getTypeProperties(enemyType);
            gameEngine_1.foreGroundImage.addChild(this.body);
            gameEngine_1.foreGroundImage.addChild(this.gun);
            this.body.addChild(this.legs);
        }
        update(deltaTime) {
            super.update(deltaTime);
            this.calcGunPosition();
        }
        getTypeProperties(type) {
            let gunData;
            switch (type) {
                case 1:
                    this.AI = 1;
                    this.hp = 20;
                    this.maxHp = 20;
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
                    this.gun = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackPistol.png"]);
                    gunData = PIXI.loader.resources["res/gunData.json"].data.guns.blackPistol;
                    break;
            }
            this.gun.pivot = new PIXI.Point(gunData.handle.x, gunData.handle.y);
            this.barrelAngle = Math.atan2(gunData.barrel.y - gunData.handle.y, gunData.barrel.x - gunData.handle.x);
            this.barrelDist = shapes_1.rectangle.getDistance(new PIXI.Point(gunData.handle.x, gunData.handle.y), new PIXI.Point(gunData.barrel.x, gunData.barrel.y));
            this.barrel = new PIXI.Point(gunData.barrel.x, gunData.barrel.y);
            this.body.position.x = this.x;
            this.body.position.y = this.y;
            this.legs.position.y = this.body.height;
            this.hitbox = new shapes_1.rectangle(this.x, this.y, this.body.width, this.body.height + this.legs.height);
        }
        shoot() {
            let posit = this.getBarrelPoistion();
            gameEngine_1.gameEngine.makeBullet(posit.x, posit.y, shapes_1.rectangle.getAngle(posit, this.target), 0, 3, 4, 1, true);
        }
        calcGunPosition() {
            if (this.hitbox.getCenter().x < gameEngine_1.p1.hitbox.x) {
                if (this.hitbox.getCenter().y < this.target.y) {
                    this.gun.scale.x = 1;
                    this.gun.x = this.hitbox.x + this.hitbox.width;
                    this.gun.y = this.hitbox.getCenter().y;
                    this.gun.rotation = shapes_1.rectangle.getAngle(this.gun.getGlobalPosition(), this.target);
                }
                else {
                    this.gun.scale.x = -1;
                    this.gun.x = this.hitbox.x + this.hitbox.width;
                    this.gun.y = this.hitbox.getCenter().y;
                    this.gun.rotation = Math.PI + shapes_1.rectangle.getAngle(this.gun.getGlobalPosition(), this.target);
                }
            }
            else {
                if (this.hitbox.getCenter().y < this.target.y) {
                    this.gun.scale.x = -1;
                    this.gun.x = this.hitbox.x;
                    this.gun.y = this.hitbox.getCenter().y;
                    this.gun.rotation = Math.PI + shapes_1.rectangle.getAngle(this.gun.getGlobalPosition(), this.target);
                }
                else {
                    this.gun.scale.x = 1;
                    this.gun.x = this.hitbox.x;
                    this.gun.y = this.hitbox.getCenter().y;
                    this.gun.rotation = shapes_1.rectangle.getAngle(this.gun.getGlobalPosition(), this.target);
                }
            }
        }
        getBarrelPoistion() {
            if (this.gun.scale.x == 1) {
                return new PIXI.Point(this.gun.x + Math.cos(this.barrelAngle + this.gun.rotation) * this.barrelDist, this.gun.y + Math.sin(this.barrelAngle + this.gun.rotation) * this.barrelDist);
            }
            else {
                return new PIXI.Point(2 * (this.gun.x + Math.cos(this.gun.rotation - Math.PI / 2) * (this.gun.pivot.y - this.barrel.y)) - (this.gun.x + Math.cos(this.barrelAngle + this.gun.rotation) * this.barrelDist), 2 * (this.gun.y + Math.sin(this.gun.rotation - Math.PI / 2) * (this.gun.pivot.y - this.barrel.y)) - (this.gun.y + Math.sin(this.barrelAngle + this.gun.rotation) * this.barrelDist));
            }
        }
        remove() {
            super.destroy();
            gameEngine_1.foreGroundImage.removeChild(this.body);
            gameEngine_1.foreGroundImage.removeChild(this.gun);
            gameEngine_1.currentRoom.addFloorObject(this.hitbox.getCenter().x, this.hitbox.getCenter().y, 1, this.dx, -this.dy);
            gameEngine_1.currentRoom.addFloorObjectAdv(this.body.position.x + this.hitbox.width, this.body.position.y + 10, 2, this.dx * 2, -this.dy * 1.5, this.gun.rotation, 0.5, 0, 1);
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
    class boss extends enemy {
        constructor(x, y) {
            super(x, y);
        }
    }
    class potato extends boss {
        constructor(x, y) {
            super(x, y);
            this.hp = 1000;
            this.health = new gameEngine_1.bigHealthBar(50, 1000, 1820, this.hp);
            this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["potatoBoss.png"]);
            this.sprite.x = x;
            this.sprite.y = y;
            this.hitbox = new shapes_1.rectangle(x, y, 40, 60);
            this.time = 0;
            gameEngine_1.foreGroundImage.addChild(this.sprite);
        }
        update(deltaTime) {
            this.hitDetect();
            this.health.setPointer(this.hp);
            let dispersion = (Math.random() - 0.5);
            this.sprite.y = this.y;
            this.sprite.x = this.x;
            this.target = gameEngine_1.p1.hitbox.getCenter();
        }
        remove() {
            super.destroy();
            gameEngine_1.foreGroundImage.removeChild(this.sprite);
            gameEngine_1.currentRoom.addFloorObject(this.hitbox.getCenter().x, this.hitbox.getCenter().y, 3, this.dx, this.dy);
            this.health.remove();
            for (let i = 0; i < 250; i++) {
                let launchRate = Math.random() * 1.5;
                gameEngine_1.currentRoom.addFloorObjectAdv(i * 7 + 50, 1000, 4, Math.random() * 10 * launchRate - 5 * launchRate, Math.random() * 12 * launchRate - 6 * launchRate, Math.random() * Math.PI, Math.random() * Math.PI, 0.01, 1 / launchRate + 0.5);
            }
        }
    }
    exports.potato = potato;
});
//# sourceMappingURL=enemys.js.map