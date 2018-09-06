

export abstract class shape{
    constructor(){
    }
    static getAngle(p1: PIXI.Point, p2: PIXI.Point):number{
        return Math.atan2(p2.y-p1.y, p2.x-p1.x);
    }
    static getDistance(p1: PIXI.Point, p2: PIXI.Point):number{
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
    }
    static lessThanDistance(p1: PIXI.Point, p2: PIXI.Point, dist: number):boolean{
        return(dist*dist)<Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2);
    }
    abstract touches(rect: rectangle):boolean;
    abstract intersects(rect: rectangle):boolean;
    abstract getCenter():PIXI.Point;
    abstract translateAbsolute(x: number, y: number):shape;
}
export class rectangle extends shape{
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    constructor(x: number, y: number, width: number, height: number){
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    intersects(rect: rectangle):boolean{//exclusive
        let tw = this.width;
        let th = this.height;
        let rw = rect.width;
        let rh = rect.height;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
            return false;
        }
        let tx = this.x;
        let ty = this.y;
        let rx = rect.x;
        let ry = rect.y;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //      overflow || intersect
        return ((rw < rx || rw > tx) &&
                (rh < ry || rh > ty) &&
                (tw < tx || tw > rx) &&
                (th < ty || th > ry));

    }
    touches(rect: rectangle):boolean{//inclusive
        let tw = this.width;
        let th = this.height;
        let rw = rect.width;
        let rh = rect.height;
        if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
            return false;
        }
        let tx = this.x;
        let ty = this.y;
        let rx = rect.x;
        let ry = rect.y;
        rw += rx;
        rh += ry;
        tw += tx;
        th += ty;
        //      overflow || intersect
        return ((rw <= rx || rw >= tx) &&
                (rh <= ry || rh >= ty) &&
                (tw <= tx || tw >= rx) &&
                (th <= ty || th >= ry));

    }
    translateAbsolute(x: number, y:number):rectangle{
        return new rectangle(x,y, this.width,this.height);
    }
    getCenter():PIXI.Point{
        return new PIXI.Point(this.x + this.width/2, this.y + this.height/2);
    }
}


export class circle extends shape{
    readonly x: number;
    readonly y: number;
    readonly radius: number;
    constructor(x: number, y: number, radius: number){
        super();
    }
    getCenter():PIXI.Point{
        return new PIXI.Point(this.x,this.y);
    }
    intersects(rect: rectangle):boolean{
        return true;
    }
    touches(rect: rectangle):boolean{
        return true
    }
    translateAbsolute(x: number, y: number):shape{
        return new circle(x,y,this.radius);
    }
}