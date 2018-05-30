import { Point } from "pixi.js";
export default class gameEngine{
    constructor(app: PIXI.Application){
        var pixi = app;
        app.stage.addChild(this.shapes);
        app.stage.addChild(this.rocket);
    }
    shapes: PIXI.Graphics = new PIXI.Graphics;
    path: PIXI.Point[] = [];
    rocket = new PIXI.Sprite(PIXI.loader.resources["images/rocket.png"].texture);    
    makeRocket(x:number, y:number):void{
        this.rocket.y = y;
        this.rocket.x = x;
    }
    cycle(time: number):void{
        this.rocket.x = 400 + 400 * Math.sin(time / 73);
        this.rocket.rotation += 0.01;
        let scale = 0.5 + Math.sin(time / 100) * 0.25;
        this.rocket.scale = new PIXI.Point(scale, scale);
        this.path.push(new PIXI.Point(this.rocket.x,this.rocket.y));
        this.path.forEach(pt => this.shapes.drawRect(pt.x, pt.y, 1,1));
    }
};

