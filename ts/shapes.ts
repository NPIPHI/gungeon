

abstract class shape{
    constructor(){
    }
    static getAngle(p1: PIXI.Point, p2: PIXI.Point):number{
        return Math.atan2(p2.y-p1.y, p2.x-p1.x);
    }
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
}


export class circle{
    readonly x: number;
    readonly y: number;
    readonly radius: number;
    constructor(x: number, y: number, radius: number){

    }
}