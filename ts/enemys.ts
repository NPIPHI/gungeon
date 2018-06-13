import gameObject from "./gameObject";
import {foreGroundImage, gameEngine, p1, playerBullets, currentRoom} from "./gameEngine";
import {rectangle} from "./shapes";

abstract class enemy extends gameObject{
    hp: number;
    x: number;
    y: number;
    time: number;
    hitbox: rectangle;
}


abstract class walker extends enemy{
    body: PIXI.Sprite;
    legs: PIXI.Sprite;
    gun: PIXI.Sprite;
    speed: number;
    eventTime: number;
    dx: number;
    dy: number;
    state: number = 0; //0 is moving, 1 is shooting, 2 is reloading
    legState: number = 0; //0 and 2 are straight
    friction: number;//what to multiply dx and dy by every frame
    animImgs: PIXI.Texture[] = Array<PIXI.Texture>();
    target: PIXI.Point;
    constructor(){
        super();
        this.target = new PIXI.Point(0,0);
    }
    update(deltaTime: number){
        this.target = p1.hitbox.getCenter();
        this.time+= deltaTime;
        switch(this.state){
            case 0:
                if(rectangle.getDistance(p1.hitbox.getCenter(),this.hitbox.getCenter())>300){
                    this.moveTo(deltaTime,rectangle.getAngle(this.hitbox.getCenter(),p1.hitbox.getCenter()));
                } else{
                    this.changeState(1);
                }
                if(this.time-this.eventTime>15){
                    this.incrememtLegs();
                    this.eventTime=this.time;
                }
                break;
            case 1:
                if(this.time-this.eventTime>40){
                    this.shoot();
                    this.changeState(2);
                }
            case 2:
                if(this.time-this.eventTime>60){
                    this.changeState(0);
                }
        }
        if(this.y+this.x-p1.hitbox.x>p1.hitbox.y){//lower than slope of one
            if(this.y-this.x+p1.hitbox.x>p1.hitbox.y){
                this.body.texture=this.animImgs[1];
            } else {
                this.body.texture=this.animImgs[2];
            }
        } else {
            if(this.y-this.x+p1.hitbox.x>p1.hitbox.y){
                this.body.texture=this.animImgs[3];
            } else {
                this.body.texture=this.animImgs[0];
            }
        }
        this.hitbox = this.hitbox.translateAbsolute(this.x,this.y);
            playerBullets.forEach(bul=>{
                if(bul.hitbox.touches(this.hitbox)){
                    bul.destroy();
                    this.hp-=bul.dammage;
                    this.dx += Math.cos(bul.heading)*0.1*(bul.speed*bul.dammage);
                    this.dy += Math.sin(bul.heading)*0.1*(bul.speed*bul.dammage);
                    if(this.hp<=0){
                        this.dx = Math.cos(bul.heading)*Math.sqrt(bul.speed*bul.dammage);
                        this.dy = -Math.sin(bul.heading)*Math.sqrt(bul.speed*bul.dammage);
                        this.destroy();
                    }
                }
            });
        this.x+=this.dx;
        this.y+=this.dy;
        let modFric=this.getFrictionModifyer();
        this.dx*=this.friction*modFric;
        this.dy*=this.friction*modFric;
        this.body.x = this.x;
        this.body.y = this.y;
    }
    moveTo(deltaTime: number, angle: number){
        this.dx+=deltaTime*Math.cos(angle)*this.speed;
        this.dy+=deltaTime*Math.sin(angle)*this.speed;
    }
    getFrictionModifyer():number{
        return 1;
    }
    changeState(state: number){
        switch(state){
            case 0:
                this.state =0;
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
    abstract setLegs(index: number):void;
    abstract shoot():void;
    abstract incrememtLegs():void;
}
export class bulletMan extends walker{

    AI: number; //the type of enemy behavior
    barrelDist: number; //the distance from the pivot to the barrel
    barrelAngle: number; //the angle from the pivot to the barrel 
    barrel: PIXI.Point;
    constructor(x: number, y: number, enemyType: number){
        super();
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.time = 0;
        this.getTypeProperties(enemyType);
        foreGroundImage.addChild(this.body);
        foreGroundImage.addChild(this.gun);
        this.body.addChild(this.legs);
    }
    update(deltaTime: number){
        super.update(deltaTime);
        this.calcGunPosition();
    }
    getTypeProperties(type: number){
        let gunData;
        switch(type){
            case 1:
                this.AI = 1;
                this.hp = 20;
                this.speed=3;
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
                gunData = PIXI.loader.resources["res/gunData.json"].data.guns.blackPistol   ;
                break;
        }
        this.gun.pivot = new PIXI.Point(gunData.handle.x,gunData.handle.y);
        this.barrelAngle = Math.atan2(gunData.barrel.y-gunData.handle.y,gunData.barrel.x-gunData.handle.x);
        this.barrelDist = rectangle.getDistance(new PIXI.Point(gunData.handle.x,gunData.handle.y),new PIXI.Point(gunData.barrel.x,gunData.barrel.y));
        this.barrel = new PIXI.Point(gunData.barrel.x,gunData.barrel.y);
        this.body.position.x = this.x;
        this.body.position.y = this.y;
        this.legs.position.y = this.body.height;
        this.hitbox = new rectangle(this.x,this.y,this.body.width,this.body.height+this.legs.height);
    }
    shoot():void{
        let posit: PIXI.Point = this.getBarrelPoistion();
        gameEngine.makeBullet(posit.x, posit.y, rectangle.getAngle(posit, this.target),3,4,1,true);
    }
    calcGunPosition(){
        if(this.hitbox.getCenter().x<p1.hitbox.x){//right
            if(this.hitbox.getCenter().y<this.target.y){//bottom
                this.gun.scale.x=1;
                this.gun.x = this.hitbox.x+this.hitbox.width;
                this.gun.y = this.hitbox.getCenter().y;
                this.gun.rotation = rectangle.getAngle(this.gun.getGlobalPosition(),this.target);
            } else {
                this.gun.scale.x=-1;
                this.gun.x = this.hitbox.x+this.hitbox.width;
                this.gun.y = this.hitbox.getCenter().y;
                this.gun.rotation = Math.PI+rectangle.getAngle(this.gun.getGlobalPosition(),this.target);
            }
        } else{//left
            if(this.hitbox.getCenter().y<this.target.y){
                this.gun.scale.x = -1;
                this.gun.x = this.hitbox.x;
                this.gun.y = this.hitbox.getCenter().y;
                this.gun.rotation = Math.PI+rectangle.getAngle(this.gun.getGlobalPosition(),this.target);
            } else {
                this.gun.scale.x=1;
                this.gun.x = this.hitbox.x;
                this.gun.y = this.hitbox.getCenter().y;
                this.gun.rotation = rectangle.getAngle(this.gun.getGlobalPosition(),this.target);
            }
        }
    }
    getBarrelPoistion():PIXI.Point{
        if(this.gun.scale.x==1){
            return new PIXI.Point(this.gun.x+Math.cos(this.barrelAngle+this.gun.rotation)*this.barrelDist,this.gun.y+Math.sin(this.barrelAngle+this.gun.rotation)*this.barrelDist);
        } else {
            return new PIXI.Point(2*(this.gun.x+Math.cos(this.gun.rotation-Math.PI/2)*(this.gun.pivot.y-this.barrel.y))-(this.gun.x+Math.cos(this.barrelAngle+this.gun.rotation)*this.barrelDist),2*(this.gun.y+Math.sin(this.gun.rotation-Math.PI/2)*(this.gun.pivot.y-this.barrel.y))-(this.gun.y+Math.sin(this.barrelAngle+this.gun.rotation)*this.barrelDist));
        }
    }
    destroy(){
        super.destroy();
        foreGroundImage.removeChild(this.body);
        foreGroundImage.removeChild(this.gun);
        currentRoom.addFloorObject(this.hitbox.getCenter().x,this.hitbox.getCenter().y,1,this.dx,-this.dy);
        currentRoom.addFloorObjectAdv(this.body.position.x+this.hitbox.width, this.body.position.y+10, 2, this.dx*2,-this.dy*1.5,this.gun.rotation,0.5);
    }
    incrememtLegs(){
        this.legState++;
        this.legState%=4;
        if(this.legState==2||this.legState==0){
            this.setLegs(0);
        } else{
            this.setLegs(this.legState);
        }
    }
    setLegs(index: number){
        switch(index){
            case 0: 
                this.legs.texture=this.animImgs[4];
                break;
            case 1:
                this.legs.texture=this.animImgs[5];
            case 2:
                this.legs.texture=this.animImgs[6];
        }
    }
}