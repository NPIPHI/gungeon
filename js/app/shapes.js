define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class shape {
        constructor(type) {
            this.type = type;
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
        static magnitude(vector) {
            return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
        }
    }
    exports.shape = shape;
    class rectangle extends shape {
        constructor(x, y, width, height, rotation) {
            super(0);
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            while (rotation < 0) {
                rotation += PI * 2;
            }
            while (rotation > PI * 2) {
                rotation -= PI * 2;
            }
            this.rotation = rotation;
            this.verts = this.calcVerts();
        }
        intersect(shp) {
            let retV = true;
            if (shp.type == 0) {
                let axis = this.getNormals();
                let othAxis = shp.getNormals();
                othAxis.forEach(obj => {
                    axis.push(obj);
                });
                axis.forEach(ax => {
                    if (retV) {
                        let endPts = this.getAxisEnds(ax);
                        let oEndPts = shp.getAxisEnds(ax);
                        if (!((endPts[0] <= oEndPts[0] && endPts[1] >= oEndPts[0]) || (endPts[0] <= oEndPts[1] && endPts[1] >= oEndPts[1]) || (oEndPts[0] <= endPts[1] && oEndPts[1] >= endPts[1]) || (oEndPts[0] <= endPts[0] && oEndPts[1] >= endPts[0]))) {
                            retV = false;
                        }
                    }
                });
            }
            if (shp.type == 1) {
                let axis = this.getNormals();
                axis.forEach(ax => {
                    if (retV) {
                        let endPts = this.getAxisEnds(ax);
                        let oEndPts = shp.getAxisEnds(ax);
                        if (!((endPts[0] <= oEndPts[0] && endPts[1] >= oEndPts[0]) || (endPts[0] <= oEndPts[1] && endPts[1] >= oEndPts[1]) || (oEndPts[0] <= endPts[1] && oEndPts[1] >= endPts[1]) || (oEndPts[0] <= endPts[0] && oEndPts[1] >= endPts[0]))) {
                            retV = false;
                        }
                    }
                });
            }
            return retV;
        }
        calcVerts() {
            if (this.rotation == 0) {
                return [new PIXI.Point(this.x, this.y),
                    new PIXI.Point(this.x + this.width, this.y),
                    new PIXI.Point(this.x + this.width, this.y + this.height),
                    new PIXI.Point(this.x, this.y + this.height)];
            }
            else {
                return [new PIXI.Point(this.x, this.y),
                    new PIXI.Point(this.x + Math.cos(this.rotation) * this.width, this.y + Math.sin(this.rotation) * this.width),
                    new PIXI.Point(this.x + Math.cos(this.rotation) * this.width + Math.cos(this.rotation + PI2) * this.height, this.y + Math.sin(this.rotation) * this.width + Math.sin(this.rotation + PI2) * this.height),
                    new PIXI.Point(this.x + Math.cos(this.rotation + PI2) * this.height, this.y + Math.sin(this.rotation + PI2) * this.height)];
            }
        }
        getEdgePts(axis) {
            let axDif = axis - this.rotation;
            while (axDif < 0) {
                axDif += PI * 2;
            }
            if (axDif >= PI + PI2) {
                return [this.verts[0], this.verts[2]];
            }
            if (axDif < PI2) {
                return [this.verts[3], this.verts[1]];
            }
            if (axDif < PI && axDif >= PI2) {
                return [this.verts[2], this.verts[0]];
            }
            if (axDif < PI + PI2 && axDif >= PI) {
                return [this.verts[1], this.verts[3]];
            }
        }
        getAxisEnds(axis) {
            let ax = (axis == PI2 || axis == PI + PI2) ? [0, 1] : [1, Math.tan(axis)];
            let axMag = shape.magnitude(ax);
            let v = this.getEdgePts(axis);
            let vax = v[0].x * ax[0] + v[0].y * ax[1];
            let p1 = vax / axMag;
            vax = v[1].x * ax[0] + v[1].y * ax[1];
            let p2 = vax / axMag;
            return [p1, p2];
        }
        getX() {
            return this.x;
        }
        getY() {
            return this.y;
        }
        getWidth() {
            return this.width;
        }
        getHeight() {
            return this.height;
        }
        getNormals() {
            return [this.rotation, this.rotation + Math.PI / 2];
        }
        translateAbsolute(x, y) {
            return new rectangle(x, y, this.width, this.height, this.rotation);
        }
        getCenter() {
            return new PIXI.Point(this.x + this.width / 2, this.y + this.height / 2);
        }
    }
    exports.rectangle = rectangle;
    class circle extends shape {
        constructor(x, y, radius) {
            super(1);
        }
        getNormals() {
            return [];
        }
        getEdgePts(axis) {
            throw "should not be called on circle";
        }
        getCenter() {
            return new PIXI.Point(this.x, this.y);
        }
        intersect(shp) {
            let retV = true;
            if (shp.type == 0) {
                let axis = shp.getNormals();
                axis.forEach(ax => {
                    if (retV) {
                        let endPts = this.getAxisEnds(ax);
                        let oEndPts = shp.getAxisEnds(ax);
                        if (!((endPts[0] <= oEndPts[0] && endPts[1] >= oEndPts[0]) || (endPts[0] <= oEndPts[1] && endPts[1] >= oEndPts[1]) || (oEndPts[0] <= endPts[1] && oEndPts[1] >= endPts[1]) || (oEndPts[0] <= endPts[0] && oEndPts[1] >= endPts[0]))) {
                            retV = false;
                        }
                    }
                });
            }
            if (shp.type == 1) {
                if (shape.lessThanDistance(new PIXI.Point(this.x, this.y), shp.getCenter(), (this.radius + shp.getWidth() / 2))) {
                    retV = true;
                }
            }
            return retV;
        }
        translateAbsolute(x, y) {
            return new circle(x, y, this.radius);
        }
        getAxisEnds(axis) {
            let ax = (axis == PI2 || axis == PI + PI2) ? [0, 1] : [1, Math.tan(axis)];
            let axMag = shape.magnitude(ax);
            let v = this.getEdgePts(axis);
            let vax = v[0].x * ax[0] + v[0].y * ax[1];
            let p1 = vax / axMag;
            return [p1 - this.radius, p1 + this.radius];
        }
        getX() {
            return this.x - this.radius;
        }
        getY() {
            return this.y - this.radius;
        }
        getWidth() {
            return this.radius * 2;
        }
        getHeight() {
            return this.radius * 2;
        }
    }
    exports.circle = circle;
    class line {
        constructor(ABC) {
            this.A = ABC[0];
            this.B = ABC[1];
        }
        static fromPtRadians(x, y, rad) {
            let slope = Math.tan(rad);
            return [1 / (x - y / slope), 1 / (y - slope * x)];
        }
        static getDistance(line1, line2) {
        }
        getYat(x) {
            return (-x * this.A / this.B) + (1 / this.B);
        }
        getXat(y) {
            return (-y * this.B / this.A) + (1 / this.A);
        }
    }
    let PI = Math.PI;
    let PI2 = Math.PI / 2;
});
//# sourceMappingURL=shapes.js.map