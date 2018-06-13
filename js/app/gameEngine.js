define(["require", "exports", "./shapes", "./keyboard", "./gameObject", "./enemys"], function (require, exports, shapes_1, keyboard_1, gameObject_1, enemys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameEngine {
        constructor(app) {
            pixiApp = app;
            timeDilate = 1;
            this.mouse = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures["cursor1.png"]);
            pixiApp.stage.addChild(exports.backGroundImage);
            pixiApp.stage.addChild(exports.midGroundImage);
            pixiApp.stage.addChild(exports.foreGroundImage);
            pixiApp.stage.addChild(exports.lighting);
            pixiApp.stage.addChild(UIImage);
            UIImage.addChild(this.mouse);
            this.generateFloor();
            exports.currentRoom = new room(new shapes_1.rectangle(0, 0, 0, 0));
            this.makePlayer(100, 100);
            new enemys_1.bulletMan(200, 200, 1);
            new enemys_1.bulletMan(300, 200, 1);
            new enemys_1.bulletMan(400, 200, 1);
            new enemys_1.bulletMan(500, 200, 1);
            new enemys_1.bulletMan(600, 200, 1);
            new enemys_1.bulletMan(700, 200, 1);
            new enemys_1.bulletMan(800, 200, 1);
            new enemys_1.bulletMan(900, 200, 1);
        }
        makePlayer(x, y) {
            exports.p1 = new player(x, y);
        }
        cycle(deltaTime, time) {
            this.mouse.position.x = keyboard_1.default.mouseX - this.mouse.width / 2;
            this.mouse.position.y = keyboard_1.default.mouseY - this.mouse.width / 2;
            exports.gameObjects.forEach(element => {
                element.update(deltaTime * timeDilate);
            });
            exports.currentRoom.update(deltaTime * timeDilate);
            exports.removeGameObjects.forEach(obj => {
                exports.gameObjects.splice(exports.gameObjects.indexOf(obj), 1);
            });
            bufferBullets.forEach(obj => {
                if (obj.enemy) {
                    exports.enemyBullets.push(obj);
                }
                else {
                    exports.playerBullets.push(obj);
                }
            });
            bufferBullets = new Array();
            exports.bufferGameObjects.forEach(obj => {
                exports.gameObjects.push(obj);
            });
            exports.bufferGameObjects = Array();
            exports.removeGameObjects = Array();
            animator.animate(deltaTime * timeDilate);
            if (keyboard_1.default.getKey(39)) {
                timeDilate += 0.01;
            }
            if (keyboard_1.default.getKey(37)) {
                if (timeDilate > 0) {
                    timeDilate -= 0.01;
                }
            }
            keyboard_1.default.resetToggle();
        }
        generateFloor() {
            exports.backGroundImage.removeChildren();
            walls = Array();
            for (let i = 0; i < 60; i++) {
                let bufferTexture = wall.getFloorTexture();
                let bufferSprite = new PIXI.Sprite(bufferTexture);
                bufferSprite.x = (i % 10) * 192;
                bufferSprite.y = Math.floor(i / 10) * 192;
                exports.backGroundImage.addChild(bufferSprite);
            }
            new wall(0, 0, 1920, 50);
            new wall(0, 0, 50, 1080);
            new wall(0, 1030, 1920, 50);
            new wall(1870, 0, 50, 1080);
        }
        static makeBullet(x, y, heading, typeIndex, speed, dammage, enemy) {
            new bullet(x, y, heading, typeIndex, speed, dammage, enemy);
        }
    }
    exports.gameEngine = gameEngine;
    ;
    class player extends gameObject_1.default {
        constructor(x, y) {
            super();
            this.mov = new PIXI.Point(0, 0);
            this.movSpeed = 0.25;
            this.guns = Array();
            this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("res/playerSmile.png"));
            this.sprite.position = new PIXI.Point(x, y);
            this.reloadBar = new progressBar(x, y - 50, 40, 1);
            this.ammoCounter = new fractionCounter(screen.width - 50, screen.height - 50, 0, 0, true);
            this.guns.push(new gun(1));
            this.guns.push(new gun(11));
            this.guns[0].switchGunIn(this.ammoCounter, this.reloadBar);
            this.currentGun = 0;
            this.hitbox = new shapes_1.rectangle(x, y, this.sprite.width, this.sprite.height);
            exports.foreGroundImage.addChild(this.sprite);
        }
        update(deltaTime) {
            this.calcMov();
            this.sprite.position.x += this.mov.x * deltaTime;
            this.sprite.position.y += this.mov.y * deltaTime;
            this.hitbox = this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
            this.collision(deltaTime);
            this.mov.set(0, 0);
            if (this.guns[this.currentGun].automatic) {
                if (keyboard_1.default.getMouse(1)) {
                    this.guns[this.currentGun].shoot();
                }
            }
            else {
                if (keyboard_1.default.getMouseToggle(1)) {
                    this.guns[this.currentGun].shoot();
                }
            }
            if (keyboard_1.default.getMouseToggle(3)) {
                this.guns[this.currentGun].reload();
            }
            if (keyboard_1.default.getToggle(9)) {
                this.guns[this.currentGun].switchGunOut();
                this.currentGun++;
                this.currentGun %= this.guns.length;
                this.guns[this.currentGun].switchGunIn(this.ammoCounter, this.reloadBar);
            }
            for (let i = 49; i < 58; i++) {
                if (keyboard_1.default.getToggle(i)) {
                    this.guns[this.currentGun].switchGunOut();
                    this.currentGun = Math.max(0, Math.min(this.guns.length - 1, i - 49));
                    this.guns[this.currentGun].switchGunIn(this.ammoCounter, this.reloadBar);
                }
            }
            if (keyboard_1.default.getToggle(48)) {
                this.guns[this.currentGun].switchGunOut();
                this.currentGun = this.guns.length - 1;
                this.guns[this.currentGun].switchGunIn(this.ammoCounter, this.reloadBar);
            }
            this.guns[this.currentGun].update(deltaTime);
        }
        calcMov() {
            if (keyboard_1.default.getKey(87)) {
                this.mov.y -= 2;
            }
            if (keyboard_1.default.getKey(65)) {
                this.mov.x += -2;
            }
            if (keyboard_1.default.getKey(83)) {
                this.mov.y += 2;
            }
            if (keyboard_1.default.getKey(68)) {
                this.mov.x += 2;
            }
        }
        collision(deltaTime) {
            let collisionRects = new Array();
            walls.forEach(r => {
                if (r.touches(this.hitbox)) {
                    collisionRects.push(r);
                }
            });
            collisionRects.forEach(r => {
                if (this.mov.x * deltaTime > 0) {
                    if ((this.sprite.position.x + this.hitbox.width) - r.x < this.mov.x * 2 * deltaTime && !(r.y + this.mov.y * deltaTime >= this.sprite.position.y + this.hitbox.height || r.y + r.height - this.mov.y * deltaTime <= this.sprite.position.y)) {
                        this.sprite.position.x = -this.hitbox.width + r.x;
                        this.mov.set(0, this.mov.y);
                    }
                }
                if (this.mov.x * deltaTime < 0) {
                    if ((r.x + r.width) - this.sprite.position.x < -this.mov.x * 2 * deltaTime && !(r.y + this.mov.y * deltaTime >= this.sprite.position.y + this.hitbox.height || r.y + r.height - this.mov.y * deltaTime <= this.sprite.position.y)) {
                        this.sprite.position.x = r.x + r.width;
                        this.mov.set(0, this.mov.y);
                    }
                }
                if (this.mov.y * deltaTime > 0) {
                    if ((this.sprite.position.y + this.hitbox.height) - r.y <= this.mov.y * 2 * deltaTime && !(r.x >= this.sprite.position.x + this.hitbox.width || r.x + r.width <= this.sprite.position.x)) {
                        this.sprite.position.y = -this.hitbox.height + r.y;
                        this.mov.set(this.mov.x, 0);
                    }
                }
                if (this.mov.y * deltaTime < 0) {
                    if ((r.y + r.height) - this.sprite.position.y < -this.mov.y * 2 * deltaTime && !(r.x >= this.sprite.position.x + this.hitbox.width || r.x + r.width <= this.sprite.position.x)) {
                        this.sprite.position.y = r.y + r.height;
                        this.mov.set(this.mov.x, 0);
                    }
                }
            });
        }
        destroy() {
            super.destroy();
            exports.foreGroundImage.removeChild(this.sprite);
        }
    }
    class bullet extends gameObject_1.default {
        constructor(x, y, heading, typeIndex, speed, dammage, enemy) {
            super();
            this.isDestroyed = false;
            this.sprite = new PIXI.Sprite(this.getBulletType(typeIndex));
            this.sprite.x = x - this.sprite.width / 2;
            this.sprite.y = y - this.sprite.height / 2;
            this.x = x;
            this.y = y;
            this.hitbox = new shapes_1.rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height);
            this.heading = heading;
            this.dammage = dammage;
            this.speed = speed;
            this.sprite.rotation = heading;
            this.type = typeIndex;
            this.enemy = enemy;
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.5;
            bufferBullets.push(this);
            exports.foreGroundImage.addChild(this.sprite);
        }
        update(deltaTime) {
            this.x += this.speed * Math.cos(this.heading) * deltaTime;
            this.y += this.speed * Math.sin(this.heading) * deltaTime;
            this.sprite.x = this.x + this.sprite.width / 2;
            this.sprite.y = this.y + this.sprite.height / 2;
            this.hitbox = this.hitbox.translateAbsolute(this.x, this.y);
            walls.forEach(r => {
                if (this.hitbox.intersects(r)) {
                    this.sprite.texture = PIXI.Texture.WHITE;
                    this.destroy();
                }
            });
        }
        destroy() {
            if (!this.isDestroyed) {
                try {
                    super.destroy();
                    animator.makeAnimation(this.hitbox.getCenter().x, this.hitbox.getCenter().y, this.type, this.heading);
                    this.isDestroyed = true;
                    exports.foreGroundImage.removeChild(this.sprite);
                    if (this.enemy) {
                        exports.enemyBullets.splice(exports.enemyBullets.indexOf(this), 1);
                    }
                    else {
                        exports.playerBullets.splice(exports.playerBullets.indexOf(this), 1);
                        ;
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        getBulletType(index) {
            switch (index) {
                case 1:
                    return PIXI.loader.resources["res/bullets.json"].textures["smallYellow.png"];
                case 2:
                    return PIXI.loader.resources["res/bullets.json"].textures["crossBolt.png"];
                case 3:
                    return PIXI.loader.resources["res/bullets.json"].textures["smallRed.png"];
                case 4:
                    return PIXI.loader.resources["res/bullets.json"].textures["nail.png"];
            }
            return PIXI.Texture.WHITE;
        }
    }
    class explosion extends bullet {
        constructor(x, y, radius, type, dammage) {
            super(x, y, 0, type, 0, dammage, true);
            this.framePassed = false;
            exports.playerBullets.push(this);
        }
        update() {
            if (this.framePassed) {
            }
            else {
                this.framePassed = true;
            }
        }
        destroy() {
        }
        expire() {
            exports.enemyBullets.splice(exports.enemyBullets.indexOf(this), 1);
            exports.playerBullets.splice(exports.playerBullets.indexOf(this), 1);
        }
    }
    class gun {
        constructor(type) {
            this.reloading = false;
            this.reloadProg = 0;
            this.shotCooldown = 0;
            if (type != 0) {
                this.getTypePropeties(type);
                exports.foreGroundImage.addChild(this.sprite);
            }
        }
        getTypePropeties(type) {
            let gun;
            switch (type) {
                case 1:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.blackPistol;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackPistol.png"]);
                    break;
                case 2:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.woodAK;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["woodAK.png"]);
                    break;
                case 3:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.metalSidearm;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["metalSidearm.png"]);
                    break;
                case 4:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.blackSidearm;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackSidearm.png"]);
                    break;
                case 5:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.barrelMachineGun;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["barrelMachineGun.png"]);
                    break;
                case 6:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.dEagle;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["dEagle.png"]);
                    break;
                case 7:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.woodSidearm;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["woodSidearm.png"]);
                    break;
                case 8:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.barrelWood;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["barrelWood.png"]);
                    break;
                case 9:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.blackSniper;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackSniper.png"]);
                    break;
                case 10:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.woodShotGun;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["woodShotGun.png"]);
                    break;
                case 11:
                    gun = PIXI.loader.resources["res/gunData.json"].data.guns.nailGun;
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["nailGun.png"]);
                    break;
            }
            this.sprite.pivot = new PIXI.Point(gun.handle.x, gun.handle.y);
            this.fireRate = gun.fireRate;
            this.fireSpeed = gun.fireSpeed;
            this.dammage = gun.dammage;
            this.bulletType = gun.bulletType;
            this.capacity = gun.capacity;
            this.reloadTime = gun.reloadTime;
            this.totalCapacity = gun.totalCapacity;
            this.currentRounds = this.totalCapacity;
            this.currentLoad = this.capacity;
            this.automatic = gun.automatic;
            this.isActive = false;
            this.bulletSpread = gun.bulletSpread;
            this.bulletNum = gun.bulletNum;
            this.barrelAngle = Math.atan2(gun.barrel.y - gun.handle.y, gun.barrel.x - gun.handle.x);
            this.barrelDist = shapes_1.rectangle.getDistance(new PIXI.Point(gun.handle.x, gun.handle.y), new PIXI.Point(gun.barrel.x, gun.barrel.y));
            this.barrel = new PIXI.Point(gun.barrel.x, gun.barrel.y);
        }
        calcGunPosition() {
            if (exports.p1.hitbox.getCenter().x < keyboard_1.default.mouseX) {
                if (exports.p1.hitbox.getCenter().y < keyboard_1.default.mouseY) {
                    this.sprite.scale.x = 1;
                    this.sprite.x = exports.p1.hitbox.x + exports.p1.hitbox.width;
                    this.sprite.y = exports.p1.hitbox.getCenter().y;
                    this.sprite.rotation = shapes_1.rectangle.getAngle(this.sprite.getGlobalPosition(), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                }
                else {
                    this.sprite.scale.x = -1;
                    this.sprite.x = exports.p1.hitbox.x + exports.p1.hitbox.width;
                    this.sprite.y = exports.p1.hitbox.getCenter().y;
                    this.sprite.rotation = Math.PI + shapes_1.rectangle.getAngle(this.sprite.getGlobalPosition(), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                }
            }
            else {
                if (exports.p1.hitbox.getCenter().y < keyboard_1.default.mouseY) {
                    this.sprite.scale.x = -1;
                    this.sprite.x = exports.p1.hitbox.x;
                    this.sprite.y = exports.p1.hitbox.getCenter().y;
                    this.sprite.rotation = Math.PI + shapes_1.rectangle.getAngle(this.sprite.getGlobalPosition(), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                }
                else {
                    this.sprite.scale.x = 1;
                    this.sprite.x = exports.p1.hitbox.x;
                    this.sprite.y = exports.p1.hitbox.getCenter().y;
                    this.sprite.rotation = shapes_1.rectangle.getAngle(this.sprite.getGlobalPosition(), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                }
            }
        }
        getBarrelPoistion() {
            if (this.sprite.scale.x == 1) {
                return new PIXI.Point(this.sprite.x + Math.cos(this.barrelAngle + this.sprite.rotation) * this.barrelDist, this.sprite.y + Math.sin(this.barrelAngle + this.sprite.rotation) * this.barrelDist);
            }
            else {
                return new PIXI.Point(2 * (this.sprite.x + Math.cos(this.sprite.rotation - Math.PI / 2) * (this.sprite.pivot.y - this.barrel.y)) - (this.sprite.x + Math.cos(this.barrelAngle + this.sprite.rotation) * this.barrelDist), 2 * (this.sprite.y + Math.sin(this.sprite.rotation - Math.PI / 2) * (this.sprite.pivot.y - this.barrel.y)) - (this.sprite.y + Math.sin(this.barrelAngle + this.sprite.rotation) * this.barrelDist));
            }
        }
        shoot() {
            if (!this.reloading) {
                if (this.currentLoad > 0) {
                    if (this.shotCooldown <= 0) {
                        let angle = shapes_1.rectangle.getAngle(this.getBarrelPoistion(), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                        for (let i = 0; i < this.bulletNum; i++) {
                            new bullet(this.getBarrelPoistion().x, this.getBarrelPoistion().y, angle + (Math.random() - 0.5) * this.bulletSpread, this.bulletType, this.fireSpeed, this.dammage, false);
                        }
                        this.shotCooldown = this.fireRate;
                        this.currentLoad--;
                        this.currentRounds--;
                        exports.p1.ammoCounter.setValue(this.currentLoad, this.currentRounds);
                        if (this.capacity == 1) {
                            this.reload();
                        }
                    }
                }
                else {
                    this.reload();
                }
            }
        }
        switchGunOut() {
            this.reloading = false;
            this.reloadProg = 0;
            this.isActive = false;
            this.sprite.visible = false;
        }
        switchGunIn(ammoCounter, reloadBar) {
            ammoCounter.setValue(this.currentLoad, this.currentRounds);
            reloadBar.limit = this.reloadTime;
            reloadBar.hide();
            this.sprite.position.x = 0;
            this.sprite.position.y = 0;
            this.isActive = true;
            this.shotCooldown = this.fireRate;
            this.sprite.visible = true;
        }
        update(deltaTime) {
            this.calcGunPosition();
            if (this.reloading) {
                this.reloadProg += deltaTime;
                if (this.reloadProg >= this.reloadTime) {
                    this.finishReload();
                }
            }
            if (this.shotCooldown > 0) {
                this.shotCooldown -= deltaTime;
            }
            exports.p1.reloadBar.setPointer(this.reloadProg);
            exports.p1.reloadBar.setPosition(exports.p1.sprite.position.x, exports.p1.sprite.position.y - 20);
        }
        reload() {
            if (this.currentRounds >= 0 && this.currentLoad != this.capacity && this.currentRounds > 0) {
                exports.p1.reloadBar.show();
                this.reloading = true;
            }
        }
        finishReload() {
            this.reloading = false;
            this.reloadProg = 0;
            if (this.currentRounds > this.capacity) {
                this.currentRounds -= this.capacity;
                this.currentLoad = this.capacity;
            }
            else {
                this.currentLoad = this.currentRounds;
                this.currentRounds = 0;
            }
            this.currentRounds += this.currentLoad;
            exports.p1.ammoCounter.setValue(this.currentLoad, this.currentRounds);
            exports.p1.reloadBar.hide();
        }
        refill() {
            this.reloading = false;
            this.reloadProg = 0;
            this.currentRounds = this.totalCapacity;
            this.currentLoad = this.capacity;
            exports.p1.ammoCounter.setValue(this.currentLoad, this.currentRounds);
        }
    }
    class floorObject {
        constructor(x, y, type, dx, dy, rotation, spin, owner) {
            this.getTypeProperties(type);
            this.sprite.position.x = x;
            this.sprite.position.y = y;
            this.dy = dy;
            this.dx = dx;
            this.owner = owner;
            this.type = type;
            this.sprite.rotation = rotation;
            this.spin = spin;
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.5;
            exports.midGroundImage.addChild(this.sprite);
            owner.floorObjects.push(this);
        }
        update(deltaTime) {
            if (Math.abs(this.dx) > 0.5 || Math.abs(this.dy) > 0.5 || Math.abs(this.spin) > 0.5) {
                this.spin *= Math.pow(0.9, deltaTime);
                this.dx *= Math.pow(0.9, deltaTime);
                this.dy *= Math.pow(0.9, deltaTime);
                walls.forEach(e => {
                    if (e.intersects(new shapes_1.rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height))) {
                        this.dx *= -1.1;
                        this.dy *= -1.1;
                    }
                });
                this.sprite.rotation += this.spin * deltaTime;
                this.sprite.position.x += this.dx * deltaTime;
                this.sprite.position.y += this.dy * deltaTime;
            }
        }
        getTypeProperties(type) {
            switch (type) {
                case 1:
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletManDead.png"]);
                    break;
                case 2:
                    this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackSidearm.png"]);
                    break;
            }
        }
        compress() {
            exports.midGroundImage.removeChild(this.sprite);
            this.owner.addCompressed(this.sprite.position.x, this.sprite.position.y, this.type, this.sprite.rotation);
            this.owner.floorObjects.splice(this.owner.floorObjects.indexOf(this), 1);
        }
    }
    class room {
        constructor(shape) {
            this.floorObjects = Array();
        }
        update(deltaTime) {
            this.floorObjects.forEach(element => {
                element.update(deltaTime);
            });
        }
        exit() {
        }
        compress() {
            this.floorObjects.forEach(e => {
                e.compress();
            });
        }
        enter() {
        }
        uncompress() {
            this.compressed.forEach(element => {
                new floorObject(element.x, element.y, element.type, 0, 0, element.rotation, 0, this);
            });
        }
        addCompressed(x, y, type, rotation) {
            this.compressed.push({ x, y, type, rotation });
        }
        addFloorObject(x, y, type, dx, dy) {
            new floorObject(x, y, type, dx, dy, 0, 0, this);
        }
        addFloorObjectAdv(x, y, type, dx, dy, rotation, spin) {
            new floorObject(x, y, type, dx, dy, rotation, spin, this);
        }
    }
    class wall {
        constructor(x, y, w, h) {
            for (let n = 0; n < Math.floor(w / 64) + 1; n++) {
                for (let i = 0; i < Math.floor((h - 20) / 64) + 1; i++) {
                    let bufferTexture = wall.getCelingTexture();
                    let bufferSprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x, bufferTexture.frame.y, Math.min(w - n * 64, bufferTexture.width), Math.min(h - i * 64 - 20, bufferTexture.height))));
                    bufferSprite.x = x + n * 64;
                    bufferSprite.y = y + i * 64;
                    exports.backGroundImage.addChild(bufferSprite);
                }
                {
                    let bufferTexture = wall.getWallTexture();
                    let bufferSprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x, bufferTexture.frame.y, Math.min(w - n * 64, bufferTexture.frame.width), 20)));
                    bufferSprite.x = x + n * 64;
                    bufferSprite.y = y + h - 20;
                    exports.backGroundImage.addChild(bufferSprite);
                }
                {
                    let bufferTexture = wall.getWallTexture();
                    let bufferSprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x, bufferTexture.frame.y, Math.min(w - (n * 64 + 32), bufferTexture.frame.width), 20)));
                    bufferSprite.x = x + n * 64 + 32;
                    bufferSprite.y = y + h - 20;
                    exports.backGroundImage.addChild(bufferSprite);
                }
            }
            walls.push(new shapes_1.rectangle(x, y, w, h));
        }
        static getCelingTexture() {
            if (Math.random() < 0.33) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing1.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing2.png"];
            }
            else {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing3.png"];
            }
        }
        static getFloorTexture() {
            if (Math.random() < 0.33) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor1.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor2.png"];
            }
            else {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor3.png"];
            }
        }
        static getWallTexture() {
            if (Math.random() < 0.1) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall6.png"];
            }
            else if (Math.random() < 0.4) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall5.png"];
            }
            else if (Math.random() < 0.4) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall4.png"];
            }
            else if (Math.random() < 0.33) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall3.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall2.png"];
            }
            else {
                return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall1.png"];
            }
        }
    }
    class animationHandeler {
        constructor() {
            this.time = 0;
            this.animations = Array();
            this.removeAnimation = Array();
        }
        makeAnimation(x, y, index, angle) {
            this.animations.push(new animation(x, y, index, this.time, angle));
        }
        animate(timeDelta) {
            this.animations.forEach(anim => {
                if (this.time - anim.startTime > anim.img.length) {
                    this.removeAnimation.push(anim);
                }
            });
            this.removeAnimation.forEach(obj => {
                obj.remove();
                this.animations.splice(this.animations.indexOf(obj), 1);
            });
            this.removeAnimation = Array();
            this.time += timeDelta;
            this.animations.forEach(anim => {
                anim.sprite.texture = anim.img[Math.max(Math.min(Math.floor(this.time - anim.startTime), anim.img.length - 1), 0)];
            });
        }
    }
    class animation {
        constructor(x, y, type, time, angle) {
            this.img = Array();
            this.startTime = time;
            this.getAnimFrames(type);
            this.sprite = new PIXI.Sprite(this.img[0]);
            this.sprite.rotation = angle;
            this.sprite.position.x = x;
            this.sprite.position.y = y;
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.5;
            this.frames -= 0.01;
            this.angle = angle;
            exports.foreGroundImage.addChild(this.sprite);
        }
        getAnimFrames(type) {
            switch (type) {
                case 1:
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp1.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp2.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp3.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp4.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp5.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp6.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallYellowExp7.png"]);
                    break;
                case 2:
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp1.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp2.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp3.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp4.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp5.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp6.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp7.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp8.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp9.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp10.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp11.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["crossBoltExp12.png"]);
                    break;
                case 3:
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallRedExp1.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallRedExp2.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["smallRedExp3.png"]);
                    break;
                case 4:
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp1.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp2.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp3.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp4.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp5.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp6.png"]);
                    this.img.push(PIXI.loader.resources["res/bullets.json"].textures["nailExp7.png"]);
                    break;
            }
            this.frames = this.img.length;
        }
        remove() {
            exports.foreGroundImage.removeChild(this.sprite);
        }
    }
    class UIObject {
        constructor() {
        }
    }
    class numberCounter extends UIObject {
        constructor(x, y, dispNum) {
            super();
            this.sprites = Array();
            this.x = x;
            this.y = y;
            this.dispNum = Math.abs(dispNum);
            this.generateSprites(dispNum);
            this.visible = true;
        }
        generateSprites(n) {
            this.sprites.forEach(spr => {
                UIImage.removeChild(spr);
            });
            if (this.visible) {
                this.sprites = Array();
                let length = n < 100000 ? n < 100 ? n < 10 ? 1 : 2 : n < 1000 ? 3 : n < 10000 ? 4 : 5 : n < 10000000 ? n < 1000000 ? 6 : 7 : n < 100000000 ? 8 : n < 1000000000 ? 9 : 10;
                for (let i = 0; i < length; i++) {
                    let bufferSprite = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures[Math.floor(n / Math.pow(10, length - i - 1)) % 10 + ".png"]);
                    bufferSprite.position.x = this.x + this.getSpacing();
                    bufferSprite.position.y = this.y;
                    this.sprites.push(bufferSprite);
                }
                this.sprites.forEach(spr => {
                    UIImage.addChild(spr);
                });
            }
        }
        getSpacing() {
            let spacing = 0;
            this.sprites.forEach(spr => {
                spacing += spr.width;
                spacing += 3;
            });
            return spacing;
        }
        getWidth(ignoreOnes) {
            if (ignoreOnes) {
                let width = 0;
                this.sprites.forEach(spr => {
                    width += 18;
                });
                return width - 3;
            }
            else {
                return this.getSpacing() - 3;
            }
        }
        setDisplay(dispNum) {
            this.dispNum = dispNum;
            this.generateSprites(dispNum);
        }
        setPos(x, y) {
            let shiftX = x - this.x;
            let shiftY = y - this.y;
            this.sprites.forEach(spr => {
                spr.position.x += shiftX;
                spr.position.y += shiftY;
            });
        }
        getBounds() {
            return new shapes_1.rectangle(this.x, this.y, this.getWidth(false), 15);
        }
        remove() {
            this.sprites.forEach(spr => {
                UIImage.removeChild(spr);
            });
        }
        hide() {
            this.visible = false;
            this.generateSprites(this.dispNum);
        }
        show() {
            this.visible = true;
            this.generateSprites(this.dispNum);
        }
    }
    class fractionCounter extends UIObject {
        constructor(x, y, numerator, denomenator, justifyCenter) {
            super();
            this.lineTexture = PIXI.loader.resources["res/UIElements.json"].textures["whiteLine.png"];
            this.justifyCenter = justifyCenter;
            this.numerator = new numberCounter(0, 0, numerator);
            this.denomenator = new numberCounter(0, 0, denomenator);
            this.x = x;
            this.y = y;
            this.visible = true;
            this.line = new PIXI.Sprite;
            this.calculatePositions();
            UIImage.addChild(this.line);
        }
        calculatePositions() {
            this.width = Math.max(this.numerator.getWidth(true), this.denomenator.getWidth(true));
            this.line.texture = new PIXI.Texture(this.lineTexture.baseTexture, new PIXI.Rectangle(this.lineTexture.frame.x, this.lineTexture.frame.y, Math.min(this.width, this.lineTexture.width), 3));
            if (this.justifyCenter) {
                this.line.position.x = this.x - this.width / 2;
            }
            else {
                this.line.x = this.x;
            }
            this.line.y = this.y + 18;
            this.numerator.setPos(this.line.x + this.width / 2 - this.numerator.getWidth(false) / 2, this.y);
            this.denomenator.setPos(this.line.x + this.width / 2 - this.denomenator.getWidth(false) / 2, this.y + 24);
        }
        setValue(numerator, denomenator) {
            this.numerator.setDisplay(numerator);
            this.denomenator.setDisplay(denomenator);
            this.calculatePositions();
        }
        getBounds() {
            return new shapes_1.rectangle(this.x, this.y, this.width, 39);
        }
        remove() {
            this.numerator.remove();
            this.denomenator.remove();
            UIImage.removeChild(this.line);
        }
        hide() {
            this.visible = false;
            this.line.visible = false;
            this.numerator.hide();
            this.denomenator.hide();
        }
        show() {
            this.visible = true;
            this.line.visible = true;
            this.numerator.show();
            this.denomenator.show();
        }
    }
    class progressBar extends UIObject {
        constructor(x, y, length, limit) {
            super();
            this.lineTexture = PIXI.loader.resources["res/UIElements.json"].textures["whiteLine.png"];
            this.line = new PIXI.Sprite(new PIXI.Texture(this.lineTexture.baseTexture, new PIXI.Rectangle(this.lineTexture.frame.x, this.lineTexture.frame.y, Math.min(length, this.lineTexture.width), 3)));
            this.pointer = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures["pointer.png"]);
            this.pointer.position.x = x;
            this.pointer.position.y = y;
            this.line.position.x = x;
            this.line.position.y = y + 13;
            this.limit = limit;
            this.pos = 0;
            this.length = length;
            this.x = x;
            this.y = y;
            this.visible = true;
            this.setPointer(0);
            UIImage.addChild(this.line);
            UIImage.addChild(this.pointer);
        }
        setPointer(position) {
            this.pos = position;
            this.pointer.position.x = ((this.length - 3) * this.pos / this.limit) + this.x - 3;
        }
        setPosition(x, y) {
            this.line.position.x += x - this.x;
            this.line.position.y += y - this.y;
            this.pointer.position.x += x - this.x;
            this.pointer.position.y += y - this.y;
            this.x = x;
            this.y = y;
        }
        getBounds() {
            return new shapes_1.rectangle(0, 0, 0, 0);
        }
        remove() {
            UIImage.removeChild(this.line);
            UIImage.removeChild(this.pointer);
        }
        hide() {
            this.line.visible = false;
            this.pointer.visible = false;
            this.visible = false;
        }
        show() {
            this.line.visible = true;
            this.pointer.visible = true;
            this.visible = true;
        }
    }
    let pixiApp;
    exports.gameObjects = new Array();
    exports.bufferGameObjects = new Array();
    exports.removeGameObjects = new Array();
    let timeDilate;
    let bufferBullets = new Array();
    exports.playerBullets = new Array();
    exports.enemyBullets = new Array();
    exports.backGroundImage = new PIXI.particles.ParticleContainer();
    exports.foreGroundImage = new PIXI.Container();
    exports.midGroundImage = new PIXI.Container();
    exports.lighting = new PIXI.particles.ParticleContainer();
    let UIImage = new PIXI.Container();
    let walls = new Array();
    let animator = new animationHandeler();
});
//# sourceMappingURL=gameEngine.js.map