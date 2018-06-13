///<reference types="pixi.js"/>
import {rectangle,shape} from "./shapes";
import keyboard from "./keyboard";
import gameObject from "./gameObject";
import {bulletMan} from "./enemys";
//import rectangle from "./rectangle";
export class gameEngine{
    mouse: PIXI.Sprite;
    constructor(app: PIXI.Application){
            pixiApp = app;
            timeDilate = 1;
            this.mouse = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures["cursor1.png"]);
            pixiApp.stage.addChild(backGroundImage);
            pixiApp.stage.addChild(midGroundImage);
            pixiApp.stage.addChild(foreGroundImage);
            pixiApp.stage.addChild(lighting);
            pixiApp.stage.addChild(UIImage);
            UIImage.addChild(this.mouse);
            this.generateFloor();           
            currentRoom = new room(new rectangle(0,0,0,0));
            this.makePlayer(100,100);
            new bulletMan(200,200,1);
            new bulletMan(300,200,1);
            new bulletMan(400,200,1);
            new bulletMan(500,200,1);
            new bulletMan(600,200,1);
            new bulletMan(700,200,1);
            new bulletMan(800,200,1);
            new bulletMan(900,200,1);
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
        currentRoom.update(deltaTime*timeDilate);
        removeGameObjects.forEach(obj=>{
            gameObjects.splice(gameObjects.indexOf(obj),1);
        });
        bufferBullets.forEach(obj => {
            if(obj.enemy){
                enemyBullets.push(obj);
            } else {
                playerBullets.push(obj);
            }
        });
        bufferBullets = new Array<bullet>();
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
        keyboard.resetToggle();
    }
    generateFloor(){
        backGroundImage.removeChildren();
        walls = Array<rectangle>();
        for(let i = 0; i <60; i++){
            let bufferTexture = wall.getFloorTexture();
            let bufferSprite = new PIXI.Sprite(bufferTexture);
            bufferSprite.x=(i%10)*192;
            bufferSprite.y=Math.floor(i/10)*192;
            backGroundImage.addChild(bufferSprite);
        }
        new wall(0,0,1920,50);
        new wall(0,0,50,1080);
        new wall(0,1030,1920,50);
        new wall(1870,0,50,1080);
    }
    static makeBullet(x: number, y: number, heading: number, typeIndex: number, speed: number, dammage: number, enemy: boolean){
        new bullet(x, y, heading, typeIndex, speed, dammage, enemy);
    }
};

class player extends gameObject{
    mov: PIXI.Point = new PIXI.Point(0,0);
    hitbox: rectangle;
    movSpeed: number = 0.25;   
    guns: gun[] = Array<gun>(); 
    currentGun: number;
    reloadBar: progressBar;
    ammoCounter: fractionCounter;
    mask: PIXI.Sprite;
    constructor(x: number, y: number){
        super();
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("res/playerSmile.png"));
        this.sprite.position = new PIXI.Point(x,y);
        this.reloadBar = new progressBar(x,y-50,40,1);
        this.ammoCounter = new fractionCounter(screen.width-50,screen.height-50, 0,0,true);
        this.guns.push(new gun(1));
        this.guns.push(new gun(11));
        this.guns[0].switchGunIn(this.ammoCounter,this.reloadBar);
        this.currentGun = 0;
        this.hitbox = new rectangle(x,y,this.sprite.width,this.sprite.height);
        foreGroundImage.addChild(this.sprite);
    }
    update(deltaTime: number){
        this.calcMov();
        this.sprite.position.x+=this.mov.x*deltaTime;
        this.sprite.position.y+=this.mov.y*deltaTime;
        this.hitbox = this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
        this.collision(deltaTime);
        this.mov.set(0,0);
        if(this.guns[this.currentGun].automatic){
            if(keyboard.getMouse(1)){
                this.guns[this.currentGun].shoot();
            }
        } else {
            if(keyboard.getMouseToggle(1)){
                this.guns[this.currentGun].shoot();
            }
        }
        if(keyboard.getMouseToggle(3)){
            this.guns[this.currentGun].reload();
        }
        if(keyboard.getToggle(9)){
            this.guns[this.currentGun].switchGunOut();
            this.currentGun ++;
            this.currentGun%=this.guns.length;
            this.guns[this.currentGun].switchGunIn(this.ammoCounter,this.reloadBar);
        }
        for(let i = 49; i <58; i++){
            if(keyboard.getToggle(i)){
                this.guns[this.currentGun].switchGunOut();
                this.currentGun = Math.max(0,Math.min(this.guns.length-1,i-49));
                this.guns[this.currentGun].switchGunIn(this.ammoCounter,this.reloadBar);
            }
        }
        if(keyboard.getToggle(48)){
            this.guns[this.currentGun].switchGunOut();
            this.currentGun = this.guns.length-1;
            this.guns[this.currentGun].switchGunIn(this.ammoCounter,this.reloadBar);
        }
        this.guns[this.currentGun].update(deltaTime);
    }
    calcMov(){
        if(keyboard.getKey(87)){//w
            this.mov.y-=2;
        }
        if(keyboard.getKey(65)){//a
            this.mov.x+=-2;
        }
        if(keyboard.getKey(83)){//s
            this.mov.y+=2;
        }
        if(keyboard.getKey(68)){//d
            this.mov.x+=2;
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
    destroy(){
        super.destroy();
        foreGroundImage.removeChild(this.sprite);
    }
}


class bullet extends gameObject{
    sprite: PIXI.Sprite;
    speed: number;
    dammage: number;
    heading: number;
    hitbox: shape;
    isDestroyed: boolean = false;
    type: number;
    enemy: boolean; 
    x: number;
    y: number;
    constructor(x: number, y: number, heading: number, typeIndex: number, speed: number, dammage: number, enemy: boolean){
        super();
        this.sprite = new PIXI.Sprite(this.getBulletType(typeIndex));
        this.sprite.x = x-this.sprite.width/2;
        this.sprite.y = y-this.sprite.height/2;
        this.x = x;
        this.y = y;
        this.hitbox = new rectangle(this.sprite.x, this.sprite.y, this.sprite.width, this.sprite.height);
        this.heading = heading;
        this.dammage = dammage;
        this.speed = speed; 
        this.sprite.rotation = heading;
        this.type = typeIndex;
        this.enemy = enemy;
        this.sprite.anchor.x=0.5;
        this.sprite.anchor.y=0.5;
        bufferBullets.push(this);
        foreGroundImage.addChild(this.sprite);
    }
    update(deltaTime: number){
        this.x += this.speed*Math.cos(this.heading)*deltaTime;
        this.y += this.speed*Math.sin(this.heading)*deltaTime;
        this.sprite.x = this.x+this.sprite.width/2;
        this.sprite.y = this.y+this.sprite.height/2;
        this.hitbox = this.hitbox.translateAbsolute(this.x,this.y);
        walls.forEach(r => {
            if(this.hitbox.intersects(r)){
                this.sprite.texture=PIXI.Texture.WHITE;
                this.destroy();
            }
        });
    }
    destroy(){
        if(!this.isDestroyed){
            try{
            super.destroy();
            animator.makeAnimation(this.hitbox.getCenter().x, this.hitbox.getCenter().y,this.type, this.heading);
            this.isDestroyed = true;
            foreGroundImage.removeChild(this.sprite);
            if(this.enemy){
                enemyBullets.splice(enemyBullets.indexOf(this),1);
            } else {
                playerBullets.splice(playerBullets.indexOf(this),1);;
            }
        } catch(e){
            console.log(e);
        }
        }
    }
    getBulletType(index: number):PIXI.Texture{
        switch(index){
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


class explosion extends bullet{
    framePassed: boolean = false;
    constructor(x: number, y: number,radius: number,type: number, dammage: number){
        super(x,y,0,type,0,dammage, true);
        playerBullets.push(this);
    }    
    update(){
        if(this.framePassed){
            
        } else {
            this.framePassed = true;
        }
    }
    destroy(){

    }
    expire(){
        enemyBullets.splice(enemyBullets.indexOf(this),1);
        playerBullets.splice(playerBullets.indexOf(this),1);
    }
}


class gun{
    fireRate: number; //period. 60s of a second
    dammage: number; //dammage of bullet
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
    automatic: boolean; //if fire can be held down
    isActive: boolean; //if the gun is the current gun of player
    barrelDist: number; //the distance from the pivot to the barrel
    barrelAngle: number; //the angle from the pivot to the barrel 
    bulletSpread: number;  //the angle that bullets are spread 1 degree means max 0.5 deg left and right
    barrel: PIXI.Point; // the barrel position
    bulletNum: number; //the number of bullets shot in one round more than one means some bullets will be backdated
    constructor(type: number,){
        if(type!=0){
            this.getTypePropeties(type);
            foreGroundImage.addChild(this.sprite);
        }
    }
    getTypePropeties(type: number){
        let gun;
        switch(type){
            case 1: //blackPistol
                gun = PIXI.loader.resources["res/gunData.json"].data.guns.blackPistol;
                this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackPistol.png"]);
                break;
            case 2: //wood AK
                gun = PIXI.loader.resources["res/gunData.json"].data.guns.woodAK;
                this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["woodAK.png"]);
                break;
            case 3: //metalSidearm
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
        this.sprite.pivot = new PIXI.Point(gun.handle.x,gun.handle.y);
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
        this.bulletNum= gun.bulletNum;
        this.barrelAngle = Math.atan2(gun.barrel.y-gun.handle.y,gun.barrel.x-gun.handle.x);
        this.barrelDist = rectangle.getDistance(new PIXI.Point(gun.handle.x,gun.handle.y),new PIXI.Point(gun.barrel.x,gun.barrel.y));
        this.barrel = new PIXI.Point(gun.barrel.x,gun.barrel.y);
    }
    calcGunPosition(){
        if(p1.hitbox.getCenter().x<keyboard.mouseX){//right
            if(p1.hitbox.getCenter().y<keyboard.mouseY){//bottom
                this.sprite.scale.x=1;
                this.sprite.x = p1.hitbox.x+p1.hitbox.width;
                this.sprite.y = p1.hitbox.getCenter().y;
                this.sprite.rotation = rectangle.getAngle(this.sprite.getGlobalPosition(),new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
            } else {
                this.sprite.scale.x=-1;
                this.sprite.x = p1.hitbox.x+p1.hitbox.width;
                this.sprite.y = p1.hitbox.getCenter().y;
                this.sprite.rotation = Math.PI+rectangle.getAngle(this.sprite.getGlobalPosition(),new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
            }
        } else{//left
            if(p1.hitbox.getCenter().y<keyboard.mouseY){
                this.sprite.scale.x = -1;
                this.sprite.x = p1.hitbox.x;
                this.sprite.y = p1.hitbox.getCenter().y;
                this.sprite.rotation = Math.PI+rectangle.getAngle(this.sprite.getGlobalPosition(),new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
            } else {
                this.sprite.scale.x=1;
                this.sprite.x = p1.hitbox.x;
                this.sprite.y = p1.hitbox.getCenter().y;
                this.sprite.rotation = rectangle.getAngle(this.sprite.getGlobalPosition(),new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
            }
        }
    }
    getBarrelPoistion():PIXI.Point{
        if(this.sprite.scale.x==1){
            return new PIXI.Point(this.sprite.x+Math.cos(this.barrelAngle+this.sprite.rotation)*this.barrelDist,this.sprite.y+Math.sin(this.barrelAngle+this.sprite.rotation)*this.barrelDist);
        } else {
            return new PIXI.Point(2*(this.sprite.x+Math.cos(this.sprite.rotation-Math.PI/2)*(this.sprite.pivot.y-this.barrel.y))-(this.sprite.x+Math.cos(this.barrelAngle+this.sprite.rotation)*this.barrelDist),2*(this.sprite.y+Math.sin(this.sprite.rotation-Math.PI/2)*(this.sprite.pivot.y-this.barrel.y))-(this.sprite.y+Math.sin(this.barrelAngle+this.sprite.rotation)*this.barrelDist));
        }
    }
    shoot(){
        if(!this.reloading){
            if(this.currentLoad>0){
                if(this.shotCooldown<=0){
                    let angle = rectangle.getAngle(this.getBarrelPoistion(), new PIXI.Point(keyboard.mouseX,keyboard.mouseY));
                    for(let i = 0; i < this.bulletNum; i ++){
                        new bullet(this.getBarrelPoistion().x,this.getBarrelPoistion().y, angle+(Math.random()-0.5)*this.bulletSpread, this.bulletType,this.fireSpeed,this.dammage, false);
                    }
                    this.shotCooldown = this.fireRate;
                    this.currentLoad--;
                    this.currentRounds--;
                    p1.ammoCounter.setValue(this.currentLoad,this.currentRounds);
                    if(this.capacity==1){
                        this.reload();
                    }
                }
            } else{
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
    switchGunIn(ammoCounter: fractionCounter, reloadBar: progressBar){
        ammoCounter.setValue(this.currentLoad,this.currentRounds);
        reloadBar.limit = this.reloadTime;
        reloadBar.hide();
        this.sprite.position.x = 0;
        this.sprite.position.y = 0;
        this.isActive = true;
        this.shotCooldown=this.fireRate;
        this.sprite.visible = true;
    }
    update(deltaTime: number){
        this.calcGunPosition();
        if(this.reloading){
            this.reloadProg+=deltaTime;
            if(this.reloadProg>=this.reloadTime){
                this.finishReload();
            }
        }
        if(this.shotCooldown>0){
            this.shotCooldown-=deltaTime;
        }
        p1.reloadBar.setPointer(this.reloadProg);
        p1.reloadBar.setPosition(p1.sprite.position.x,p1.sprite.position.y-20);
    }
    reload(){
        if(this.currentRounds>=0&&this.currentLoad!=this.capacity&&this.currentRounds>0){
            p1.reloadBar.show();
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
        p1.ammoCounter.setValue(this.currentLoad,this.currentRounds);
        p1.reloadBar.hide();
    }
    refill(){
        this.reloading = false;
        this.reloadProg = 0;
        this.currentRounds = this.totalCapacity;
        this.currentLoad = this.capacity;
        p1.ammoCounter.setValue(this.currentLoad,this.currentRounds);
    }
}


class floorObject{
    sprite: PIXI.Sprite;
    dx: number;
    dy: number;
    owner: room;
    type: number;
    spin: number;
    constructor(x: number, y: number, type: number, dx: number, dy: number, rotation: number, spin: number, owner: room){
        this.getTypeProperties(type);
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.dy = dy;
        this.dx = dx;
        this.owner = owner;
        this.type = type;
        this.sprite.rotation = rotation;
        this.spin = spin;
        this.sprite.anchor.x=0.5;
        this.sprite.anchor.y=0.5;
        midGroundImage.addChild(this.sprite);
        owner.floorObjects.push(this);
    }
    update(deltaTime: number){
        if(Math.abs(this.dx)>0.5||Math.abs(this.dy)>0.5||Math.abs(this.spin)>0.5){
            this.spin*=Math.pow(0.9,deltaTime);
            this.dx*=Math.pow(0.9,deltaTime);
            this.dy*=Math.pow(0.9,deltaTime);
            walls.forEach(e=>{
                if(e.intersects(new rectangle(this.sprite.x,this.sprite.y,this.sprite.width,this.sprite.height))){
                    this.dx*=-1.1;
                    this.dy*=-1.1;
                }
            });
            this.sprite.rotation +=this.spin*deltaTime;
            this.sprite.position.x += this.dx*deltaTime;
            this.sprite.position.y += this.dy*deltaTime;
        }
    }
    getTypeProperties(type: number){
        switch(type){
            case 1: //bulletMan Dead
                this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletManDead.png"]);
                break;
            case 2:
                this.sprite = new PIXI.Sprite(PIXI.loader.resources["res/guns.json"].textures["blackSidearm.png"]);
                break;
        }
    }
    compress(){
        midGroundImage.removeChild(this.sprite);
        this.owner.addCompressed(this.sprite.position.x,this.sprite.position.y,this.type, this.sprite.rotation);
        this.owner.floorObjects.splice(this.owner.floorObjects.indexOf(this),1);
    }
}


class room{
    floorObjects: floorObject[] = Array<floorObject>(); 
    compressed: {x: number,y: number, type: number, rotation: number}[];
    constructor(shape: rectangle){

    }
    update(deltaTime: number){
        this.floorObjects.forEach(element => {
            element.update(deltaTime);
        });
    }
    exit(){

    }
    compress(){
        this.floorObjects.forEach(e => {
            e.compress();
        })
    }
    enter(){

    }
    uncompress(){
        this.compressed.forEach(element => {
            new floorObject(element.x,element.y,element.type,0,0,element.rotation,0,this);
        });
    }
    addCompressed(x: number, y: number, type: number, rotation: number){
        this.compressed.push({x,y,type, rotation});
    }
    addFloorObject(x: number, y: number, type: number, dx: number, dy: number){
        new floorObject(x,y,type,dx,dy,0,0,this);
    }
    addFloorObjectAdv(x: number, y: number, type: number, dx: number, dy: number, rotation: number, spin: number){
        new floorObject(x,y,type,dx,dy,rotation,spin,this);
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
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing1.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing2.png"];
        } else{
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["celing3.png"];
        }
    }
    static getFloorTexture():PIXI.Texture{
        if(Math.random()<0.33){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor1.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor2.png"];
        } else{
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["floor3.png"];
        }
    }
    static getWallTexture():PIXI.Texture{
        if(Math.random()<0.1){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall6.png"];
        } else if(Math.random()<0.4){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall5.png"];
        } else if(Math.random()<0.4){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall4.png"];
        } else if(Math.random()<0.33){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall3.png"];
        } else if(Math.random()<0.5){
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall2.png"];
        } else{
            return PIXI.loader.resources["res/backGroundTexture.json"].textures["wall1.png"];
        }
    }
}


class animationHandeler{
    time: number = 0;
    animations: animation[] = Array<animation>();
    removeAnimation: animation[] = Array<animation>();
    constructor(){

    }
    makeAnimation(x: number, y: number, index: number, angle: number){
        this.animations.push(new animation(x,y,index,this.time,angle));
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
        });
    }
}


class animation{
    startTime: number;
    frames: number;
    img: PIXI.Texture[] = Array<PIXI.Texture>();
    angle: number;
    sprite: PIXI.Sprite;
    constructor(x: number, y: number, type: number, time: number, angle: number){
        this.startTime = time;
        this.getAnimFrames(type);
        this.sprite = new PIXI.Sprite(this.img[0]);
        this.sprite.rotation = angle;
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        this.sprite.anchor.x=0.5;
        this.sprite.anchor.y=0.5;
        this.frames-=0.01;
        this.angle = angle;
        foreGroundImage.addChild(this.sprite);
    }
    getAnimFrames(type: number){
        switch(type){
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
    remove(){
        foreGroundImage.removeChild(this.sprite);
    }
}


abstract class UIObject{
    constructor(){

    }
    abstract getBounds():rectangle;
    abstract remove():void;
    abstract show():void;
    abstract hide():void;
    visible: boolean;
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
        this.visible = true;
    }
    generateSprites(n: number){
        this.sprites.forEach(spr => {
            UIImage.removeChild(spr);
        });
        if(this.visible){
            this.sprites = Array<PIXI.Sprite>();
            let length = n<100000?n<100?n<10?1:2:n<1000?3:n<10000?4:5:n<10000000?n<1000000?6:7:n<100000000?8:n<1000000000?9:10;
            for(let i = 0; i < length; i ++){
                let bufferSprite = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures[Math.floor(n/Math.pow(10,length-i-1))%10+".png"]);
                bufferSprite.position.x = this.x + this.getSpacing();
                bufferSprite.position.y = this.y;
                this.sprites.push(bufferSprite);
            }
            this.sprites.forEach(spr => {
                UIImage.addChild(spr);
            });
        }
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
    hide(){
        this.visible = false;
        this.generateSprites(this.dispNum);
    }
    show(){
        this.visible = true;
        this.generateSprites(this.dispNum);
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
    lineTexture: PIXI.Texture = PIXI.loader.resources["res/UIElements.json"].textures["whiteLine.png"];
    constructor(x: number, y: number, numerator: number, denomenator: number, justifyCenter: boolean){
        super();
        this.justifyCenter = justifyCenter;
        this.numerator = new numberCounter(0,0, numerator);
        this.denomenator = new numberCounter(0,0, denomenator);
        this.x = x;
        this.y = y;
        this.visible = true;
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
    hide(){
        this.visible = false;
        this.line.visible = false;
        this.numerator.hide();
        this.denomenator.hide();
    }
    show(){
        this.visible = true;
        this.line.visible = true;
        this.numerator.show();
        this.denomenator.show();
    }
}


class progressBar extends UIObject{
    x: number;
    y: number;
    line: PIXI.Sprite;
    lineTexture: PIXI.Texture = PIXI.loader.resources["res/UIElements.json"].textures["whiteLine.png"];
    pointer: PIXI.Sprite;
    limit: number;
    length: number;
    pos: number; //between 0 and limit
    constructor(x: number, y: number, length: number, limit: number){
        super();
        this.line = new PIXI.Sprite(new PIXI.Texture(this.lineTexture.baseTexture,new PIXI.Rectangle(this.lineTexture.frame.x,this.lineTexture.frame.y,Math.min(length,this.lineTexture.width),3)));
        this.pointer = new PIXI.Sprite(PIXI.loader.resources["res/UIElements.json"].textures["pointer.png"]);
        this.pointer.position.x = x;
        this.pointer.position.y = y;
        this.line.position.x=x;
        this.line.position.y=y+13;
        this.limit = limit;
        this.pos = 0;
        this.length = length;
        this.x =x;
        this.y =y;
        this.visible = true;
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
        this.visible = false;
    }
    show(){
        this.line.visible = true;
        this.pointer.visible = true;
        this.visible = true;
    }
}

let pixiApp: PIXI.Application;
export let gameObjects: Array<gameObject> = new Array<gameObject>();
export let bufferGameObjects: Array<gameObject> = new Array<gameObject>();
export let removeGameObjects: Array<gameObject> = new Array<gameObject>();
let timeDilate: number;
let bufferBullets: bullet[] = new Array<bullet>();
export let playerBullets: bullet[] = new Array<bullet>();
export let enemyBullets: bullet[] = new Array<bullet>();
export let backGroundImage: PIXI.particles.ParticleContainer = new PIXI.particles.ParticleContainer();
export let foreGroundImage: PIXI.Container = new PIXI.Container();
export let midGroundImage: PIXI.Container = new PIXI.Container();
export let lighting: PIXI.particles.ParticleContainer = new PIXI.particles.ParticleContainer();
export let currentRoom: room;
let UIImage: PIXI.Container = new PIXI.Container();
let walls: rectangle[] = new Array<rectangle>();
let animator: animationHandeler = new animationHandeler();
export let p1: player;