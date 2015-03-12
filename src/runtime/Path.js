'use strict';

var Curve = require('./Curve');

function Path(data) {
    this.name = data.name;
    this.closed = data.closed;
    this.frames = data.frames;
    this.verticesCount = this.frames[0].v.length;

    this.curves = [];
    for (var i = 1; i < this.verticesCount; i++) {
        var frame = this.frames[0],
            vertices = frame.v,
            lastVertex = vertices[i - 1],
            nextVertex = vertices[i],
            lengths = frame.len,
            curve = new Curve();

        curve.points = [lastVertex[4], lastVertex[5], lastVertex[0], lastVertex[1], nextVertex[2], nextVertex[3], nextVertex[4], nextVertex[5]];
        curve.getLength(lengths[i - 1]);
        this.curves.push(curve);
    }
}

Path.prototype.draw = function (ctx, time, trim) {
    //var frame = this.getValue(time);
    this.updateCurves(time);

    if (trim) {
        trim = this.getTrimValues(trim, frame);
        if (trim.start === 0 && trim.end === 0) {
            return;
        }
    }

    for (var j = 0; j < this.curves.length; j++) {
        if (j === 0) ctx.moveTo(this.curves[j].points[0], this.curves[j].points[1]);

        if (!trim) {
            this.curves[j].draw(ctx);
        } else {

            //var tv;
            //
            //if (j === 1 && trim.startIndex !== 0) {
            //    ctx.moveTo(lastVertex[4], lastVertex[5]);
            //}
            //else if (j === trim.startIndex + 1 && j === trim.endIndex + 1) {
            //    //tv = this.trim(lastVertex, nextVertex, trim.start, trim.end, frame.len[j - 1]);
            //    tv = this.trim(lastVertex, nextVertex, trim.start, trim.end, frame.len[j - 1]);
            //    ctx.moveTo(tv.start[4], tv.start[5]);
            //    ctx.bezierCurveTo(tv.start[0], tv.start[1], tv.end[2], tv.end[3], tv.end[4], tv.end[5]);
            //} else if (j === trim.startIndex + 1) {
            //    tv = this.trim(lastVertex, nextVertex, trim.start, 1, frame.len[j - 1]);
            //    ctx.moveTo(tv.start[4], tv.start[5]);
            //    ctx.bezierCurveTo(tv.start[0], tv.start[1], tv.end[2], tv.end[3], tv.end[4], tv.end[5]);
            //} else if (j === trim.endIndex + 1) {
            //    tv = this.trim(lastVertex, nextVertex, 0, trim.end, frame.len[j - 1]);
            //    ctx.bezierCurveTo(tv.start[0], tv.start[1], tv.end[2], tv.end[3], tv.end[4], tv.end[5]);
            //} else if (j > trim.startIndex + 1 && j < trim.endIndex + 1) {
            //    ctx.bezierCurveTo(lastVertex[0], lastVertex[1], nextVertex[2], nextVertex[3], nextVertex[4], nextVertex[5]);
            //}
        }
    }
};

Path.prototype.updateCurves = function () {
};

Path.prototype.getTrimValues = function (trim, frame) {
    var i;

    var actualTrim = {
        startIndex: 0,
        endIndex  : 0,
        start     : 0,
        end       : 0
    };

    if (trim.start === 0) {
        if (trim.end === 0) {
            return actualTrim;
        } else if (trim.end === 1) {
            actualTrim.endIndex = frame.len.length;
            return actualTrim;
        }
    }

    var totalLen = this.sumArray(frame.len),
        trimAtLen;

    trimAtLen = totalLen * trim.start;

    for (i = 0; i < frame.len.length; i++) {
        if (trimAtLen > 0 && trimAtLen < frame.len[i]) {
            actualTrim.startIndex = i;
            actualTrim.start = trimAtLen / frame.len[i];
        }
        trimAtLen -= frame.len[i];
    }

    trimAtLen = totalLen * trim.end;

    for (i = 0; i < frame.len.length; i++) {
        if (trimAtLen > 0 && trimAtLen < frame.len[i]) {
            actualTrim.endIndex = i;
            actualTrim.end = trimAtLen / frame.len[i];
        }
        trimAtLen -= frame.len[i];
    }

    return actualTrim;
};

Path.prototype.sumArray = function (arr) {
    function add(a, b) {
        return a + b;
    }

    return arr.reduce(add);
};

Path.prototype.reset = function (reversed) {
};

module.exports = Path;



























