define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class shape {
        constructor() {
        }
        static getAngle(p1, p2) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }
    }
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
    }
    exports.rectangle = rectangle;
});
//# sourceMappingURL=shapes.js.map