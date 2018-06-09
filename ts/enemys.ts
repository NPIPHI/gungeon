import gameObject from "./gameObject";
import {foreGroundImage, gameEngine, p1, playerBullets} from "./gameEngine";
import {rectangle} from "./shapes";

abstract class enemy extends gameObject{

}


export class bulletMan extends enemy{
    body: PIXI.Sprite;
    legs: PIXI.Sprite;
    animImgs: PIXI.Texture[] = Array<PIXI.Texture>();
    AI: number; //the type of enemy behavior
    hp: number;
    speed: number;
    x: number;
    y: number;
    time: number;
    eventTime: number;
    hitbox: rectangle;
    state: number = 0; //0 is moving, 1 is shooting, 2 is reloading
    constructor(x: number, y: number, enemyType: number){
        super();
        this.x = x;
        this.y = y;
        this.time = 0;
        this.getTypeProperties(enemyType);
        foreGroundImage.addChild(this.body);
        this.body.addChild(this.legs);
    }
    getTypeProperties(type: number){
        switch(type){
            case 1:
                this.AI = 1;
                this.hp = 20;
                this.speed=3;
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
                    if(this.hp<=0){
                        this.destroy();
                    }
                }
            });
        this.body.x=this.x;
        this.body.y = this.y;
    }
    shoot(){
        gameEngine.makeBullet(this.hitbox.getCenter().x, this.hitbox.getCenter().y, rectangle.getAngle(this.hitbox.getCenter(), p1.hitbox.getCenter()),3,4,1,true);
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
    moveTo(deltaTime: number, angle: number){
        this.x+=deltaTime*Math.cos(angle)*2;
        this.y+=deltaTime*Math.sin(angle)*2;
    }
    destroy(){
        super.destroy();
        foreGroundImage.removeChild(this.body);
    }
    incrememtLegs(){

    }
    setLegs(index: number){

    }
}