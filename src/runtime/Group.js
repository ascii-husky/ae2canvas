'use strict';

var Stroke = require('./Stroke'),
    Path = require('./Path'),
    Rect = require('./Rect'),
    Ellipse = require('./Ellipse'),
    Polystar = require('./Polystar'),
    AnimatedPath = require('./AnimatedPath'),
    Fill = require('./Fill'),
    Transform = require('./Transform'),
    Merge = require('./Merge');

function Group(data) {

    if (!data) return;

    this.name = data.name;
    this.index = data.index;
    this.transform = new Transform(data.transform);

    data.in ? this.in = data.in : this.in = 0;
    data.out ? this.out = data.out : this.out = 500000; // FIXME get comp total duration

    if (data.items) {
        this.items = [];
        for (var i = 0; i < data.items; i++) {
            var item = data.items[i];

            switch (item.type) {
                case 'fill':
                    this.items.push(new Fill(item));
                    break;
                case 'stroke':
                    this.items.push(new Stroke(item));
                    break;
                case 'merge':
                    this.items.push(new Merge(item));
                    break;
                case 'path':
                    this.items.push(new Path(item));
                    break;
                case 'rect':
                    this.items.push(new Rect(item));
                    break;
                case 'ellipse':
                    this.items.push(new Ellipse(item));
                    break;
                case 'polystar':
                    this.items.push(new Polystar(item));
                    break;
                case 'group':
                    this.items.push(new Group(item));
                    break;
            }
        }
    }
}

Group.prototype.draw = function (ctx, time, parentFill, parentStroke) {

    ctx.save();

    this.transform.transform(ctx, time);

    ctx.beginPath();
    if (this.items) {
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].draw(ctx, time);
        }
    }
    ctx.closePath();

    var fill = this.fill || parentFill;
    var stroke = this.stroke || parentStroke;

    if (fill) fill.setColor(ctx, time);
    if (stroke) stroke.setStroke(ctx, time);

    //TODO get order
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();

    if (this.groups) {
        for (var j = 0; j < this.groups.length; j++) {
            if (time >= this.groups[j].in && time < this.groups[j].out) {
                this.groups[j].draw(ctx, time, fill, stroke);
                if (j === this.groups.length - 2)
                    if (this.merge) this.merge.setCompositeOperation(ctx);
//                if (j === 0 && this.merge) this.merge.setCompositeOperation(ctx);

            }
        }
    }

    ctx.restore();
};

Group.prototype.reset = function () {
    this.transform.reset();

    if (this.shapes) {
        for (var i = 0; i < this.shapes.length; i++) {
            this.shapes[i].reset();
        }
    }
    if (this.groups) {
        for (var j = 0; j < this.groups.length; j++) {
            this.groups[j].reset();
        }
    }
    if (this.fill) {
        this.fill.reset();
    }
    if (this.stroke) {
        this.stroke.reset();
    }
};

module.exports = Group;

























