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
    speed: number;
    eventTime: number;
    dx: number;
    dy: number;
    state: number = 0; //0 is moving, 1 is shooting, 2 is reloading
    legState: number = 0; //0 and 2 are straight
    friction: number;//what to multiply dx and dy by every frame
    animImgs: PIXI.Texture[] = Array<PIXI.Texture>();
    constructor(){
        super();
    }
    update(deltaTime: number){
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
    constructor(x: number, y: number, enemyType: number){
        super();
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.time = 0;
        this.getTypeProperties(enemyType);
        foreGroundImage.addChild(this.body);
        this.body.addChild(this.legs);
    }
    getTypeProperties(type: number){
        switch(type){
            case 1:
                this.AI = 1;
                this.hp = 200;
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
                break;
        }
        this.body.position.x = this.x;
        this.body.position.y = this.y;
        this.legs.position.y = this.body.height;
        this.hitbox = new rectangle(this.x,this.y,this.body.width,this.body.height+this.legs.height);
    }
    shoot():void{
        gameEngine.makeBullet(this.hitbox.getCenter().x, this.hitbox.getCenter().y, rectangle.getAngle(this.hitbox.getCenter(), p1.hitbox.getCenter()),3,4,1,true);
    }
    destroy(){
        super.destroy();
        foreGroundImage.removeChild(this.body);
        currentRoom.addFloorObject(this.body.position.x,this.body.position.y,1,this.dx,-this.dy);
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