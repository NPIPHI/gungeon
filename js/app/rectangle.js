define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class rectangle {
        constructor(x, y, width, height) {
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
            this.x = x;
            this.y = y;
        }
        translateAbsolutePoint(pos) {
            this.x = pos.x;
            this.y = pos.y;
        }
    }
    exports.default = rectangle;
});
//# sourceMappingURL=rectangle.js.map