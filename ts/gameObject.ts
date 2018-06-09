import {bufferGameObjects, removeGameObjects} from "./gameEngine";


export default abstract class gameObject{
    constructor(){
        bufferGameObjects.push(this);
    }
    update(deltaTime: number){

    }
    destroy(){
        removeGameObjects.push(this);
    }
    sprite: PIXI.Sprite;
}
