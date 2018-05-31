

export default class rectangle{
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number){
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
    translateAbsolute(x: number, y:number){
        this.x = x;
        this.y = y;
    }
    translateAbsolutePoint(pos: PIXI.Point){
        this.x = pos.x;
        this.y = pos.y;
    }
}