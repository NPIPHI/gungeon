export default abstract class gameObject{
    constructor(){

    }
    update(deltaTime: number){

    }
    abstract destroy():void;
    sprite: PIXI.Sprite;
}
