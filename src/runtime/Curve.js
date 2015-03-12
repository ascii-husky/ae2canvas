'use strict';

function Curve() {
}

Curve.prototype.draw = function (ctx, trim) {
    if (trim) ctx.bezierCurveTo(this.trim(trim.start, trim.end));
    else ctx.bezierCurveTo(this.points[2], this.points[3], this.points[4], this.points[5], this.points[6], this.points[7]);
};

Curve.prototype.setPoints = function (lastVertex, nextVertex) {
    this.points = [lastVertex[4], lastVertex[5], lastVertex[0], lastVertex[1], nextVertex[2], nextVertex[3], nextVertex[4], nextVertex[5]];
};

Curve.prototype.trim = function (from, to) {
    from = this.map(from);
    to = this.map(to);

    var e1, f1, g1, h1, j1, k1,
        e2, f2, g2, h2, j2, k2,
        trimmedPath,

        e1 = [this.lerp(this.points[0], this.points[2], from), this.lerp(this.points[1], this.points[3], from)];
    f1 = [this.lerp(this.points[2], this.points[4], from), this.lerp(this.points[3], this.points[5], from)];
    g1 = [this.lerp(this.points[4], this.points[6], from), this.lerp(this.points[5], this.points[7], from)];
    h1 = [this.lerp(e1[0], f1[0], from), this.lerp(e1[1], f1[1], from)];
    j1 = [this.lerp(f1[0], g1[0], from), this.lerp(f1[1], g1[1], from)];
    k1 = [this.lerp(h1[0], j1[0], from), this.lerp(h1[1], j1[1], from)];

    trimmedPath = [k1[0], k1[1], j1[0], j1[1], g1[0], g1[1], this.points[6], this.points[7]];

    e2 = [this.lerp(trimmedPath[0], trimmedPath[2], to), this.lerp(trimmedPath[1], trimmedPath[3], to)];
    f2 = [this.lerp(trimmedPath[2], this.points[4], to), this.lerp(trimmedPath[3], this.points[5], to)];
    g2 = [this.lerp(this.points[4], this.points[6], to), this.lerp(this.points[5], this.points[7], to)];
    h2 = [this.lerp(e2[0], f2[0], to), this.lerp(e2[1], f2[1], to)];
    j2 = [this.lerp(f2[0], g2[0], to), this.lerp(f2[1], g2[1], to)];
    k2 = [this.lerp(h2[0], j2[0], to), this.lerp(h2[1], j2[1], to)];

    trimmedPath = [trimmedPath[0], trimmedPath[1], e2[0], e2[1], h2[0], h2[1], k2[0], k2[1]];

    return trimmedPath;
};

Curve.prototype.getLength = function (len) {
    this.steps = Math.floor(len / 10);
    this.arcLengths = new Array(this.steps + 1);
    this.arcLengths[0] = 0;

    var ox = this.cubicN(0, this.points[0], this.points[2], this.points[4], this.points[6]),
        oy = this.cubicN(0, this.points[1], this.points[3], this.points[5], this.points[7]),
        clen = 0,
        iterator = 1 / this.steps;

    for (var i = 1; i <= this.steps; i += 1) {
        var x = this.cubicN(i * iterator, this.points[0], this.points[2], this.points[4], this.points[6]),
            y = this.cubicN(i * iterator, this.points[1], this.points[3], this.points[5], this.points[7]);

        var dx = ox - x,
            dy = oy - y;

        clen += Math.sqrt(dx * dx + dy * dy);
        this.arcLengths[i] = clen;

        ox = x;
        oy = y;
    }

    this.length = clen;
};

Curve.prototype.map = function (u) {
    var targetLength = u * this.arcLengths[this.steps];
    var low = 0,
        high = this.steps,
        index = 0;

    while (low < high) {
        index = low + (((high - low) / 2) | 0);
        if (this.arcLengths[index] < targetLength) {
            low = index + 1;

        } else {
            high = index;
        }
    }
    if (this.arcLengths[index] > targetLength) {
        index--;
    }

    var lengthBefore = this.arcLengths[index];
    if (lengthBefore === targetLength) {
        return index / this.steps;
    } else {
        return (index + (targetLength - lengthBefore) / (this.arcLengths[index + 1] - lengthBefore)) / this.steps;
    }
};

Curve.prototype.getValues = function (elapsed) {
    var t = this.map(elapsed),
        x = this.cubicN(t, this.points[0], this.points[2], this.points[4], this.points[6]),
        y = this.cubicN(t, this.points[1], this.points[3], this.points[5], this.points[7]);

    return [x, y];
};

Curve.prototype.cubicN = function (pct, a, b, c, d) {
    var t2 = pct * pct;
    var t3 = t2 * pct;
    return a + (-a * 3 + pct * (3 * a - a * pct)) * pct
        + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct
        + (c * 3 - c * 3 * pct) * t2
        + d * t3;
};

Curve.prototype.lerp = function (a, b, t) {
    return a + t * (b - a);
};

module.exports = Curve;