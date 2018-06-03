define(["require", "exports", "./shapes", "./keyboard", "./gameObject"], function (require, exports, shapes_1, keyboard_1, gameObject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class gameEngine {
        constructor(app) {
            pixi = app;
            timeDilate = 1;
            this.mouse = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures["cursor1.png"]);
            pixi.stage.addChild(backGroundImage);
            pixi.stage.addChild(foreGroundImage);
            pixi.stage.addChild(UIImage);
            this.generateFloor();
            pixi.stage.addChild(this.mouse);
            this.makePlayer(100, 100);
        }
        makePlayer(x, y) {
            p1 = new player(x, y);
        }
        cycle(deltaTime, time) {
            this.mouse.position.x = keyboard_1.default.mouseX - this.mouse.width / 2;
            this.mouse.position.y = keyboard_1.default.mouseY - this.mouse.width / 2;
            gameObjects.forEach(element => {
                element.update(deltaTime * timeDilate);
            });
            removeGameObjects.forEach(obj => {
                gameObjects.splice(gameObjects.indexOf(obj), 1);
            });
            bufferGameObjects.forEach(obj => {
                gameObjects.push(obj);
            });
            bufferGameObjects = Array();
            removeGameObjects = Array();
            animator.animate(deltaTime * timeDilate);
            if (keyboard_1.default.getKey(39)) {
                timeDilate += 0.01;
            }
            if (keyboard_1.default.getKey(37)) {
                if (timeDilate > 0) {
                    timeDilate -= 0.01;
                }
            }
            keyboard_1.default.resetMouseToggle();
            backGroundImage.position.x += 1;
        }
        generateFloor() {
            backGroundImage.removeChildren();
            walls = Array();
            for (let i = 0; i < 28; i++) {
                let bufferTexture = wall.getFloorTexture();
                let bufferSprite = new PIXI.Sprite(bufferTexture);
                bufferSprite.x = (i % 7) * 192;
                bufferSprite.y = Math.floor(i / 7) * 192;
                backGroundImage.addChild(bufferSprite);
            }
            new wall(0, 0, 1280, 50);
            new wall(0, 0, 50, 720);
            new wall(0, 670, 1280, 50);
            new wall(1230, 0, 50, 720);
            new wall(600, 0, 30, 600);
        }
    }
    exports.gameEngine = gameEngine;
    ;
    class player extends gameObject_1.default {
        constructor(x, y) {
            super();
            this.mov = new PIXI.Point(0, 0);
            this.hitbox = new shapes_1.rectangle(0, 0, 40, 40);
            this.movSpeed = 0.25;
            this.guns = Array();
            this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("images/playerSmile.png"));
            this.sprite.position = new PIXI.Point(x, y);
            this.guns.push(new gun(1));
            this.currentGun = 1;
            bufferGameObjects.push(this);
            foreGroundImage.addChild(this.sprite);
        }
        update(deltaTime) {
            this.keyboardManage(deltaTime);
            this.sprite.position.x += this.mov.x * deltaTime;
            this.sprite.position.y += this.mov.y * deltaTime;
            this.hitbox = this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
            this.collision(deltaTime);
            this.mov.set(0, 0);
            if (this.guns[this.currentGun - 1].automatic) {
                if (keyboard_1.default.getMouse(1)) {
                    this.guns[this.currentGun - 1].shoot(deltaTime);
                }
            }
            else {
                if (keyboard_1.default.getMouseToggle(1)) {
                    this.guns[this.currentGun - 1].shoot(deltaTime);
                }
            }
            if (keyboard_1.default.getMouseToggle(3)) {
                this.guns[this.currentGun - 1].reload();
            }
            if (keyboard_1.default.getToggle(9)) {
                this.guns[this.currentGun - 1].switch();
                this.currentGun++;
                this.currentGun %= this.guns.length;
            }
            this.guns[this.currentGun - 1].update(deltaTime);
        }
        keyboardManage(deltaTime) {
            if (keyboard_1.default.getKey(87)) {
                this.mov.y -= 3 * deltaTime;
            }
            if (keyboard_1.default.getKey(65)) {
                this.mov.x += -3 * deltaTime;
            }
            if (keyboard_1.default.getKey(83)) {
                this.mov.y += 3 * deltaTime;
            }
            if (keyboard_1.default.getKey(68)) {
                this.mov.x += 3 * deltaTime;
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
    }
    class bullet extends gameObject_1.default {
        constructor(x, y, heading, typeIndex, speed, dammage) {
            super();
            this.isDestroyed = false;
            this.sprite = new PIXI.Sprite(this.getBulletType(typeIndex));
            this.sprite.x = x;
            this.sprite.y = y;
            this.hitbox = new shapes_1.rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height);
            this.heading = heading;
            this.dammage = dammage;
            this.speed = speed;
            this.sprite.rotation = heading;
            foreGroundImage.addChild(this.sprite);
            bufferGameObjects.push(this);
        }
        update(deltaTime) {
            this.sprite.x += this.speed * Math.cos(this.heading) * deltaTime;
            this.sprite.y += this.speed * Math.sin(this.heading) * deltaTime;
            this.hitbox = this.hitbox.translateAbsolute(this.sprite.x, this.sprite.y);
            walls.forEach(r => {
                if (this.hitbox.intersects(r)) {
                    this.destroy();
                }
            });
        }
        destroy() {
            if (!this.isDestroyed) {
                animator.makeAnimation(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2, 1);
                this.isDestroyed = true;
                foreGroundImage.removeChild(this.sprite);
                removeGameObjects.push(this);
            }
        }
        getBulletType(index) {
            switch (index) {
                case 1:
                    return PIXI.loader.resources["images/bullets.json"].textures["smallYellow.png"];
                case 2:
                    return PIXI.loader.resources["images/bullets.json"].textures["crossBolt.png"];
            }
        }
    }
    class gun {
        constructor(type) {
            this.reloading = false;
            this.reloadProg = 0;
            this.shotCooldown = 0;
            this.getTypePropeties(type);
            this.counter = new fractionCounter(1200, 630, this.currentLoad, this.currentRounds, true);
            this.reloadProgress = new progressBar(0, 0, 40, this.reloadTime);
            this.reloadProgress.hide();
        }
        getTypePropeties(type) {
            switch (type) {
                case 1:
                    this.fireRate = 5;
                    this.fireSpeed = 10;
                    this.dammage = 5;
                    this.barrelLength = 0;
                    this.bulletType = 1;
                    this.capacity = 6;
                    this.reloadTime = 60;
                    this.totalCapacity = 200;
                    this.currentRounds = 200;
                    this.currentLoad = this.capacity;
                    this.automatic = true;
            }
        }
        shoot(deltaTime) {
            if (!this.reloading) {
                if (this.currentLoad > 0) {
                    if (this.shotCooldown <= 0) {
                        let angle = shapes_1.rectangle.getAngle(new PIXI.Point(p1.sprite.position.x + p1.sprite.width / 2, p1.sprite.position.y + p1.sprite.height / 2), new PIXI.Point(keyboard_1.default.mouseX, keyboard_1.default.mouseY));
                        new bullet(p1.sprite.x + ((p1.sprite.width / 2) + this.barrelLength) * Math.cos(angle) + p1.sprite.width / 2, p1.sprite.y + ((p1.sprite.height / 2) + this.barrelLength) * Math.sin(angle) + p1.sprite.height / 2, angle, 1, 5, 1);
                        this.shotCooldown = this.fireRate;
                        this.currentLoad--;
                        this.currentRounds--;
                        this.counter.setValue(this.currentLoad, this.currentRounds);
                    }
                }
                else {
                    this.reload();
                }
            }
        }
        switch() {
            this.reloading = false;
            this.reloadProg = 0;
        }
        update(deltaTime) {
            if (this.reloading) {
                this.reloadProg += deltaTime;
                if (this.reloadProg >= this.reloadTime) {
                    this.finishReload();
                }
            }
            if (this.shotCooldown > 0) {
                this.shotCooldown -= deltaTime;
            }
            this.reloadProgress.setPointer(this.reloadProg);
            this.reloadProgress.setPosition(p1.sprite.position.x, p1.sprite.position.y - 20);
        }
        reload() {
            if (this.currentRounds >= 0 && this.currentLoad != this.capacity && this.currentRounds > 0) {
                this.reloadProgress.show();
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
            this.counter.setValue(this.currentLoad, this.currentRounds);
            this.reloadProgress.hide();
        }
        refill() {
            this.reloading = false;
            this.reloadProg = 0;
            this.currentRounds = this.totalCapacity;
            this.currentLoad = this.capacity;
            this.counter.setValue(this.currentLoad, this.currentRounds);
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
                    backGroundImage.addChild(bufferSprite);
                }
                {
                    let bufferTexture = wall.getWallTexture();
                    let bufferSprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x, bufferTexture.frame.y, Math.min(w - n * 64, bufferTexture.frame.width), 20)));
                    bufferSprite.x = x + n * 64;
                    bufferSprite.y = y + h - 20;
                    backGroundImage.addChild(bufferSprite);
                }
                {
                    let bufferTexture = wall.getWallTexture();
                    let bufferSprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture, new PIXI.Rectangle(bufferTexture.frame.x, bufferTexture.frame.y, Math.min(w - (n * 64 + 32), bufferTexture.frame.width), 20)));
                    bufferSprite.x = x + n * 64 + 32;
                    bufferSprite.y = y + h - 20;
                    backGroundImage.addChild(bufferSprite);
                }
            }
            walls.push(new shapes_1.rectangle(x, y, w, h));
        }
        static getCelingTexture() {
            if (Math.random() < 0.33) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing1.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing2.png"];
            }
            else {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing3.png"];
            }
        }
        static getFloorTexture() {
            if (Math.random() < 0.33) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor1.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor2.png"];
            }
            else {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor3.png"];
            }
        }
        static getWallTexture() {
            if (Math.random() < 0.1) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall6.png"];
            }
            else if (Math.random() < 0.4) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall5.png"];
            }
            else if (Math.random() < 0.4) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall4.png"];
            }
            else if (Math.random() < 0.33) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall3.png"];
            }
            else if (Math.random() < 0.5) {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall2.png"];
            }
            else {
                return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall1.png"];
            }
        }
    }
    class animationHandeler {
        constructor() {
            this.time = 0;
            this.animations = Array();
            this.removeAnimation = Array();
        }
        makeAnimation(x, y, index) {
            this.animations.push(new animation(x, y, index, this.time));
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
                anim.sprite.x = anim.x - anim.sprite.width / 2;
                anim.sprite.y = anim.y - anim.sprite.height / 2;
            });
        }
    }
    class animation {
        constructor(x, y, type, time) {
            this.img = Array();
            this.startTime = time;
            this.getAnimFrames(type);
            this.sprite = new PIXI.Sprite(this.img[0]);
            this.sprite.position.x = x - this.sprite.width / 2;
            this.sprite.position.y = y - this.sprite.width / 2;
            this.x = x;
            this.y = y;
            this.frames -= 0.01;
            foreGroundImage.addChild(this.sprite);
        }
        getAnimFrames(type) {
            switch (type) {
                case 1:
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp1.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp2.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp3.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp4.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp5.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp6.png"]);
                    this.img.push(PIXI.loader.resources["images/bullets.json"].textures["smallYellowExp7.png"]);
                    this.frames = 7;
            }
        }
        remove() {
            foreGroundImage.removeChild(this.sprite);
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
        }
        generateSprites(n) {
            this.sprites.forEach(spr => {
                UIImage.removeChild(spr);
            });
            this.sprites = Array();
            let length = n < 100000 ? n < 100 ? n < 10 ? 1 : 2 : n < 1000 ? 3 : n < 10000 ? 4 : 5 : n < 10000000 ? n < 1000000 ? 6 : 7 : n < 100000000 ? 8 : n < 1000000000 ? 9 : 10;
            for (let i = 0; i < length; i++) {
                let bufferSprite = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures[Math.floor(n / Math.pow(10, length - i - 1)) % 10 + ".png"]);
                bufferSprite.position.x = this.x + this.getSpacing();
                bufferSprite.position.y = this.y;
                this.sprites.push(bufferSprite);
            }
            this.sprites.forEach(spr => {
                UIImage.addChild(spr);
            });
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
    }
    class fractionCounter extends UIObject {
        constructor(x, y, numerator, denomenator, justifyCenter) {
            super();
            this.lineTexture = PIXI.loader.resources["images/UIElements.json"].textures["whiteLine.png"];
            this.justifyCenter = justifyCenter;
            this.numerator = new numberCounter(0, 0, numerator);
            this.denomenator = new numberCounter(0, 0, denomenator);
            this.x = x;
            this.y = y;
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
    }
    class progressBar extends UIObject {
        constructor(x, y, length, limit) {
            super();
            this.lineTexture = PIXI.loader.resources["images/UIElements.json"].textures["whiteLine.png"];
            this.line = new PIXI.Sprite(new PIXI.Texture(this.lineTexture.baseTexture, new PIXI.Rectangle(this.lineTexture.frame.x, this.lineTexture.frame.y, Math.min(length, this.lineTexture.width), 3)));
            this.pointer = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures["pointer.png"]);
            this.pointer.position.x = x;
            this.pointer.position.y = y;
            this.line.position.x = x;
            this.line.position.y = y + 13;
            this.limit = limit;
            this.pos = 0;
            this.length = length;
            this.x = x;
            this.y = y;
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
        }
        show() {
            this.line.visible = true;
            this.pointer.visible = true;
        }
    }
    let pixi;
    let gameObjects = new Array();
    let bufferGameObjects = new Array();
    let removeGameObjects = new Array();
    let timeDilate;
    let backGroundImage = new PIXI.particles.ParticleContainer();
    let foreGroundImage = new PIXI.Container();
    let UIImage = new PIXI.Container();
    let walls = new Array();
    let animator = new animationHandeler();
    let p1;
});
//# sourceMappingURL=gameEngine.js.map