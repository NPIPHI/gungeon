import {bufferGameObjects, removeGameObjects, gameObjects} from "./gameEngine";


export default abstract class gameObject{
    rem: boolean  = false;
    constructor(){
        bufferGameObjects.push(this);
    }
    abstract update(deltaTime: number):void;
    destroy(){
        if(!this.rem){
            removeGameObjects.push(this);
            this.rem = true;
        }
    }
    sprite: PIXI.Sprite;
}
