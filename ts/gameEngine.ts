///<reference types="pixi.js"/>
import {rectangle} from "./shapes";
import keyboard from "./keyboard";
import gameObject from "./gameObject";
//import rectangle from "./rectangle";
export class gameEngine{
    mouse: PIXI.Sprite;
    constructor(app: PIXI.Application){
            pixi = app;
            timeDilate = 1;
            this.mouse = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures["cursor1.png"]);
            pixi.stage.addChild(backGroundImage);
            pixi.stage.addChild(foreGroundImage);
            pixi.stage.addChild(UIImage);
            this.generateFloor();           
            pixi.stage.addChild(this.mouse);
            this.makePlayer(100,100);
    }
    makePlayer(x:number, y:number):void{
        p1 = new player(x,y);
    }
    cycle(deltaTime: number, time: number):void{
        this.mouse.position.x = keyboard.mouseX-this.mouse.width/2;
        this.mouse.position.y = keyboard.mouseY-this.mouse.width/2;
        gameObjects.forEach(element => {
            element.update(deltaTime*timeDilate);
        });
        removeGameObjects.forEach(obj=>{
            gameObjects.splice(gameObjects.indexOf(obj),1);
        });
        bufferGameObjects.forEach(obj => {
            gameObjects.push(obj);
        });
        bufferGameObjects = Array<gameObject>();
        removeGameObjects = Array<gameObject>();
        animator.animate(deltaTime*timeDilate);
        if(keyboard.getKey(39)){
            timeDilate+=0.01;
        }
        if(keyboard.getKey(37)){
            if(timeDilate>0){
                timeDilate-=0.01;
            }
        }
        keyboard.resetMouseToggle();
    }
    generateFloor(){
        backGroundImage.removeChildren();
        walls = Array<rectangle>();
        for(let i = 0; i <28; i++){
            let bufferTexture = wall.getFloorTexture();
            let bufferSprite = new PIXI.Sprite(bufferTexture);
            bufferSprite.x=(i%7)*192;
            bufferSprite.y=Math.floor(i/7)*192;
            backGroundImage.addChild(bufferSprite);
        }
        new wall(0,0,1280,50);
        new wall(0,0,50,720);
        new wall(0,670,1280,50);
        new wall(1230,0,50,720);
        new wall(600,0,30,600);
    }
};

class player extends gameObject{
    mov: PIXI.Point = new PIXI.Point(0,0);
    hitbox: rectangle = new rectangle(0,0,40,40);
    movSpeed: number = 0.25;   
    guns: gun[] = Array<gun>(); 
    currentGun: number;
    constructor(x: number, y: number){
        super();
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("images/playerSmile.png"));
        this.sprite.position = new PIXI.Point(x,y);
        this.guns.push(new gun(1));
        this.currentGun = 1;
        bufferGameObjects.push(this);
        foreGroundImage.addChild(this.sprite);
    }
    update(deltaTime: number){
        this.keyboardManage(deltaTime);
        this.sprite.position.x+=this.mov.x*deltaTime;
        this.sprite.position.y+=this.mov.y*deltaTime;
        this.hitbox = this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
        this.collision(deltaTime);
        this.mov.set(0,0);
        if(this.guns[this.currentGun-1].automatic){
            if(keyboard.getMouse(1)){
                this.guns[this.currentGun-1].shoot(deltaTime);
            }
        } else {
            if(keyboard.getMouseToggle(1)){
                this.guns[this.currentGun-1].shoot(deltaTime);
            }
        }
        if(keyboard.getMouseToggle(3)){
            this.guns[this.currentGun-1].reload();
        }
        if(keyboard.getToggle(9)){
            this.guns[this.currentGun-1].switch();
            this.currentGun ++;
            this.currentGun%=this.guns.length;
        }
        this.guns[this.currentGun-1].update(deltaTime);
    }
    keyboardManage(deltaTime: number){
        if(keyboard.getKey(87)){//w
            this.mov.y-=3*deltaTime;
        }
        if(keyboard.getKey(65)){//a
            this.mov.x+=-3*deltaTime;
        }
        if(keyboard.getKey(83)){//s
            this.mov.y+=3*deltaTime;
        }
        if(keyboard.getKey(68)){//d
            this.mov.x+=3*deltaTime;
        }
    }
    collision(deltaTime: number){
        let collisionRects: rectangle[] = new Array<rectangle>();
        walls.forEach(r => {
            if(r.touches(this.hitbox)){
                collisionRects.push(r);
            }
        });
        collisionRects.forEach(r => {
            if(this.mov.x*deltaTime>0) {
                if ((this.sprite.position.x+this.hitbox.width)-r.x < this.mov.x*2*deltaTime&&!(r.y+this.mov.y*deltaTime>=this.sprite.position.y+this.hitbox.height||r.y+r.height-this.mov.y*deltaTime<=this.sprite.position.y)) {//right
                    this.sprite.position.x = -this.hitbox.width + r.x;
                    this.mov.set(0,this.mov.y);
                }
            }
            if(this.mov.x*deltaTime<0) {
                if((r.x + r.width) - this.sprite.position.x < - this.mov.x*2*deltaTime&&!(r.y+this.mov.y*deltaTime>=this.sprite.position.y+this.hitbox.height||r.y+r.height-this.mov.y*deltaTime<=this.sprite.position.y)) {//left
                    this.sprite.position.x = r.x + r.width;
                    this.mov.set(0,this.mov.y);
                }
            }
            if(this.mov.y*deltaTime>0) {
                if ((this.sprite.position.y+this.hitbox.height)-r.y<=this.mov.y*2*deltaTime&&!(r.x>=this.sprite.position.x+this.hitbox.width||r.x+r.width<=this.sprite.position.x)) {//down
                    this.sprite.position.y = -this.hitbox.height + r.y;
                    this.mov.set(this.mov.x, 0);
                }
            }
            if(this.mov.y*deltaTime<0) {
                if((r.y + r.height) - this.sprite.position.y < -this.mov.y*2*deltaTime&&!(r.x>=this.sprite.position.x+this.hitbox.width||r.x+r.width<=this.sprite.position.x)) {//up
                    this.sprite.position.y = r.y + r.height;
                    this.mov.set(this.mov.x,0);
                }
            }
        });
    }
}


class bullet extends gameObject{
    sprite: PIXI.Sprite;
    speed: number;
    dammage: number;
    heading: number;
    hitbox: rectangle;
    isDestroyed: boolean = false;
    constructor(x: number, y: number, heading: number, typeIndex: number, speed: number, dammage: number){
        super();
        this.sprite = new PIXI.Sprite(this.getBulletType(typeIndex));
        this.sprite.x = x;
        this.sprite.y = y;
        this.hitbox = new rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height);
        this.heading = heading;
        this.dammage = dammage;
        this.speed = speed; 
        this.sprite.rotation = heading;
        foreGroundImage.addChild(this.sprite);
        bufferGameObjects.push(this);
    }
    update(deltaTime: number){
        this.sprite.x += this.speed*Math.cos(this.heading)*deltaTime;
        this.sprite.y += this.speed*Math.sin(this.heading)*deltaTime;
        this.hitbox = this.hitbox.translateAbsolute(this.sprite.x,this.sprite.y);
        walls.forEach(r => {
            if(this.hitbox.intersects(r)){
                this.destroy();
            }
        });
    }
    destroy(){
        if(!this.isDestroyed){
            animator.makeAnimation(this.sprite.x+this.sprite.width/2, this.sprite.y+this.sprite.height/2,1);
            this.isDestroyed = true;
            foreGroundImage.removeChild(this.sprite);
            removeGameObjects.push(this);
        }
    }
    getBulletType(index: number):PIXI.Texture{
        switch(index){
            case 1: 
                return PIXI.loader.resources["images/bullets.json"].textures["smallYellow.png"];
            case 2:
                return PIXI.loader.resources["images/bullets.json"].textures["crossBolt.png"];
        }
    }
}


class gun{
    fireRate: number; //period. 60s of a second
    dammage: number; //dammage of bullet
    barrelLength: number; //distance from player the bullet spawns
    bulletType: number; //type of bullet
    sprite: PIXI.Sprite; //sprite
    fireSpeed: number; //bullet speed
    capacity: number; //number of rounds before reload
    totalCapacity: number; //total possible rounds
    reloadTime: number; //reload time im 60s of a second
    reloading: boolean = false; //if the gun is currently reloading
    reloadProg: number = 0; //how long the gun has been reloading 60s of a second
    currentRounds: number; //current number of rounds. Includes those currently loaded
    currentLoad: number; //how many rounds are in the gun
    shotCooldown: number = 0; //time untill can shoot again
    counter: fractionCounter; //numerator is currentLoad, denomenator is current rounds
    automatic: boolean; //if fire can be held down
    reloadProgress: progressBar;
    constructor(type: number){
        this.getTypePropeties(type);
        this.counter = new fractionCounter(1200, 630, this.currentLoad,this.currentRounds, true);
        this.reloadProgress = new progressBar(0,0,40,this.reloadTime);
        this.reloadProgress.hide();
    }
    getTypePropeties(type: number){
        switch(type){
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
    shoot(deltaTime: number){
        if(!this.reloading){
            if(this.currentLoad>0){
                if(this.shotCooldown<=0){
                    let angle = rectangle.getAngle(new PIXI.Point(p1.sprite.position.x+p1.sprite.width/2, p1.sprite.position.y+p1.sprite.height/2), new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
                    new bullet(p1.sprite.x+((p1.sprite.width/2)+this.barrelLength)*Math.cos(angle)+p1.sprite.width/2, p1.sprite.y+((p1.sprite.height/2)+this.barrelLength)*Math.sin(angle)+p1.sprite.height/2, angle, 1,5,1);
                    this.shotCooldown = this.fireRate;
                    this.currentLoad--;
                    this.currentRounds--;
                    this.counter.setValue(this.currentLoad,this.currentRounds);
                }
            } else{
                this.reload();
            }
        }
    }
    switch() {
        this.reloading = false;
        this.reloadProg = 0;
    }
    update(deltaTime: number){
        if(this.reloading){
            this.reloadProg+=deltaTime;
            if(this.reloadProg>=this.reloadTime){
                this.finishReload();
            }
        }
        if(this.shotCooldown>0){
            this.shotCooldown-=deltaTime;
        }
        this.reloadProgress.setPointer(this.reloadProg);
        this.reloadProgress.setPosition(p1.sprite.position.x,p1.sprite.position.y-20);
    }
    reload(){
        if(this.currentRounds>=0&&this.currentLoad!=this.capacity&&this.currentRounds>0){
            this.reloadProgress.show();
            this.reloading = true;
        }
    }
    finishReload(){
        this.reloading = false;
        this.reloadProg = 0;
        if(this.currentRounds>this.capacity){
            this.currentRounds-=this.capacity;
            this.currentLoad = this.capacity;
        } else{
            this.currentLoad = this.currentRounds;
            this.currentRounds = 0;
        }
        this.currentRounds+=this.currentLoad;
        this.counter.setValue(this.currentLoad,this.currentRounds);
        this.reloadProgress.hide();
    }
    refill(){
        this.reloading = false;
        this.reloadProg = 0;
        this.currentRounds = this.totalCapacity;
        this.currentLoad = this.capacity;
        this.counter.setValue(this.currentLoad,this.currentRounds);
    }
}


class wall{
    rect: rectangle;
    constructor(x: number, y:number, w:number, h:number){
        for(let n = 0; n < Math.floor(w/64)+1; n++){
            for(let i = 0; i < Math.floor((h-20)/64)+1; i++){
                let bufferTexture: PIXI.Texture = wall.getCelingTexture();
                let bufferSprite: PIXI.Sprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture,new PIXI.Rectangle(bufferTexture.frame.x,bufferTexture.frame.y,Math.min(w-n*64,bufferTexture.width),Math.min(h-i*64-20,bufferTexture.height))));
                bufferSprite.x=x+n*64;
                bufferSprite.y=y+i*64;
                backGroundImage.addChild(bufferSprite);
            }
            {
            let bufferTexture: PIXI.Texture = wall.getWallTexture();
            let bufferSprite: PIXI.Sprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture,new PIXI.Rectangle(bufferTexture.frame.x,bufferTexture.frame.y,Math.min(w-n*64,bufferTexture.frame.width),20)));
            bufferSprite.x=x+n*64;
            bufferSprite.y=y+h-20;
            backGroundImage.addChild(bufferSprite);
            }
            {
            let bufferTexture: PIXI.Texture = wall.getWallTexture();
            let bufferSprite: PIXI.Sprite = new PIXI.Sprite(new PIXI.Texture(bufferTexture.baseTexture,new PIXI.Rectangle(bufferTexture.frame.x,bufferTexture.frame.y,Math.min(w-(n*64+32),bufferTexture.frame.width),20)));
            bufferSprite.x=x+n*64+32;
            bufferSprite.y=y+h-20;
            backGroundImage.addChild(bufferSprite);
            }
        }
        walls.push(new rectangle(x,y,w,h));
    }
    static getCelingTexture():PIXI.Texture{
        if(Math.random()<0.33){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing1.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing2.png"];
        } else{
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["celing3.png"];
        }
    }
    static getFloorTexture():PIXI.Texture{
        if(Math.random()<0.33){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor1.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor2.png"];
        } else{
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["floor3.png"];
        }
    }
    static getWallTexture():PIXI.Texture{
        if(Math.random()<0.1){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall6.png"];
        } else if(Math.random()<0.4){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall5.png"];
        } else if(Math.random()<0.4){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall4.png"];
        } else if(Math.random()<0.33){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall3.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall2.png"];
        } else{
            return PIXI.loader.resources["images/backGroundTexture.json"].textures["wall1.png"];
        }
    }
}

class animationHandeler{
    time: number = 0;
    animations: animation[] = Array<animation>();
    removeAnimation: animation[] = Array<animation>();
    constructor(){

    }
    makeAnimation(x: number, y: number, index: number){
        this.animations.push(new animation(x,y,index,this.time));
    }
    animate(timeDelta: number){
        this.animations.forEach(anim =>{
            if(this.time-anim.startTime>anim.img.length){
                this.removeAnimation.push(anim);
            }
        });
        this.removeAnimation.forEach(obj=>{
            obj.remove();
            this.animations.splice(this.animations.indexOf(obj),1);
        });
        this.removeAnimation = Array<animation>();
        this.time+= timeDelta;
        this.animations.forEach(anim =>{
            anim.sprite.texture=anim.img[Math.max(Math.min(Math.floor(this.time-anim.startTime),anim.img.length-1),0)];
            anim.sprite.x = anim.x-anim.sprite.width/2;
            anim.sprite.y = anim.y-anim.sprite.height/2;
        });
    }
}


class animation{
    startTime: number;
    frames: number;
    img: PIXI.Texture[] = Array<PIXI.Texture>();
    x: number;
    y: number;
    sprite: PIXI.Sprite;
    constructor(x: number, y: number, type: number, time: number){
        this.startTime = time;
        this.getAnimFrames(type);
        this.sprite = new PIXI.Sprite(this.img[0]);
        this.sprite.position.x = x-this.sprite.width/2;
        this.sprite.position.y = y-this.sprite.width/2;
        this.x = x;
        this.y = y;
        this.frames-=0.01;
        foreGroundImage.addChild(this.sprite);
    }
    getAnimFrames(type: number){
        switch(type){
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
    remove(){
        foreGroundImage.removeChild(this.sprite);
    }
}
abstract class UIObject{
    constructor(){

    }
    abstract getBounds():rectangle;
    abstract remove():void;
}
class numberCounter extends UIObject{
    dispNum: number;
    x: number;
    y: number;
    sprites: PIXI.Sprite[] = Array<PIXI.Sprite>();
    constructor(x: number, y: number, dispNum: number){
        super();
        this.x = x;
        this.y = y;
        this.dispNum = Math.abs(dispNum);
        this.generateSprites(dispNum);
    }
    generateSprites(n: number){
        this.sprites.forEach(spr => {
            UIImage.removeChild(spr);
        });
        this.sprites = Array<PIXI.Sprite>();
        let length = n<100000?n<100?n<10?1:2:n<1000?3:n<10000?4:5:n<10000000?n<1000000?6:7:n<100000000?8:n<1000000000?9:10;
        for(let i = 0; i < length; i ++){
            let bufferSprite = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures[Math.floor(n/Math.pow(10,length-i-1))%10+".png"]);
            bufferSprite.position.x = this.x + this.getSpacing();
            bufferSprite.position.y = this.y;
            this.sprites.push(bufferSprite);
        }
        this.sprites.forEach(spr => {
            UIImage.addChild(spr);
        });
    }
    getSpacing():number{
        let spacing = 0;
        this.sprites.forEach(spr => {
            spacing+=spr.width;
            spacing+=3;
        });
        return spacing;
    }
    getWidth(ignoreOnes: boolean):number{//ignore ones means that ones will be measured as a full size letter
        if(ignoreOnes){
            let width: number = 0;
            this.sprites.forEach(spr=> {
                width+=18;
            });
            return width-3;
        } else{
            return this.getSpacing()-3;
        }
    }
    setDisplay(dispNum: number){
        this.dispNum = dispNum;
        this.generateSprites(dispNum);
    }
    setPos(x: number, y: number){
        let shiftX = x - this.x;
        let shiftY = y- this.y;
        this.sprites.forEach(spr => {
            spr.position.x+=shiftX;
            spr.position.y+=shiftY;
        });
    }
    getBounds(){
        return new rectangle(this.x, this.y, this.getWidth(false),15);
    }
    remove(){
        this.sprites.forEach(spr => {
            UIImage.removeChild(spr);
        });
    }
}


class fractionCounter extends UIObject{
    numerator: numberCounter;
    denomenator: numberCounter;
    x: number;
    y: number;
    width: number;
    line: PIXI.Sprite;
    justifyCenter: boolean;
    lineTexture: PIXI.Texture = PIXI.loader.resources["images/UIElements.json"].textures["whiteLine.png"];
    constructor(x: number, y: number, numerator: number, denomenator: number, justifyCenter: boolean){
        super();
        this.justifyCenter = justifyCenter;
        this.numerator = new numberCounter(0,0, numerator);
        this.denomenator = new numberCounter(0,0, denomenator);
        this.x = x;
        this.y = y;
        this.line = new PIXI.Sprite;
        this.calculatePositions();
        UIImage.addChild(this.line);
    }
    calculatePositions(){
        this.width = Math.max(this.numerator.getWidth(true),this.denomenator.getWidth(true));
        this.line.texture= new PIXI.Texture(this.lineTexture.baseTexture,new PIXI.Rectangle(this.lineTexture.frame.x,this.lineTexture.frame.y,Math.min(this.width,this.lineTexture.width),3));
        if(this.justifyCenter){
            this.line.position.x = this.x-this.width/2;
        } else{
            this.line.x = this.x;
        }
        this.line.y = this.y + 18;
        this.numerator.setPos(this.line.x+this.width/2-this.numerator.getWidth(false)/2, this.y);
        this.denomenator.setPos(this.line.x+this.width/2-this.denomenator.getWidth(false)/2, this.y+24);
    }
    setValue(numerator: number, denomenator: number){
        this.numerator.setDisplay(numerator);
        this.denomenator.setDisplay(denomenator);
        this.calculatePositions();
    }
    getBounds(){
        return new rectangle(this.x,this.y,this.width,39);
    }
    remove(){
        this.numerator.remove();
        this.denomenator.remove();
        UIImage.removeChild(this.line);
    }
}


class progressBar extends UIObject{
    x: number;
    y: number;
    line: PIXI.Sprite;
    lineTexture: PIXI.Texture = PIXI.loader.resources["images/UIElements.json"].textures["whiteLine.png"];
    pointer: PIXI.Sprite;
    limit: number;
    length: number;
    pos: number; //between 0 and limit
    constructor(x: number, y: number, length: number, limit: number){
        super();
        this.line = new PIXI.Sprite(new PIXI.Texture(this.lineTexture.baseTexture,new PIXI.Rectangle(this.lineTexture.frame.x,this.lineTexture.frame.y,Math.min(length,this.lineTexture.width),3)));
        this.pointer = new PIXI.Sprite(PIXI.loader.resources["images/UIElements.json"].textures["pointer.png"]);
        this.pointer.position.x = x;
        this.pointer.position.y = y;
        this.line.position.x=x;
        this.line.position.y=y+13;
        this.limit = limit;
        this.pos = 0;
        this.length = length;
        this.x =x;
        this.y =y;
        this.setPointer(0);
        UIImage.addChild(this.line);
        UIImage.addChild(this.pointer);
    }
    setPointer(position: number){
        this.pos = position;
        this.pointer.position.x = ((this.length-3)*this.pos/this.limit)+this.x-3;
    }
    setPosition(x: number, y: number){
        this.line.position.x+= x-this.x;
        this.line.position.y+= y-this.y;
        this.pointer.position.x+= x-this.x;
        this.pointer.position.y+= y-this.y;
        this.x = x;
        this.y = y;
    }
    getBounds(){
        return new rectangle(0,0,0,0);
    }
    remove(){
        UIImage.removeChild(this.line);
        UIImage.removeChild(this.pointer);
    }
    hide(){
        this.line.visible = false;
        this.pointer.visible = false;
    }
    show(){
        this.line.visible = true;
        this.pointer.visible = true;
    }
}

let pixi: PIXI.Application;
let gameObjects: Array<gameObject> = new Array<gameObject>();
let bufferGameObjects: Array<gameObject> = new Array<gameObject>();
let removeGameObjects: Array<gameObject> = new Array<gameObject>();
let timeDilate: number;
let backGroundImage: PIXI.particles.ParticleContainer = new PIXI.particles.ParticleContainer();
let foreGroundImage: PIXI.Container = new PIXI.Container();
let UIImage: PIXI.Container = new PIXI.Container();
let walls: rectangle[] = new Array<rectangle>();
let animator: animationHandeler = new animationHandeler();
let p1: player;