define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class shape {
        constructor() {
        }
        static getAngle(p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }
        static getDistance(p1, p2) {
            return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
        }
        static lessThanDistance(p1, p2, dist) {
            return (dist * dist) < Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        }
    }
    exports.shape = shape;
    class rectangle extends shape {
        constructor(x, y, width, height) {
            super();
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        intersects(rect) {
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
            return ((rw < rx || rw > tx) &&
                (rh < ry || rh > ty) &&
                (tw < tx || tw > rx) &&
                (th < ty || th > ry));
        }
        touches(rect) {
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
            return ((rw <= rx || rw >= tx) &&
                (rh <= ry || rh >= ty) &&
                (tw <= tx || tw >= rx) &&
                (th <= ty || th >= ry));
        }
        translateAbsolute(x, y) {
            return new rectangle(x, y, this.width, this.height);
        }
        getCenter() {
            return new PIXI.Point(this.x + this.width / 2, this.y + this.height / 2);
        }
    }
    exports.rectangle = rectangle;
    class circle extends shape {
        constructor(x, y, radius) {
            super();
        }
        getCenter() {
            return new PIXI.Point(this.x, this.y);
        }
        intersects(rect) {
            return true;
        }
        touches(rect) {
            return true;
        }
        translateAbsolute(x, y) {
            return new circle(x, y, this.radius);
        }
    }
    exports.circle = circle;
});
//# sourceMappingURL=shapes.js.map