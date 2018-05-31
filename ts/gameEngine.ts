import { Point } from "pixi.js";
import keyboard from "./keyboard";
import gameObject from "./gameObject";
import rectangle from "./rectangle";
export class gameEngine{
    constructor(app: PIXI.Application){
            pixi = app;
            testRects = new Array<rectangle>();
            testRects.push(new rectangle(0,0,500,30));
    }
    makePlayer(x:number, y:number):void{
        new player(x,y);
    }
    cycle(deltaTime: number, time: number):void{
        gameObjects.forEach(element => {
            element.update();
        });
    }
};
let pixi: PIXI.Application;
let gameObjects: Array<gameObject> = new Array<gameObject>();
let testRects: rectangle[];


class player extends gameObject{
    mov: PIXI.Point = new PIXI.Point(0,0);
    hitbox: rectangle = new rectangle(0,0,40,40);
    grounded: boolean = false;
    constructor(x: number, y: number){
        super();
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage("images/playerSmile.png"));
        this.sprite.position = new PIXI.Point(x,y);
        gameObjects.push(this);
        pixi.stage.addChild(this.sprite);
    }
    update(){
        this.keyboardManage();
        this.sprite.position.x+=this.mov.x;
        this.sprite.position.y+=this.mov.y;
        this.hitbox.translateAbsolute(this.sprite.position.x, this.sprite.position.y);
        this.collision();
        this.mov.set(0,0);
    }
    keyboardManage(){
        if(keyboard.getKey(87)){//w
            this.mov.y-=3;
        }
        if(keyboard.getKey(65)){//a
            this.mov.x+=-3;
        }
        if(keyboard.getKey(83)){//s
            this.mov.y+=3;
        }
        if(keyboard.getKey(68)){//d
            this.mov.x+=3;
        }
    }
    collision(){
        let collisionRects: rectangle[] = new Array<rectangle>();
        testRects.forEach(r => {
            if(r.touches(this.hitbox)){
                collisionRects.push(r);
            }
        });
        collisionRects.forEach(r => {
            if(this.mov.x>0) {
                if ((this.sprite.position.x+this.hitbox.width)-r.x < this.mov.x*2&&!(r.y+this.mov.y>=this.sprite.position.y+this.hitbox.height||r.y+r.height-this.mov.y<=this.sprite.position.y)) {//right
                    this.sprite.position.x = -this.hitbox.width + r.x;
                    this.mov.set(0,this.mov.y);
                }
            }
            if(this.mov.x<0) {
                if((r.x + r.width) - this.sprite.position.x < - this.mov.x*2&&!(r.y+this.mov.y>=this.sprite.position.y+this.hitbox.height||r.y+r.height-this.mov.y<=this.sprite.position.y)) {//left
                    this.sprite.position.x = r.x + r.width;
                    this.mov.set(0,this.mov.y);
                }
            }
            if(this.mov.y>0) {
                if ((this.sprite.position.y+this.hitbox.height)-r.y<=this.mov.y*2&&!(r.x>=this.sprite.position.x+this.hitbox.width||r.x+r.width<=this.sprite.position.x)) {//down
                    this.sprite.position.y = -this.hitbox.height + r.y;
                    this.grounded = true;
                    this.mov.set(this.mov.x, 0);
                }
            }
            if(this.mov.y<0) {
                if((r.y + r.height) - this.sprite.position.y < -this.mov.y*2&&!(r.x>=this.sprite.position.x+this.hitbox.width||r.x+r.width<=this.sprite.position.x)) {//up
                    this.sprite.position.y = r.y + r.height;
                    this.mov.set(this.mov.x,0);
                }
            }
        });
    }
}