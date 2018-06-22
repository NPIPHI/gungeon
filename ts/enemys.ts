import gameObject from "./gameObject";
import {foreGroundImage, gameEngine, p1, playerBullets, currentRoom, bigHealthBar} from "./gameEngine";
import {rectangle} from "./shapes";
import { load } from "./main";

abstract class enemy extends gameObject{
    constructor(x: number, y: number){
        super();
        this.x = x; 
        this.y = y;
        this.target = new PIXI.Point(0,0);
    }
    hitDetect(){
        playerBullets.forEach(bul=>{
            if(bul.hitbox.touches(this.hitbox)){
                bul.destroy();
                this.hp-=bul.dammage;
                this.dx += Math.cos(bul.heading)*0.1*(bul.speed*bul.dammage);
                this.dy += Math.sin(bul.heading)*0.1*(bul.speed*bul.dammage);
                if(this.hp<=0){
                     if(!this.isDestroyed){
                        this.dx = Math.cos(bul.heading)*Math.sqrt(bul.speed*bul.dammage);
                        this.dy = -Math.sin(bul.heading)*Math.sqrt(bul.speed*bul.dammage);
                        this.remove();
                        this.isDestroyed = true;
                    }
                }
            }
        });
    }
    abstract remove():void;
    sprites: PIXI.Sprite[] = new Array<PIXI.Sprite>();
    hp: number=0;
    dx: number=0;
    dy: number=0;
    x: number=0;
    y: number=0;
    time: number=0;
    hitbox: rectangle;
    target: PIXI.Point;
    maxHp: number=0;
    isDestroyed: boolean = false;
}


abstract class walker extends enemy{
    body: PIXI.Sprite;
    legs: PIXI.Sprite;
    gun: PIXI.Sprite;
    speed: number;
    eventTime: number;
    state: number = 0; //0 is moving, 1 is shooting, 2 is reloading
    legState: number = 0; //0 and 2 are straight
    friction: number;//what to multiply dx and dy by every frame
    animImgs: PIXI.Texture[] = Array<PIXI.Texture>();
    constructor(x: number, y: number){
        super(x,y);
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
        this.hitDetect();
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
        super(x,y);
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
                this.maxHp = 20;
                this.speed=3;
                this.friction = 0.3;
                this.body = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletMan.png"]);
                this.legs = new PIXI.Sprite(PIXI.loader.resources["res/characters.json"].textures["bulletManLegs0.png"]);
                this.animImgs.push(load.loadBoardered("characters","bulletMan"));
                this.animImgs.push(load.loadBoardered("characters","bulletManBack"));
                this.animImgs.push(load.loadBoardered("characters","bulletManLeft"));
                this.animImgs.push(load.loadBoardered("characters","bulletManRight"));
                this.animImgs.push(load.loadBoardered("characters","bulletManLegs0"));
                this.animImgs.push(load.loadBoardered("characters","bulletManLegs1"));
                this.animImgs.push(load.loadBoardered("characters","bulletManLegs2"));
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
        gameEngine.makeBullet(posit.x, posit.y, rectangle.getAngle(posit, this.target),0,3,4,1,true);
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
    remove(){
        super.destroy();
        foreGroundImage.removeChild(this.body);
        foreGroundImage.removeChild(this.gun);
        currentRoom.addFloorObject(this.hitbox.getCenter().x,this.hitbox.getCenter().y,1,this.dx,-this.dy);
        currentRoom.addFloorObjectAdv(this.body.position.x+this.hitbox.width, this.body.position.y+10, 2, this.dx*2,-this.dy*1.5,this.gun.rotation,0.5,0,1);
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
abstract class boss extends enemy{
    health: bigHealthBar;
    constructor(x: number,y:number ){
        super(x,y);
    }
}
export class potato extends boss{
    time: number = 0;
    eventTime: number = 0;
    endAttackTime: number = 0;
    attackType: number = 0;
    shadow: PIXI.Sprite;
    z:number;
    jumpPeriod:number=100;
    destroyed:boolean=false;
    constructor(x: number, y: number){
        super(x,y);
        this.hp = 1000;
        this.health = new bigHealthBar(50,1000,1820,this.hp);
        this.sprite = new PIXI.Sprite(load.loadBoardered("characters","potatoBoss"));
        this.shadow = new PIXI.Sprite(load.loadBoardered("characters","potatoBossShadow"));
        this.shadow.alpha = 0.5;
        this.shadow.anchor.y=1;
        this.shadow.x = x;
        this.shadow.y = y+60;
        this.sprite.x = x;
        this.sprite.y = y;
        this.z = 0;
        this.hitbox = new rectangle(x,y, 40,60);
        this.time = 0;
        foreGroundImage.addChild(this.shadow);
        foreGroundImage.addChild(this.sprite);
    }
    update(deltaTime: number){
        this.time += deltaTime;
        this.hitDetect();
        this.health.setPointer(this.hp);
        switch(this.attackType){
            case 0:
                while(this.time>= this.eventTime){
                    let dispersion = Math.random()-0.5;
                    gameEngine.makeBullet(this.x+17+dispersion*20,this.y+25, rectangle.getAngle(this.hitbox.getCenter(),this.target)+dispersion*0.2,this.eventTime-this.time,3,5,0,true)
                    this.eventTime += 0.5;
                }
                this.z=0;
                this.shadow.y = this.y+60;
                this.sprite.x=this.x;
                this.sprite.y=this.y;
                break;
            case 1:
                if(this.eventTime<this.time){
                    this.eventTime=this.time+this.jumpPeriod;
                    for(let i=0; i < 64; i++){
                        gameEngine.makeBullet(this.x+18,this.y+58,(i*Math.PI)/32,1,3,5,1,true);
                    }
                }
                this.z = Math.sqrt(Math.abs(Math.min(this.eventTime-this.time,this.jumpPeriod-(this.eventTime-this.time))))*5;
                this.shadow.x=Math.cos(Math.PI/3)*this.z+this.x;
                this.shadow.y=-Math.sin(Math.PI/3)*this.z+this.y+60;
                this.sprite.y=this.y-this.z;
                this.sprite.x=this.x;
                this.shadow.alpha = -this.z/this.jumpPeriod+0.7;
                break;
            case 2:
                gameEngine.makeBullet(100,200,0,0,2,5,0,true);
                this.sprite.y=this.y;
                this.sprite.x=this.x;
                break;
        }
        if(this.time>this.endAttackTime){
            //this.changeState(Math.floor(Math.random()*3));
            this.changeState(1);
        }
        this.hitbox = this.hitbox.translateAbsolute(this.sprite.x,this.sprite.y);
        this.target = new PIXI.Point(0,0);//p1.hitbox.getCenter();
    }
    changeState(state: number){
        switch(state){
            case 0: //shoot masive amount of bullets from mouth
                this.attackType =0;
                this.eventTime = this.time;
                this.endAttackTime = this.time+240+Math.random()*240;
                this.sprite.texture = load.loadBoardered("characters","potatoBoss");
                this.shadow.x=this.x;
                this.shadow.y=this.y+60;
                break;
            case 1: //jump up and slam down to creat ring of bullets
                this.attackType = 1;
                this.eventTime = this.time+10;
                this.endAttackTime = this.time+3030;
                this.sprite.texture = load.loadBoardered("characters","potatoBossClosed");
                this.shadow.x=this.x;
                this.shadow.y=this.y+60;
                break;
            case 2: //drop potatos from the sky
                this.attackType = 2;
                this.eventTime = this.time+5;
                this.endAttackTime = this.time+360+Math.random()*360;
                this.sprite.texture = load.loadBoardered("characters","potatoBossClosed");
                this.shadow.x=this.x;
                this.shadow.y=this.y+60;
                break;
        }
    }
    remove(){
        if(!this.destroyed){
            super.destroy();
            foreGroundImage.removeChild(this.sprite);
            foreGroundImage.removeChild(this.shadow);
            currentRoom.addFloorObject(this.hitbox.getCenter().x,this.hitbox.getCenter().y,3,this.dx,this.dy);
            this.health.remove();
            for(let i = 0; i < 250; i++){
                let launchRate= Math.random()*1.5;
                currentRoom.addFloorObjectAdv(i*7+50,1000,4,Math.random()*10*launchRate-5*launchRate,Math.random()*12*launchRate-6*launchRate,Math.random()*Math.PI,Math.random()*Math.PI, 0.01, 1/(launchRate+0.5));
            }
        }
        this.destroyed = true;
    }
}