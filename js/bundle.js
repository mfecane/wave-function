'use strict';

var Vector2 = /** @class */ (function () {
    function Vector2(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    Vector2.prototype.multiplyScalar = function (value) {
        this.x *= value;
        this.y *= value;
        return this;
    };
    Vector2.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };
    Vector2.prototype.sub = function (other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    };
    Vector2.prototype.rotateAroundZero = function (angle) {
        var _a = this, x = _a.x, y = _a.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);
        return this;
    };
    return Vector2;
}());

var Graphics = /** @class */ (function () {
    function Graphics() {
        this.callbacks = [];
        this.currentPosition = { cx: 0, cy: 0, w: 1024 };
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.spriteSize = 32;
    }
    Graphics.prototype.init = function () {
        var _this = this;
        this.canvas = document.createElement('canvas');
        var container = document.querySelector('.container');
        if (!container) {
            throw new Error('no container');
        }
        container.appendChild(this.canvas);
        this.context = this.canvas.getContext('2d');
        this.context.imageSmoothingEnabled = false;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.addEventListener('mousedown', function (e) {
            _this.isDragging = true;
            _this.startX = e.clientX;
            _this.startY = e.clientY;
        });
        this.canvas.addEventListener('mousemove', function (e) {
            if (_this.isDragging) {
                var dx = e.clientX - _this.startX;
                var dy = e.clientY - _this.startY;
                _this.startX = e.clientX;
                _this.startY = e.clientY;
                _this.currentPosition.cx -=
                    (dx * _this.currentPosition.w) / _this.canvas.width;
                _this.currentPosition.cy -=
                    (dy * _this.currentPosition.w) / _this.canvas.width;
            }
        });
        this.canvas.addEventListener('mouseup', function (e) {
            _this.isDragging = false;
        });
        this.canvas.addEventListener('wheel', function (e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 1.1 : 0.9;
            _this.currentPosition.w *= delta;
        });
        this.spriteSheet = new Image();
        this.spriteSheet.src = 'assets/images/tile-map.png';
    };
    Graphics.prototype.drawRect = function (x, y, w, h, color) {
        this.context.strokeStyle = color;
        this.context.beginPath();
        var _a = this.resolvePoint(new Vector2(x, y)), screenX1 = _a.x, screenY1 = _a.y;
        var _b = this.resolvePoint(new Vector2(x + w, y + h)), screenX2 = _b.x, screenY2 = _b.y;
        this.context.rect(screenX1, screenY1, screenX2 - screenX1, screenY2 - screenY1);
        this.context.stroke();
    };
    Graphics.prototype.drawCircle = function (x, y, radius, color) {
        this.context.strokeStyle = color;
        this.context.beginPath();
        var _a = this.resolvePoint(new Vector2(x, y)), screenX1 = _a.x, screenY1 = _a.y;
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(screenX1, screenY1, this.resolveSize(radius), 0, 2 * Math.PI);
        this.context.fill();
    };
    Graphics.prototype.drawSprite = function (x, y, tileId, rotation) {
        var _a = this.resolvePoint(new Vector2(x, y)), screenX1 = _a.x, screenY1 = _a.y;
        var spriteX = this.spriteSize * (tileId % 16);
        var spriteY = this.spriteSize * (tileId - (tileId % 16));
        var size = this.resolveSize(this.spriteSize);
        this.context.save();
        this.context.translate(screenX1 + size / 2, screenY1 + size / 2);
        // this.context.translate(screenX1, screenY1)
        this.context.rotate((rotation * Math.PI) / 2);
        this.context.drawImage(this.spriteSheet, spriteX, spriteY, this.spriteSize, this.spriteSize, -size / 2 - 1, -size / 2 - 1, size + 2, size + 2);
        this.context.restore();
    };
    Graphics.prototype.resolveSize = function (x) {
        return (x * this.context.canvas.width) / this.currentPosition.w;
    };
    Graphics.prototype.resolvePoint = function (point) {
        var newx, newy;
        var ratio = this.context.canvas.width / this.context.canvas.height;
        newx =
            this.context.canvas.width / 2 +
                ((point.x - this.currentPosition.cx) / this.currentPosition.w) *
                    this.context.canvas.width;
        newy =
            this.context.canvas.width / ratio / 2 +
                ((point.y - this.currentPosition.cy) / this.currentPosition.w) *
                    this.context.canvas.width;
        return new Vector2(newx, newy);
    };
    Graphics.prototype.addDrawCallback = function (callback) {
        this.callbacks.push(callback);
    };
    Graphics.prototype.removeDrawCallback = function (callback) {
        var index = this.callbacks.findIndex(function (cb) { return cb === callback; });
        if (index != -1) {
            this.callbacks.splice(index, 1);
        }
    };
    Graphics.prototype.animate = function () {
        var _this = this;
        this.context.fillStyle = '#27323f';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.callbacks.forEach(function (callback) { return callback(_this.context); });
        requestAnimationFrame(function () { return _this.animate.call(_this); });
    };
    return Graphics;
}());
var graphics = new Graphics();

var _a$1;
var BorderType;
(function (BorderType) {
    BorderType["Void"] = "void";
    BorderType["Border"] = "border";
    BorderType["Green"] = "green";
})(BorderType || (BorderType = {}));
var BorderColors = (_a$1 = {},
    _a$1[BorderType.Void] = '#000000',
    _a$1[BorderType.Border] = '#0000FF',
    _a$1[BorderType.Green] = '#00FF00',
    _a$1);
var Directions;
(function (Directions) {
    Directions["top"] = "top";
    Directions["right"] = "right";
    Directions["bottom"] = "bottom";
    Directions["left"] = "left";
})(Directions || (Directions = {}));

var TileRenderer = /** @class */ (function () {
    function TileRenderer(graphics) {
        this.graphics = graphics;
        this.SIZE = 32;
    }
    TileRenderer.prototype.render = function (tilemap) {
        for (var i = 0; i < tilemap.tiles.length; ++i) {
            for (var j = 0; j < tilemap.tiles[i].length; ++j) {
                this.renderTileSprite(tilemap, i, j);
                // this.renderTileSimple(tilemap, i, j)
            }
        }
    };
    TileRenderer.prototype.renderTileSimple = function (tilemap, x, y) {
        var tile = tilemap.getTileAt(x, y);
        if (!tile) {
            return;
        }
        var centerX = (tile.x - tilemap.size / 2) * this.SIZE;
        var centerY = (tile.y - tilemap.size / 2) * this.SIZE;
        this.graphics.drawRect(centerX - this.SIZE / 2 + 2, centerY - this.SIZE / 2 + 2, this.SIZE - 4, this.SIZE - 4, '#EEEEEE');
        var template = tile.templates[0];
        if (template) {
            this.graphics.drawCircle(centerX, centerY - 10, 2, BorderColors[template[Directions.top]]);
            this.graphics.drawCircle(centerX + 10, centerY, 2, BorderColors[template[Directions.right]]);
            this.graphics.drawCircle(centerX, centerY + 10, 2, BorderColors[template[Directions.bottom]]);
            this.graphics.drawCircle(centerX - 10, centerY, 2, BorderColors[template[Directions.left]]);
        }
    };
    TileRenderer.prototype.renderTileSprite = function (tilemap, x, y) {
        var tile = tilemap.getTileAt(x, y);
        if (!tile) {
            return;
        }
        var centerX = (tile.x - tilemap.size / 2) * this.SIZE;
        var centerY = (tile.y - tilemap.size / 2) * this.SIZE;
        this.graphics.drawSprite(centerX - this.SIZE / 2, centerY - this.SIZE / 2, tile.templates[0].id, tile.templates[0].rotation);
    };
    return TileRenderer;
}());

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
var baseTemplates = [
    (_a = {},
        _a[Directions.top] = BorderType.Void,
        _a[Directions.right] = BorderType.Void,
        _a[Directions.bottom] = BorderType.Void,
        _a[Directions.left] = BorderType.Void,
        _a.id = 0,
        _a.weight = 4,
        _a),
    (_b = {},
        _b[Directions.top] = BorderType.Border,
        _b[Directions.right] = BorderType.Border,
        _b[Directions.bottom] = BorderType.Void,
        _b[Directions.left] = BorderType.Void,
        _b.id = 1,
        _b.weight = 4,
        _b),
    (_c = {},
        _c[Directions.top] = BorderType.Border,
        _c[Directions.right] = BorderType.Border,
        _c[Directions.bottom] = BorderType.Border,
        _c[Directions.left] = BorderType.Border,
        _c.id = 2,
        _c.weight = 8,
        _c),
    (_d = {},
        _d[Directions.top] = BorderType.Void,
        _d[Directions.right] = BorderType.Border,
        _d[Directions.bottom] = BorderType.Void,
        _d[Directions.left] = BorderType.Border,
        _d.id = 3,
        _d.weight = 4,
        _d),
    (_e = {},
        _e[Directions.top] = BorderType.Void,
        _e[Directions.right] = BorderType.Border,
        _e[Directions.bottom] = BorderType.Border,
        _e[Directions.left] = BorderType.Border,
        _e.id = 4,
        _e.weight = 1,
        _e),
    (_f = {},
        _f[Directions.top] = BorderType.Green,
        _f[Directions.right] = BorderType.Border,
        _f[Directions.bottom] = BorderType.Green,
        _f[Directions.left] = BorderType.Border,
        _f.id = 5,
        _f.weight = 16,
        _f),
    (_g = {},
        _g[Directions.top] = BorderType.Green,
        _g[Directions.right] = BorderType.Void,
        _g[Directions.bottom] = BorderType.Green,
        _g[Directions.left] = BorderType.Void,
        _g.id = 6,
        _g.weight = 1,
        _g),
    (_h = {},
        _h[Directions.top] = BorderType.Void,
        _h[Directions.right] = BorderType.Green,
        _h[Directions.bottom] = BorderType.Green,
        _h[Directions.left] = BorderType.Void,
        _h.id = 8,
        _h.weight = 1,
        _h),
    (_j = {},
        _j[Directions.top] = BorderType.Green,
        _j[Directions.right] = BorderType.Border,
        _j[Directions.bottom] = BorderType.Green,
        _j[Directions.left] = BorderType.Border,
        _j.id = 13,
        _j.weight = 16,
        _j),
    (_k = {},
        _k[Directions.top] = BorderType.Void,
        _k[Directions.right] = BorderType.Void,
        _k[Directions.bottom] = BorderType.Green,
        _k[Directions.left] = BorderType.Void,
        _k.id = 7,
        _k.weight = 1,
        _k),
    (_l = {},
        _l[Directions.top] = BorderType.Green,
        _l[Directions.right] = BorderType.Green,
        _l[Directions.bottom] = BorderType.Green,
        _l[Directions.left] = BorderType.Void,
        _l.id = 14,
        _l.weight = 4,
        _l),
    (_m = {},
        _m[Directions.top] = BorderType.Green,
        _m[Directions.right] = BorderType.Green,
        _m[Directions.bottom] = BorderType.Green,
        _m[Directions.left] = BorderType.Green,
        _m.id = 15,
        _m.weight = 1,
        _m),
    (_o = {},
        _o[Directions.top] = BorderType.Void,
        _o[Directions.right] = BorderType.Border,
        _o[Directions.bottom] = BorderType.Green,
        _o[Directions.left] = BorderType.Border,
        _o.id = 9,
        _o.weight = 1,
        _o),
];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function assertNonZero(variable) {
    if (variable === 0) {
        console.groupCollapsed();
        console.trace();
        console.groupEnd();
        debugger;
        throw 'Assertion failed';
    }
    return variable;
}

/**
 * Creates rotated copy of original template
 * populates rotation
 */
function rotateTemplate(template, ticks) {
    var _a, _b, _c;
    switch (ticks) {
        case 0:
            return __assign({}, template);
        case 1:
            return __assign(__assign({}, template), (_a = { rotation: 1 }, _a[Directions.top] = template[Directions.left], _a[Directions.right] = template[Directions.top], _a[Directions.bottom] = template[Directions.right], _a[Directions.left] = template[Directions.bottom], _a));
        case 2:
            return __assign(__assign({}, template), (_b = { rotation: 2 }, _b[Directions.top] = template[Directions.bottom], _b[Directions.right] = template[Directions.left], _b[Directions.bottom] = template[Directions.top], _b[Directions.left] = template[Directions.right], _b));
        case 3:
            return __assign(__assign({}, template), (_c = { rotation: 3 }, _c[Directions.top] = template[Directions.right], _c[Directions.right] = template[Directions.bottom], _c[Directions.bottom] = template[Directions.left], _c[Directions.left] = template[Directions.top], _c));
        default:
            throw 'rotateTemplate exception';
    }
}
function buildTemplateList() {
    var out = [];
    var enriched = baseTemplates.map(function (t) { return (__assign({ rotation: 0, weight: 1 }, t)); });
    enriched.forEach(function (t) {
        tryPushTemplate(out, rotateTemplate(t, 0));
        tryPushTemplate(out, rotateTemplate(t, 1));
        tryPushTemplate(out, rotateTemplate(t, 2));
        tryPushTemplate(out, rotateTemplate(t, 3));
    });
    return out;
}
function tryPushTemplate(out, t) {
    if (!!out.find(function (el) {
        return el[Directions.top] === t[Directions.top] &&
            el[Directions.right] === t[Directions.right] &&
            el[Directions.bottom] === t[Directions.bottom] &&
            el[Directions.left] === t[Directions.left] &&
            el.id === t.id;
    })) {
        return;
    }
    out.push(t);
}
var templates = buildTemplateList();
var Tilemap = /** @class */ (function () {
    function Tilemap(size) {
        if (size === void 0) { size = 5; }
        this.size = size;
        this.calls = 0;
        this.tiles = [];
        for (var i = 0; i < this.size; i++) {
            this.tiles[i] = [];
            for (var j = 0; j < this.size; j++) {
                this.tiles[i][j] = new Tile(i, j, this);
                if (i === 0 || j === 0 || i === size - 1 || j === size - 1) {
                    this.tiles[i][j].collapseTo(0);
                }
            }
        }
    }
    Tilemap.prototype.getTileAt = function (i, j) {
        if (i < 0 || i > this.size - 1 || j < 0 || j > this.size - 1) {
            return null;
        }
        return this.tiles[i][j];
    };
    Tilemap.prototype.getNextTile = function () {
        var min = Infinity;
        var tiles = [];
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                if (this.tiles[i][j]) {
                    if (this.tiles[i][j].enthropy === 1) {
                        continue;
                    }
                    if (this.tiles[i][j].enthropy < min) {
                        min = this.tiles[i][j].enthropy;
                        tiles = [this.tiles[i][j]];
                    }
                    if (this.tiles[i][j].enthropy === min) {
                        tiles.push(this.tiles[i][j]);
                    }
                }
            }
        }
        if (tiles.length < 1) {
            return null;
        }
        return randomElement(tiles);
    };
    Tilemap.prototype.checkTiles = function (self, other, direction) {
        var result;
        switch (direction) {
            case Directions.top:
                result = self[Directions.top] === other[Directions.bottom];
                break;
            case Directions.right:
                result = self[Directions.right] === other[Directions.left];
                break;
            case Directions.bottom:
                result = self[Directions.bottom] === other[Directions.top];
                break;
            case Directions.left:
                result = self[Directions.left] === other[Directions.right];
                break;
        }
        this.calls++;
        return result;
    };
    Tilemap.prototype.collapseTile = function (tile) {
        tile.collapse();
        var propagation = new Tilemap.PropagationProcess(this);
        propagation.start(tile.x, tile.y);
    };
    Tilemap.prototype.build = function () {
        var tile;
        while ((tile = this.getNextTile())) {
            this.collapseTile(tile);
        }
    };
    Tilemap.PropagationProcess = /** @class */ (function () {
        function class_1(tileMap) {
            this.tileMap = tileMap;
            this.q = [];
        }
        class_1.prototype.start = function (i, j) {
            this.pushToQ(i, j);
            var tile;
            var guard = 0;
            while ((tile = this.q.shift())) {
                if (guard++ > 200) {
                    throw 'Guard overflow';
                }
                this.propagate(tile.x, tile.y);
            }
        };
        class_1.prototype.propagate = function (x, y) {
            var self = this.tileMap.getTileAt(x, y);
            if (!self) {
                return;
            }
            this.filterTargetTemplates(self, this.tileMap.getTileAt(x, y - 1), Directions.top);
            this.filterTargetTemplates(self, this.tileMap.getTileAt(x + 1, y), Directions.right);
            this.filterTargetTemplates(self, this.tileMap.getTileAt(x, y + 1), Directions.bottom);
            this.filterTargetTemplates(self, this.tileMap.getTileAt(x - 1, y), Directions.left);
        };
        class_1.prototype.filterTargetTemplates = function (source, target, direction) {
            if (!target) {
                return;
            }
            var newTemplates = [];
            for (var _i = 0, _a = target.templates; _i < _a.length; _i++) {
                var targetTemplate = _a[_i];
                var result = false;
                for (var _b = 0, _c = source.templates; _b < _c.length; _b++) {
                    var sourceTemplate = _c[_b];
                    // at least one of source templates fits target template
                    // we keep that target template on source
                    result || (result = this.tileMap.checkTiles(sourceTemplate, targetTemplate, direction));
                }
                if (result) {
                    newTemplates.push(targetTemplate);
                }
            }
            // assertNonZero(newTemplates.length)
            if (target.templates.length !== newTemplates.length) {
                // further propagation required
                this.pushToQ(target.x, target.y - 1);
                this.pushToQ(target.x + 1, target.y);
                this.pushToQ(target.x, target.y + 1);
                this.pushToQ(target.x - 1, target.y);
            }
            target.replaceTemplates(newTemplates);
        };
        class_1.prototype.pushToQ = function (x, y) {
            var cell = this.tileMap.getTileAt(x, y);
            if (cell) {
                this.q.push(cell);
            }
        };
        return class_1;
    }());
    return Tilemap;
}());
var Tile = /** @class */ (function () {
    function Tile(x, y, tileMap) {
        this.x = x;
        this.y = y;
        this.tileMap = tileMap;
        this.templates = __spreadArray([], templates, true);
        this.enthropy = this.templates.length;
        this.dead = false;
    }
    Tile.prototype.getWeightedRandomTemplate = function () {
        assertNonZero(this.templates.length);
        var totalWeight = this.templates.reduce(function (acc, cur) { return acc + cur.weight; }, 0);
        var randomWeight = Math.random() * totalWeight;
        var weight = 0;
        for (var _i = 0, _a = this.templates; _i < _a.length; _i++) {
            var t = _a[_i];
            if (weight + t.weight > randomWeight) {
                return t;
            }
            weight += t.weight;
        }
        return this.templates[this.templates.length - 1];
    };
    Tile.prototype.collapse = function () {
        if (this.dead) {
            return;
        }
        __spreadArray([], this.templates, true);
        assertNonZero(this.templates.length);
        // const randomTemplate = randomElement<Template>(copy)
        var randomTemplate = this.getWeightedRandomTemplate();
        this.templates = [randomTemplate];
        this.enthropy = 1;
    };
    Tile.prototype.collapseTo = function (i) {
        if (this.dead) {
            return;
        }
        assertNonZero(this.templates.length);
        this.templates = [this.templates[0]];
        this.enthropy = 1;
    };
    Tile.prototype.die = function () {
        this.dead = true;
        this.tileMap.tiles[this.x][this.y] = null;
    };
    Tile.prototype.replaceTemplates = function (newTemplates) {
        this.templates = newTemplates;
        this.enthropy = this.templates.length;
        if (this.enthropy < 1) {
            this.die();
        }
    };
    return Tile;
}());

var generateButton = document.querySelector('#generate');
var callback = null;
function generate() {
    if (callback) {
        graphics.removeDrawCallback(callback);
    }
    var tileMap = new Tilemap(64);
    tileMap.build();
    var iterationsElement = document.querySelector('#iterations');
    iterationsElement.innerText = Number(tileMap.calls).toLocaleString();
    var tileRenderer = new TileRenderer(graphics);
    callback = function () {
        tileRenderer.render(tileMap);
    };
    graphics.addDrawCallback(callback);
}
window.addEventListener('load', function () {
    graphics.init();
    graphics.animate();
    generate();
});
generateButton.addEventListener('click', function () { return generate(); });
//# sourceMappingURL=bundle.js.map

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdHMvbWF0aHMudHMiLCJzcmMvdHMvY2FudmFzL2dyYXBoaWNzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90eXBlcy50cyIsInNyYy90cy9jYW52YXMvdGlsZS1yZW5kZXJlci50cyIsIm5vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL2RhdGEvdGVtcGxhdGUtc2V0LTIudHMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3V0aWxzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwLnRzIiwic3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBWZWN0b3IyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLCBwdWJsaWMgeTogbnVtYmVyID0gMCkge31cblxuXHRwdWJsaWMgY2xvbmUoKTogVmVjdG9yMiB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KVxuXHR9XG5cblx0cHVibGljIG11bHRpcGx5U2NhbGFyKHZhbHVlOiBudW1iZXIpOiBWZWN0b3IyIHtcblx0XHR0aGlzLnggKj0gdmFsdWVcblx0XHR0aGlzLnkgKj0gdmFsdWVcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIGFkZChvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCArPSBvdGhlci54XG5cdFx0dGhpcy55ICs9IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHN1YihvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCAtPSBvdGhlci54XG5cdFx0dGhpcy55IC09IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHJvdGF0ZUFyb3VuZFplcm8oYW5nbGU6IG51bWJlcik6IFZlY3RvcjIge1xuXHRcdGNvbnN0IHsgeCwgeSB9ID0gdGhpc1xuXHRcdHRoaXMueCA9IHggKiBNYXRoLmNvcyhhbmdsZSkgLSB5ICogTWF0aC5zaW4oYW5nbGUpXG5cdFx0dGhpcy55ID0geCAqIE1hdGguc2luKGFuZ2xlKSArIHkgKiBNYXRoLmNvcyhhbmdsZSlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG59XG4iLCJpbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSAnLi4vbWF0aHMnXG5cbnR5cGUgQ2FudmFzUG9zaXRpb24gPSB7XG5cdGN4OiBudW1iZXJcblx0Y3k6IG51bWJlclxuXHR3OiBudW1iZXJcbn1cblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2sgPSAoY29udGV4dD86IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgR3JhcGhpY3Mge1xuXHRjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkRcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuXHRjYWxsYmFja3M6IENhbGxiYWNrW10gPSBbXVxuXG5cdHByaXZhdGUgY3VycmVudFBvc2l0aW9uOiBDYW52YXNQb3NpdGlvbiA9IHsgY3g6IDAsIGN5OiAwLCB3OiAxMDI0IH1cblx0aXNEcmFnZ2luZyA9IGZhbHNlXG5cdHN0YXJ0WDogbnVtYmVyID0gMFxuXHRzdGFydFk6IG51bWJlciA9IDBcblxuXHRwcml2YXRlIHNwcml0ZVNoZWV0OiBhbnlcblx0cHJpdmF0ZSBzcHJpdGVTaXplID0gMzJcblxuXHRwdWJsaWMgaW5pdCgpIHtcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG5cdFx0Y29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpXG5cdFx0aWYgKCFjb250YWluZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignbm8gY29udGFpbmVyJylcblx0XHR9XG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKVxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcblx0XHR0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcblxuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlXG5cdFx0XHR0aGlzLnN0YXJ0WCA9IGUuY2xpZW50WFxuXHRcdFx0dGhpcy5zdGFydFkgPSBlLmNsaWVudFlcblx0XHR9KVxuXG5cdFx0dGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcblx0XHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdFx0Y29uc3QgZHggPSBlLmNsaWVudFggLSB0aGlzLnN0YXJ0WFxuXHRcdFx0XHRjb25zdCBkeSA9IGUuY2xpZW50WSAtIHRoaXMuc3RhcnRZXG5cdFx0XHRcdHRoaXMuc3RhcnRYID0gZS5jbGllbnRYXG5cdFx0XHRcdHRoaXMuc3RhcnRZID0gZS5jbGllbnRZXG5cblx0XHRcdFx0dGhpcy5jdXJyZW50UG9zaXRpb24uY3ggLT1cblx0XHRcdFx0XHQoZHggKiB0aGlzLmN1cnJlbnRQb3NpdGlvbi53KSAvIHRoaXMuY2FudmFzLndpZHRoXG5cdFx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uLmN5IC09XG5cdFx0XHRcdFx0KGR5ICogdGhpcy5jdXJyZW50UG9zaXRpb24udykgLyB0aGlzLmNhbnZhcy53aWR0aFxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHR0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlXG5cdFx0fSlcblxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0Y29uc3QgZGVsdGEgPSBlLmRlbHRhWSA+IDAgPyAxLjEgOiAwLjlcblx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uLncgKj0gZGVsdGFcblx0XHR9KVxuXG5cdFx0dGhpcy5zcHJpdGVTaGVldCA9IG5ldyBJbWFnZSgpXG5cdFx0dGhpcy5zcHJpdGVTaGVldC5zcmMgPSAnYXNzZXRzL2ltYWdlcy90aWxlLW1hcC5wbmcnXG5cdH1cblxuXHRwdWJsaWMgZHJhd1JlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHc6IG51bWJlciwgaDogbnVtYmVyLCBjb2xvcjogc3RyaW5nKSB7XG5cdFx0dGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3Jcblx0XHR0aGlzLmNvbnRleHQuYmVnaW5QYXRoKClcblxuXHRcdGNvbnN0IHsgeDogc2NyZWVuWDEsIHk6IHNjcmVlblkxIH0gPSB0aGlzLnJlc29sdmVQb2ludChuZXcgVmVjdG9yMih4LCB5KSlcblx0XHRjb25zdCB7IHg6IHNjcmVlblgyLCB5OiBzY3JlZW5ZMiB9ID0gdGhpcy5yZXNvbHZlUG9pbnQoXG5cdFx0XHRuZXcgVmVjdG9yMih4ICsgdywgeSArIGgpXG5cdFx0KVxuXG5cdFx0dGhpcy5jb250ZXh0LnJlY3QoXG5cdFx0XHRzY3JlZW5YMSxcblx0XHRcdHNjcmVlblkxLFxuXHRcdFx0c2NyZWVuWDIgLSBzY3JlZW5YMSxcblx0XHRcdHNjcmVlblkyIC0gc2NyZWVuWTFcblx0XHQpXG5cdFx0dGhpcy5jb250ZXh0LnN0cm9rZSgpXG5cdH1cblxuXHRwdWJsaWMgZHJhd0NpcmNsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIGNvbG9yOiBzdHJpbmcpIHtcblx0XHR0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvclxuXHRcdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKVxuXG5cdFx0Y29uc3QgeyB4OiBzY3JlZW5YMSwgeTogc2NyZWVuWTEgfSA9IHRoaXMucmVzb2x2ZVBvaW50KG5ldyBWZWN0b3IyKHgsIHkpKVxuXG5cdFx0dGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yXG5cdFx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpXG5cdFx0dGhpcy5jb250ZXh0LmFyYyhcblx0XHRcdHNjcmVlblgxLFxuXHRcdFx0c2NyZWVuWTEsXG5cdFx0XHR0aGlzLnJlc29sdmVTaXplKHJhZGl1cyksXG5cdFx0XHQwLFxuXHRcdFx0MiAqIE1hdGguUElcblx0XHQpXG5cdFx0dGhpcy5jb250ZXh0LmZpbGwoKVxuXHR9XG5cblx0cHVibGljIGRyYXdTcHJpdGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHRpbGVJZDogbnVtYmVyLCByb3RhdGlvbjogbnVtYmVyKSB7XG5cdFx0Y29uc3QgeyB4OiBzY3JlZW5YMSwgeTogc2NyZWVuWTEgfSA9IHRoaXMucmVzb2x2ZVBvaW50KG5ldyBWZWN0b3IyKHgsIHkpKVxuXG5cdFx0Y29uc3Qgc3ByaXRlWCA9IHRoaXMuc3ByaXRlU2l6ZSAqICh0aWxlSWQgJSAxNilcblx0XHRjb25zdCBzcHJpdGVZID0gdGhpcy5zcHJpdGVTaXplICogKHRpbGVJZCAtICh0aWxlSWQgJSAxNikpXG5cblx0XHRjb25zdCBzaXplID0gdGhpcy5yZXNvbHZlU2l6ZSh0aGlzLnNwcml0ZVNpemUpXG5cblx0XHR0aGlzLmNvbnRleHQuc2F2ZSgpXG5cblx0XHR0aGlzLmNvbnRleHQudHJhbnNsYXRlKHNjcmVlblgxICsgc2l6ZSAvIDIsIHNjcmVlblkxICsgc2l6ZSAvIDIpXG5cdFx0Ly8gdGhpcy5jb250ZXh0LnRyYW5zbGF0ZShzY3JlZW5YMSwgc2NyZWVuWTEpXG5cdFx0dGhpcy5jb250ZXh0LnJvdGF0ZSgocm90YXRpb24gKiBNYXRoLlBJKSAvIDIpXG5cblx0XHR0aGlzLmNvbnRleHQuZHJhd0ltYWdlKFxuXHRcdFx0dGhpcy5zcHJpdGVTaGVldCxcblx0XHRcdHNwcml0ZVgsXG5cdFx0XHRzcHJpdGVZLFxuXHRcdFx0dGhpcy5zcHJpdGVTaXplLFxuXHRcdFx0dGhpcy5zcHJpdGVTaXplLFxuXHRcdFx0LXNpemUgLyAyIC0gMSxcblx0XHRcdC1zaXplIC8gMiAtIDEsXG5cdFx0XHRzaXplICsgMixcblx0XHRcdHNpemUgKyAyXG5cdFx0KVxuXG5cdFx0dGhpcy5jb250ZXh0LnJlc3RvcmUoKVxuXHR9XG5cblx0cHVibGljIHJlc29sdmVTaXplKHg6IG51bWJlcikge1xuXHRcdHJldHVybiAoeCAqIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGgpIC8gdGhpcy5jdXJyZW50UG9zaXRpb24ud1xuXHR9XG5cblx0cHVibGljIHJlc29sdmVQb2ludChwb2ludDogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdGxldCBuZXd4OiBudW1iZXIsIG5ld3k6IG51bWJlclxuXHRcdGNvbnN0IHJhdGlvID0gdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCAvIHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0XG5cblx0XHRuZXd4ID1cblx0XHRcdHRoaXMuY29udGV4dC5jYW52YXMud2lkdGggLyAyICtcblx0XHRcdCgocG9pbnQueCAtIHRoaXMuY3VycmVudFBvc2l0aW9uLmN4KSAvIHRoaXMuY3VycmVudFBvc2l0aW9uLncpICpcblx0XHRcdFx0dGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aFxuXHRcdG5ld3kgPVxuXHRcdFx0dGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCAvIHJhdGlvIC8gMiArXG5cdFx0XHQoKHBvaW50LnkgLSB0aGlzLmN1cnJlbnRQb3NpdGlvbi5jeSkgLyB0aGlzLmN1cnJlbnRQb3NpdGlvbi53KSAqXG5cdFx0XHRcdHRoaXMuY29udGV4dC5jYW52YXMud2lkdGhcblxuXHRcdHJldHVybiBuZXcgVmVjdG9yMihuZXd4LCBuZXd5KVxuXHR9XG5cblx0cHVibGljIGFkZERyYXdDYWxsYmFjayhjYWxsYmFjazogQ2FsbGJhY2spIHtcblx0XHR0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKVxuXHR9XG5cblx0cHVibGljIHJlbW92ZURyYXdDYWxsYmFjayhjYWxsYmFjazogQ2FsbGJhY2spIHtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmZpbmRJbmRleCgoY2IpID0+IGNiID09PSBjYWxsYmFjaylcblx0XHRpZiAoaW5kZXggIT0gLTEpIHtcblx0XHRcdHRoaXMuY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSlcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgYW5pbWF0ZSgpIHtcblx0XHR0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gJyMyNzMyM2YnXG5cdFx0dGhpcy5jb250ZXh0LmZpbGxSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpXG5cdFx0dGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKHRoaXMuY29udGV4dCkpXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuYW5pbWF0ZS5jYWxsKHRoaXMpKVxuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBncmFwaGljcyA9IG5ldyBHcmFwaGljcygpXG4iLCJleHBvcnQgZW51bSBCb3JkZXJUeXBlIHtcblx0Vm9pZCA9ICd2b2lkJyxcblx0Qm9yZGVyID0gJ2JvcmRlcicsXG5cdEdyZWVuID0gJ2dyZWVuJyxcbn1cblxuZXhwb3J0IGNvbnN0IEJvcmRlckNvbG9ycyA9IHtcblx0W0JvcmRlclR5cGUuVm9pZF06ICcjMDAwMDAwJyxcblx0W0JvcmRlclR5cGUuQm9yZGVyXTogJyMwMDAwRkYnLFxuXHRbQm9yZGVyVHlwZS5HcmVlbl06ICcjMDBGRjAwJyxcbn1cblxuZXhwb3J0IGVudW0gRGlyZWN0aW9ucyB7XG5cdHRvcCA9ICd0b3AnLFxuXHRyaWdodCA9ICdyaWdodCcsXG5cdGJvdHRvbSA9ICdib3R0b20nLFxuXHRsZWZ0ID0gJ2xlZnQnLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlIHtcblx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZVxuXHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGVcblx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZVxuXHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZVxuXHRpZDogbnVtYmVyXG5cdHdlaWdodDogbnVtYmVyXG5cdHJvdGF0aW9uOiBudW1iZXJcbn1cbiIsImltcG9ydCB7IFRpbGVtYXAgfSBmcm9tICcuLi9nZW5lcmF0b3JzL3dhdmUtZnVuY3Rpb24tY29sbGFwc2UvdGlsZW1hcCdcclxuaW1wb3J0IHsgQm9yZGVyQ29sb3JzLCBEaXJlY3Rpb25zIH0gZnJvbSAnLi4vZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3R5cGVzJ1xyXG5pbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4vZ3JhcGhpY3MnXHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZVJlbmRlcmVyIHtcclxuXHRwcml2YXRlIFNJWkUgPSAzMlxyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIGdyYXBoaWNzOiBHcmFwaGljcykge31cclxuXHJcblx0cHVibGljIHJlbmRlcih0aWxlbWFwOiBUaWxlbWFwKSB7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRpbGVtYXAudGlsZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aWxlbWFwLnRpbGVzW2ldLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0dGhpcy5yZW5kZXJUaWxlU3ByaXRlKHRpbGVtYXAsIGksIGopXHJcblx0XHRcdFx0Ly8gdGhpcy5yZW5kZXJUaWxlU2ltcGxlKHRpbGVtYXAsIGksIGopXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVyVGlsZVNpbXBsZSh0aWxlbWFwOiBUaWxlbWFwLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG5cdFx0Y29uc3QgdGlsZSA9IHRpbGVtYXAuZ2V0VGlsZUF0KHgsIHkpXHJcblxyXG5cdFx0aWYgKCF0aWxlKSB7XHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGNlbnRlclggPSAodGlsZS54IC0gdGlsZW1hcC5zaXplIC8gMikgKiB0aGlzLlNJWkVcclxuXHRcdGNvbnN0IGNlbnRlclkgPSAodGlsZS55IC0gdGlsZW1hcC5zaXplIC8gMikgKiB0aGlzLlNJWkVcclxuXHJcblx0XHR0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KFxyXG5cdFx0XHRjZW50ZXJYIC0gdGhpcy5TSVpFIC8gMiArIDIsXHJcblx0XHRcdGNlbnRlclkgLSB0aGlzLlNJWkUgLyAyICsgMixcclxuXHRcdFx0dGhpcy5TSVpFIC0gNCxcclxuXHRcdFx0dGhpcy5TSVpFIC0gNCxcclxuXHRcdFx0JyNFRUVFRUUnXHJcblx0XHQpXHJcblxyXG5cdFx0Y29uc3QgdGVtcGxhdGUgPSB0aWxlLnRlbXBsYXRlc1swXVxyXG5cdFx0aWYgKHRlbXBsYXRlKSB7XHJcblx0XHRcdHRoaXMuZ3JhcGhpY3MuZHJhd0NpcmNsZShjZW50ZXJYLCBjZW50ZXJZIC0gMTAsIDIsIEJvcmRlckNvbG9yc1t0ZW1wbGF0ZVtEaXJlY3Rpb25zLnRvcF1dKVxyXG5cdFx0XHR0aGlzLmdyYXBoaWNzLmRyYXdDaXJjbGUoY2VudGVyWCArIDEwLCBjZW50ZXJZLCAyLCBCb3JkZXJDb2xvcnNbdGVtcGxhdGVbRGlyZWN0aW9ucy5yaWdodF1dKVxyXG5cdFx0XHR0aGlzLmdyYXBoaWNzLmRyYXdDaXJjbGUoY2VudGVyWCwgY2VudGVyWSArIDEwLCAyLCBCb3JkZXJDb2xvcnNbdGVtcGxhdGVbRGlyZWN0aW9ucy5ib3R0b21dXSlcclxuXHRcdFx0dGhpcy5ncmFwaGljcy5kcmF3Q2lyY2xlKGNlbnRlclggLSAxMCwgY2VudGVyWSwgMiwgQm9yZGVyQ29sb3JzW3RlbXBsYXRlW0RpcmVjdGlvbnMubGVmdF1dKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJUaWxlU3ByaXRlKHRpbGVtYXA6IFRpbGVtYXAsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcblx0XHRjb25zdCB0aWxlID0gdGlsZW1hcC5nZXRUaWxlQXQoeCwgeSlcclxuXHJcblx0XHRpZiAoIXRpbGUpIHtcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2VudGVyWCA9ICh0aWxlLnggLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cdFx0Y29uc3QgY2VudGVyWSA9ICh0aWxlLnkgLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cclxuXHRcdHRoaXMuZ3JhcGhpY3MuZHJhd1Nwcml0ZShcclxuXHRcdFx0Y2VudGVyWCAtIHRoaXMuU0laRSAvIDIsXHJcblx0XHRcdGNlbnRlclkgLSB0aGlzLlNJWkUgLyAyLFxyXG5cdFx0XHR0aWxlLnRlbXBsYXRlc1swXS5pZCxcclxuXHRcdFx0dGlsZS50ZW1wbGF0ZXNbMF0ucm90YXRpb25cclxuXHRcdClcclxuXHR9XHJcbn1cclxuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2VzRGVjb3JhdGUoY3RvciwgZGVzY3JpcHRvckluLCBkZWNvcmF0b3JzLCBjb250ZXh0SW4sIGluaXRpYWxpemVycywgZXh0cmFJbml0aWFsaXplcnMpIHtcclxuICAgIGZ1bmN0aW9uIGFjY2VwdChmKSB7IGlmIChmICE9PSB2b2lkIDAgJiYgdHlwZW9mIGYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZ1bmN0aW9uIGV4cGVjdGVkXCIpOyByZXR1cm4gZjsgfVxyXG4gICAgdmFyIGtpbmQgPSBjb250ZXh0SW4ua2luZCwga2V5ID0ga2luZCA9PT0gXCJnZXR0ZXJcIiA/IFwiZ2V0XCIgOiBraW5kID09PSBcInNldHRlclwiID8gXCJzZXRcIiA6IFwidmFsdWVcIjtcclxuICAgIHZhciB0YXJnZXQgPSAhZGVzY3JpcHRvckluICYmIGN0b3IgPyBjb250ZXh0SW5bXCJzdGF0aWNcIl0gPyBjdG9yIDogY3Rvci5wcm90b3R5cGUgOiBudWxsO1xyXG4gICAgdmFyIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9ySW4gfHwgKHRhcmdldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSkgOiB7fSk7XHJcbiAgICB2YXIgXywgZG9uZSA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gY29udGV4dEluKSBjb250ZXh0W3BdID0gcCA9PT0gXCJhY2Nlc3NcIiA/IHt9IDogY29udGV4dEluW3BdO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gY29udGV4dEluLmFjY2VzcykgY29udGV4dC5hY2Nlc3NbcF0gPSBjb250ZXh0SW4uYWNjZXNzW3BdO1xyXG4gICAgICAgIGNvbnRleHQuYWRkSW5pdGlhbGl6ZXIgPSBmdW5jdGlvbiAoZikgeyBpZiAoZG9uZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBhZGQgaW5pdGlhbGl6ZXJzIGFmdGVyIGRlY29yYXRpb24gaGFzIGNvbXBsZXRlZFwiKTsgZXh0cmFJbml0aWFsaXplcnMucHVzaChhY2NlcHQoZiB8fCBudWxsKSk7IH07XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9ICgwLCBkZWNvcmF0b3JzW2ldKShraW5kID09PSBcImFjY2Vzc29yXCIgPyB7IGdldDogZGVzY3JpcHRvci5nZXQsIHNldDogZGVzY3JpcHRvci5zZXQgfSA6IGRlc2NyaXB0b3Jba2V5XSwgY29udGV4dCk7XHJcbiAgICAgICAgaWYgKGtpbmQgPT09IFwiYWNjZXNzb3JcIikge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB2b2lkIDApIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgZXhwZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5nZXQpKSBkZXNjcmlwdG9yLmdldCA9IF87XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5zZXQpKSBkZXNjcmlwdG9yLnNldCA9IF87XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5pbml0KSkgaW5pdGlhbGl6ZXJzLnVuc2hpZnQoXyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKF8gPSBhY2NlcHQocmVzdWx0KSkge1xyXG4gICAgICAgICAgICBpZiAoa2luZCA9PT0gXCJmaWVsZFwiKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICAgICAgZWxzZSBkZXNjcmlwdG9yW2tleV0gPSBfO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh0YXJnZXQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGNvbnRleHRJbi5uYW1lLCBkZXNjcmlwdG9yKTtcclxuICAgIGRvbmUgPSB0cnVlO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcnVuSW5pdGlhbGl6ZXJzKHRoaXNBcmcsIGluaXRpYWxpemVycywgdmFsdWUpIHtcclxuICAgIHZhciB1c2VWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbml0aWFsaXplcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YWx1ZSA9IHVzZVZhbHVlID8gaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZywgdmFsdWUpIDogaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXNlVmFsdWUgPyB2YWx1ZSA6IHZvaWQgMDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Byb3BLZXkoeCkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN5bWJvbFwiID8geCA6IFwiXCIuY29uY2F0KHgpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc2V0RnVuY3Rpb25OYW1lKGYsIG5hbWUsIHByZWZpeCkge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN5bWJvbFwiKSBuYW1lID0gbmFtZS5kZXNjcmlwdGlvbiA/IFwiW1wiLmNvbmNhdChuYW1lLmRlc2NyaXB0aW9uLCBcIl1cIikgOiBcIlwiO1xyXG4gICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmLCBcIm5hbWVcIiwgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBwcmVmaXggPyBcIlwiLmNvbmNhdChwcmVmaXgsIFwiIFwiLCBuYW1lKSA6IG5hbWUgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBmYWxzZSB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRJbihzdGF0ZSwgcmVjZWl2ZXIpIHtcclxuICAgIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgX19leHRlbmRzLFxyXG4gICAgX19hc3NpZ24sXHJcbiAgICBfX3Jlc3QsXHJcbiAgICBfX2RlY29yYXRlLFxyXG4gICAgX19wYXJhbSxcclxuICAgIF9fbWV0YWRhdGEsXHJcbiAgICBfX2F3YWl0ZXIsXHJcbiAgICBfX2dlbmVyYXRvcixcclxuICAgIF9fY3JlYXRlQmluZGluZyxcclxuICAgIF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzLFxyXG4gICAgX19yZWFkLFxyXG4gICAgX19zcHJlYWQsXHJcbiAgICBfX3NwcmVhZEFycmF5cyxcclxuICAgIF9fc3ByZWFkQXJyYXksXHJcbiAgICBfX2F3YWl0LFxyXG4gICAgX19hc3luY0dlbmVyYXRvcixcclxuICAgIF9fYXN5bmNEZWxlZ2F0b3IsXHJcbiAgICBfX2FzeW5jVmFsdWVzLFxyXG4gICAgX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXIsXHJcbiAgICBfX2ltcG9ydERlZmF1bHQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZFNldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxufTtcclxuIiwiaW1wb3J0IHsgQm9yZGVyVHlwZSwgRGlyZWN0aW9ucywgVGVtcGxhdGUgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGJhc2VUZW1wbGF0ZXM6IFBhcnRpYWw8VGVtcGxhdGU+W10gPSBbXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDAsXG5cdFx0d2VpZ2h0OiA0LFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRpZDogMSxcblx0XHR3ZWlnaHQ6IDQsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogMixcblx0XHR3ZWlnaHQ6IDgsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiAzLFxuXHRcdHdlaWdodDogNCxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogNCxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0aWQ6IDUsXG5cdFx0d2VpZ2h0OiAxNixcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiA2LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiA4LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogMTMsXG5cdFx0d2VpZ2h0OiAxNixcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDcsXG5cdFx0d2VpZ2h0OiAxLFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiAxNCxcblx0XHR3ZWlnaHQ6IDQsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdGlkOiAxNSxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogOSxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5dXG4iLCJleHBvcnQgZnVuY3Rpb24gcmFuZG9tRWxlbWVudDxUPihhcnI6IEFycmF5PFQ+KSB7XG5cdHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRFbXB0eTxUPih2YXJpYWJsZTogVCB8IG51bGwgfCB1bmRlZmluZWQpOiBUIHtcblx0aWYgKCF2YXJpYWJsZSkgdGhyb3cgJ0Fzc2VydGlvbiBmYWlsZWQnXG5cdHJldHVybiB2YXJpYWJsZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9uWmVybyh2YXJpYWJsZTogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKHZhcmlhYmxlID09PSAwKSB7XG5cdFx0Y29uc29sZS5ncm91cENvbGxhcHNlZCgpXG5cdFx0Y29uc29sZS50cmFjZSgpXG5cdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0ZGVidWdnZXJcblx0XHR0aHJvdyAnQXNzZXJ0aW9uIGZhaWxlZCdcblx0fVxuXHRyZXR1cm4gdmFyaWFibGVcbn1cbiIsImltcG9ydCB7IGJhc2VUZW1wbGF0ZXMgfSBmcm9tICcuL2RhdGEvdGVtcGxhdGUtc2V0LTInXG5pbXBvcnQgeyBEaXJlY3Rpb25zLCBUZW1wbGF0ZSB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBhc3NlcnROb25aZXJvLCByYW5kb21FbGVtZW50IH0gZnJvbSAnLi91dGlscydcblxuLyoqXG4gKiBDcmVhdGVzIHJvdGF0ZWQgY29weSBvZiBvcmlnaW5hbCB0ZW1wbGF0ZVxuICogcG9wdWxhdGVzIHJvdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHJvdGF0ZVRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSwgdGlja3M6IG51bWJlcik6IFRlbXBsYXRlIHtcblx0c3dpdGNoICh0aWNrcykge1xuXHRcdGNhc2UgMDpcblx0XHRcdHJldHVybiB7IC4uLnRlbXBsYXRlIH1cblx0XHRjYXNlIDE6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDEsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMubGVmdF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogdGVtcGxhdGVbRGlyZWN0aW9ucy50b3BdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnJpZ2h0XSxcblx0XHRcdFx0W0RpcmVjdGlvbnMubGVmdF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdH1cblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDIsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdFx0W0RpcmVjdGlvbnMucmlnaHRdOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLmxlZnRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnRvcF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLmxlZnRdOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnJpZ2h0XSxcblx0XHRcdH1cblx0XHRjYXNlIDM6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDMsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMucmlnaHRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5yaWdodF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogdGVtcGxhdGVbRGlyZWN0aW9ucy5sZWZ0XSxcblx0XHRcdFx0W0RpcmVjdGlvbnMubGVmdF06IHRlbXBsYXRlW0RpcmVjdGlvbnMudG9wXSxcblx0XHRcdH1cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgJ3JvdGF0ZVRlbXBsYXRlIGV4Y2VwdGlvbidcblx0fVxufVxuXG5mdW5jdGlvbiBidWlsZFRlbXBsYXRlTGlzdCgpOiBUZW1wbGF0ZVtdIHtcblx0Y29uc3Qgb3V0OiBUZW1wbGF0ZVtdID0gW11cblxuXHRjb25zdCBlbnJpY2hlZDogVGVtcGxhdGVbXSA9IGJhc2VUZW1wbGF0ZXMubWFwKFxuXHRcdCh0KTogVGVtcGxhdGUgPT4gKHsgcm90YXRpb246IDAsIHdlaWdodDogMSwgLi4udCB9IGFzIFRlbXBsYXRlKVxuXHQpXG5cblx0ZW5yaWNoZWQuZm9yRWFjaCgodCkgPT4ge1xuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDApKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDEpKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDIpKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDMpKVxuXHR9KVxuXHRyZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHRyeVB1c2hUZW1wbGF0ZShvdXQ6IFRlbXBsYXRlW10sIHQ6IFRlbXBsYXRlKSB7XG5cdGlmIChcblx0XHQhIW91dC5maW5kKFxuXHRcdFx0KGVsKSA9PlxuXHRcdFx0XHRlbFtEaXJlY3Rpb25zLnRvcF0gPT09IHRbRGlyZWN0aW9ucy50b3BdICYmXG5cdFx0XHRcdGVsW0RpcmVjdGlvbnMucmlnaHRdID09PSB0W0RpcmVjdGlvbnMucmlnaHRdICYmXG5cdFx0XHRcdGVsW0RpcmVjdGlvbnMuYm90dG9tXSA9PT0gdFtEaXJlY3Rpb25zLmJvdHRvbV0gJiZcblx0XHRcdFx0ZWxbRGlyZWN0aW9ucy5sZWZ0XSA9PT0gdFtEaXJlY3Rpb25zLmxlZnRdICYmXG5cdFx0XHRcdGVsLmlkID09PSB0LmlkXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm5cblx0fVxuXHRvdXQucHVzaCh0KVxufVxuXG5jb25zdCB0ZW1wbGF0ZXM6IFRlbXBsYXRlW10gPSBidWlsZFRlbXBsYXRlTGlzdCgpXG5cbmV4cG9ydCBjbGFzcyBUaWxlbWFwIHtcblx0cHVibGljIGNhbGxzID0gMFxuXG5cdHB1YmxpYyB0aWxlczogKFRpbGUgfCBudWxsKVtdW10gPSBbXVxuXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgc2l6ZTogbnVtYmVyID0gNSkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyBpKyspIHtcblx0XHRcdHRoaXMudGlsZXNbaV0gPSBbXVxuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnNpemU7IGorKykge1xuXHRcdFx0XHR0aGlzLnRpbGVzW2ldW2pdID0gbmV3IFRpbGUoaSwgaiwgdGhpcylcblx0XHRcdFx0aWYgKGkgPT09IDAgfHwgaiA9PT0gMCB8fCBpID09PSBzaXplIC0gMSB8fCBqID09PSBzaXplIC0gMSkge1xuXHRcdFx0XHRcdHRoaXMudGlsZXNbaV1bal0uY29sbGFwc2VUbygwKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIFByb3BhZ2F0aW9uUHJvY2VzcyA9IGNsYXNzIHtcblx0XHRwcml2YXRlIHE6IFRpbGVbXSA9IFtdXG5cblx0XHRwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSB0aWxlTWFwOiBUaWxlbWFwKSB7fVxuXG5cdFx0cHVibGljIHN0YXJ0KGk6IG51bWJlciwgajogbnVtYmVyKSB7XG5cdFx0XHR0aGlzLnB1c2hUb1EoaSwgailcblx0XHRcdGxldCB0aWxlOiBUaWxlXG5cdFx0XHRsZXQgZ3VhcmQgPSAwXG5cdFx0XHR3aGlsZSAoKHRpbGUgPSB0aGlzLnEuc2hpZnQoKSkpIHtcblx0XHRcdFx0aWYgKGd1YXJkKysgPiAyMDApIHtcblx0XHRcdFx0XHR0aHJvdyAnR3VhcmQgb3ZlcmZsb3cnXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wcm9wYWdhdGUodGlsZS54LCB0aWxlLnkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBwcm9wYWdhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkpXG5cdFx0XHRpZiAoIXNlbGYpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZmlsdGVyVGFyZ2V0VGVtcGxhdGVzKFxuXHRcdFx0XHRzZWxmLFxuXHRcdFx0XHR0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkgLSAxKSxcblx0XHRcdFx0RGlyZWN0aW9ucy50b3Bcblx0XHRcdClcblx0XHRcdHRoaXMuZmlsdGVyVGFyZ2V0VGVtcGxhdGVzKFxuXHRcdFx0XHRzZWxmLFxuXHRcdFx0XHR0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHggKyAxLCB5KSxcblx0XHRcdFx0RGlyZWN0aW9ucy5yaWdodFxuXHRcdFx0KVxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCwgeSArIDEpLFxuXHRcdFx0XHREaXJlY3Rpb25zLmJvdHRvbVxuXHRcdFx0KVxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCAtIDEsIHkpLFxuXHRcdFx0XHREaXJlY3Rpb25zLmxlZnRcblx0XHRcdClcblx0XHR9XG5cblx0XHRwcml2YXRlIGZpbHRlclRhcmdldFRlbXBsYXRlcyhcblx0XHRcdHNvdXJjZTogVGlsZSxcblx0XHRcdHRhcmdldDogVGlsZSB8IG51bGwsXG5cdFx0XHRkaXJlY3Rpb246IERpcmVjdGlvbnNcblx0XHQpIHtcblx0XHRcdGlmICghdGFyZ2V0KSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbmV3VGVtcGxhdGVzOiBUZW1wbGF0ZVtdID0gW11cblxuXHRcdFx0Zm9yIChsZXQgdGFyZ2V0VGVtcGxhdGUgb2YgdGFyZ2V0LnRlbXBsYXRlcykge1xuXHRcdFx0XHRsZXQgcmVzdWx0ID0gZmFsc2Vcblx0XHRcdFx0Zm9yIChsZXQgc291cmNlVGVtcGxhdGUgb2Ygc291cmNlLnRlbXBsYXRlcykge1xuXHRcdFx0XHRcdC8vIGF0IGxlYXN0IG9uZSBvZiBzb3VyY2UgdGVtcGxhdGVzIGZpdHMgdGFyZ2V0IHRlbXBsYXRlXG5cdFx0XHRcdFx0Ly8gd2Uga2VlcCB0aGF0IHRhcmdldCB0ZW1wbGF0ZSBvbiBzb3VyY2Vcblx0XHRcdFx0XHRyZXN1bHQgfHw9IHRoaXMudGlsZU1hcC5jaGVja1RpbGVzKFxuXHRcdFx0XHRcdFx0c291cmNlVGVtcGxhdGUsXG5cdFx0XHRcdFx0XHR0YXJnZXRUZW1wbGF0ZSxcblx0XHRcdFx0XHRcdGRpcmVjdGlvblxuXHRcdFx0XHRcdClcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFx0bmV3VGVtcGxhdGVzLnB1c2godGFyZ2V0VGVtcGxhdGUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGFzc2VydE5vblplcm8obmV3VGVtcGxhdGVzLmxlbmd0aClcblxuXHRcdFx0aWYgKHRhcmdldC50ZW1wbGF0ZXMubGVuZ3RoICE9PSBuZXdUZW1wbGF0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGZ1cnRoZXIgcHJvcGFnYXRpb24gcmVxdWlyZWRcblx0XHRcdFx0dGhpcy5wdXNoVG9RKHRhcmdldC54LCB0YXJnZXQueSAtIDEpXG5cdFx0XHRcdHRoaXMucHVzaFRvUSh0YXJnZXQueCArIDEsIHRhcmdldC55KVxuXHRcdFx0XHR0aGlzLnB1c2hUb1EodGFyZ2V0LngsIHRhcmdldC55ICsgMSlcblx0XHRcdFx0dGhpcy5wdXNoVG9RKHRhcmdldC54IC0gMSwgdGFyZ2V0LnkpXG5cdFx0XHR9XG5cblx0XHRcdHRhcmdldC5yZXBsYWNlVGVtcGxhdGVzKG5ld1RlbXBsYXRlcylcblx0XHR9XG5cblx0XHRwcml2YXRlIHB1c2hUb1EoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcblx0XHRcdGNvbnN0IGNlbGwgPSB0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkpXG5cdFx0XHRpZiAoY2VsbCkge1xuXHRcdFx0XHR0aGlzLnEucHVzaChjZWxsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnZXRUaWxlQXQoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBUaWxlIHwgbnVsbCB7XG5cdFx0aWYgKGkgPCAwIHx8IGkgPiB0aGlzLnNpemUgLSAxIHx8IGogPCAwIHx8IGogPiB0aGlzLnNpemUgLSAxKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy50aWxlc1tpXVtqXVxuXHR9XG5cblx0cHJpdmF0ZSBnZXROZXh0VGlsZSgpOiBUaWxlIHwgbnVsbCB7XG5cdFx0bGV0IG1pbjogbnVtYmVyID0gSW5maW5pdHlcblx0XHRsZXQgdGlsZXM6IFRpbGVbXSA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKykge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnNpemU7IGorKykge1xuXHRcdFx0XHRpZiAodGhpcy50aWxlc1tpXVtqXSkge1xuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVzW2ldW2pdLmVudGhyb3B5ID09PSAxKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy50aWxlc1tpXVtqXS5lbnRocm9weSA8IG1pbikge1xuXHRcdFx0XHRcdFx0bWluID0gdGhpcy50aWxlc1tpXVtqXS5lbnRocm9weVxuXHRcdFx0XHRcdFx0dGlsZXMgPSBbdGhpcy50aWxlc1tpXVtqXV1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRoaXMudGlsZXNbaV1bal0uZW50aHJvcHkgPT09IG1pbikge1xuXHRcdFx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLnRpbGVzW2ldW2pdKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGlsZXMubGVuZ3RoIDwgMSkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRyZXR1cm4gcmFuZG9tRWxlbWVudDxUaWxlPih0aWxlcylcblx0fVxuXG5cdHB1YmxpYyBjaGVja1RpbGVzKFxuXHRcdHNlbGY6IFRlbXBsYXRlLFxuXHRcdG90aGVyOiBUZW1wbGF0ZSxcblx0XHRkaXJlY3Rpb246IERpcmVjdGlvbnNcblx0KTogYm9vbGVhbiB7XG5cdFx0bGV0IHJlc3VsdDogYm9vbGVhblxuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlIERpcmVjdGlvbnMudG9wOlxuXHRcdFx0XHRyZXN1bHQgPSBzZWxmW0RpcmVjdGlvbnMudG9wXSA9PT0gb3RoZXJbRGlyZWN0aW9ucy5ib3R0b21dXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIERpcmVjdGlvbnMucmlnaHQ6XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy5yaWdodF0gPT09IG90aGVyW0RpcmVjdGlvbnMubGVmdF1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy5ib3R0b206XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy5ib3R0b21dID09PSBvdGhlcltEaXJlY3Rpb25zLnRvcF1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy5sZWZ0OlxuXHRcdFx0XHRyZXN1bHQgPSBzZWxmW0RpcmVjdGlvbnMubGVmdF0gPT09IG90aGVyW0RpcmVjdGlvbnMucmlnaHRdXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdHRoaXMuY2FsbHMrK1xuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdHByaXZhdGUgY29sbGFwc2VUaWxlKHRpbGU6IFRpbGUpIHtcblx0XHR0aWxlLmNvbGxhcHNlKClcblx0XHRjb25zdCBwcm9wYWdhdGlvbiA9IG5ldyBUaWxlbWFwLlByb3BhZ2F0aW9uUHJvY2Vzcyh0aGlzKVxuXHRcdHByb3BhZ2F0aW9uLnN0YXJ0KHRpbGUueCwgdGlsZS55KVxuXHR9XG5cblx0cHVibGljIGJ1aWxkKCkge1xuXHRcdGxldCB0aWxlOiBUaWxlXG5cdFx0d2hpbGUgKCh0aWxlID0gdGhpcy5nZXROZXh0VGlsZSgpKSkge1xuXHRcdFx0dGhpcy5jb2xsYXBzZVRpbGUodGlsZSlcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRwdWJsaWMgdGVtcGxhdGVzOiBUZW1wbGF0ZVtdID0gWy4uLnRlbXBsYXRlc11cblx0cHVibGljIGVudGhyb3B5OiBudW1iZXIgPSB0aGlzLnRlbXBsYXRlcy5sZW5ndGhcblx0cHVibGljIGRlYWQgPSBmYWxzZVxuXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgeDogbnVtYmVyLFxuXHRcdHB1YmxpYyB5OiBudW1iZXIsXG5cdFx0cHJpdmF0ZSB0aWxlTWFwOiBUaWxlbWFwXG5cdCkge31cblxuXHRwcml2YXRlIGdldFdlaWdodGVkUmFuZG9tVGVtcGxhdGUoKTogVGVtcGxhdGUge1xuXHRcdGFzc2VydE5vblplcm8odGhpcy50ZW1wbGF0ZXMubGVuZ3RoKVxuXHRcdGNvbnN0IHRvdGFsV2VpZ2h0ID0gdGhpcy50ZW1wbGF0ZXMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyLndlaWdodCwgMClcblx0XHRjb25zdCByYW5kb21XZWlnaHQgPSBNYXRoLnJhbmRvbSgpICogdG90YWxXZWlnaHRcblx0XHRsZXQgd2VpZ2h0ID0gMFxuXHRcdGZvciAobGV0IHQgb2YgdGhpcy50ZW1wbGF0ZXMpIHtcblx0XHRcdGlmICh3ZWlnaHQgKyB0LndlaWdodCA+IHJhbmRvbVdlaWdodCkge1xuXHRcdFx0XHRyZXR1cm4gdFxuXHRcdFx0fVxuXHRcdFx0d2VpZ2h0ICs9IHQud2VpZ2h0XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnRlbXBsYXRlc1t0aGlzLnRlbXBsYXRlcy5sZW5ndGggLSAxXVxuXHR9XG5cblx0cHVibGljIGNvbGxhcHNlKCkge1xuXHRcdGlmICh0aGlzLmRlYWQpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRjb25zdCBjb3B5ID0gWy4uLnRoaXMudGVtcGxhdGVzXVxuXHRcdGFzc2VydE5vblplcm8odGhpcy50ZW1wbGF0ZXMubGVuZ3RoKVxuXHRcdC8vIGNvbnN0IHJhbmRvbVRlbXBsYXRlID0gcmFuZG9tRWxlbWVudDxUZW1wbGF0ZT4oY29weSlcblx0XHRjb25zdCByYW5kb21UZW1wbGF0ZSA9IHRoaXMuZ2V0V2VpZ2h0ZWRSYW5kb21UZW1wbGF0ZSgpXG5cdFx0dGhpcy50ZW1wbGF0ZXMgPSBbcmFuZG9tVGVtcGxhdGVdXG5cdFx0dGhpcy5lbnRocm9weSA9IDFcblx0fVxuXG5cdHB1YmxpYyBjb2xsYXBzZVRvKGk6IG51bWJlcikge1xuXHRcdGlmICh0aGlzLmRlYWQpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRhc3NlcnROb25aZXJvKHRoaXMudGVtcGxhdGVzLmxlbmd0aClcblx0XHR0aGlzLnRlbXBsYXRlcyA9IFt0aGlzLnRlbXBsYXRlc1swXV1cblx0XHR0aGlzLmVudGhyb3B5ID0gMVxuXHR9XG5cblx0cHJpdmF0ZSBkaWUoKSB7XG5cdFx0dGhpcy5kZWFkID0gdHJ1ZVxuXHRcdHRoaXMudGlsZU1hcC50aWxlc1t0aGlzLnhdW3RoaXMueV0gPSBudWxsXG5cdH1cblxuXHRwdWJsaWMgcmVwbGFjZVRlbXBsYXRlcyhuZXdUZW1wbGF0ZXM6IFRlbXBsYXRlW10pIHtcblx0XHR0aGlzLnRlbXBsYXRlcyA9IG5ld1RlbXBsYXRlc1xuXHRcdHRoaXMuZW50aHJvcHkgPSB0aGlzLnRlbXBsYXRlcy5sZW5ndGhcblx0XHRpZiAodGhpcy5lbnRocm9weSA8IDEpIHtcblx0XHRcdHRoaXMuZGllKClcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7IENhbGxiYWNrLCBncmFwaGljcyB9IGZyb20gJy4vY2FudmFzL2dyYXBoaWNzJ1xuaW1wb3J0IHsgVGlsZVJlbmRlcmVyIH0gZnJvbSAnLi9jYW52YXMvdGlsZS1yZW5kZXJlcidcbmltcG9ydCB7IFRpbGVtYXAgfSBmcm9tICcuL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwJ1xuXG5jb25zdCBnZW5lcmF0ZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KCcjZ2VuZXJhdGUnKVxubGV0IGNhbGxiYWNrOiBDYWxsYmFjayB8IG51bGwgPSBudWxsXG5cbmZ1bmN0aW9uIGdlbmVyYXRlKCkge1xuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRncmFwaGljcy5yZW1vdmVEcmF3Q2FsbGJhY2soY2FsbGJhY2spXG5cdH1cblxuXHRjb25zdCB0aWxlTWFwID0gbmV3IFRpbGVtYXAoNjQpXG5cdHRpbGVNYXAuYnVpbGQoKVxuXG5cdGNvbnN0IGl0ZXJhdGlvbnNFbGVtZW50ID1cblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PignI2l0ZXJhdGlvbnMnKVxuXHRpdGVyYXRpb25zRWxlbWVudC5pbm5lclRleHQgPSBOdW1iZXIodGlsZU1hcC5jYWxscykudG9Mb2NhbGVTdHJpbmcoKVxuXG5cdGNvbnN0IHRpbGVSZW5kZXJlciA9IG5ldyBUaWxlUmVuZGVyZXIoZ3JhcGhpY3MpXG5cdGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuXHRcdHRpbGVSZW5kZXJlci5yZW5kZXIodGlsZU1hcClcblx0fVxuXHRncmFwaGljcy5hZGREcmF3Q2FsbGJhY2soY2FsbGJhY2spXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuXHRncmFwaGljcy5pbml0KClcblx0Z3JhcGhpY3MuYW5pbWF0ZSgpXG5cdGdlbmVyYXRlKClcbn0pXG5cbmdlbmVyYXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZ2VuZXJhdGUoKSlcbiJdLCJuYW1lcyI6WyJfYSJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFBLE9BQUEsa0JBQUEsWUFBQTtJQUNDLFNBQTBCLE9BQUEsQ0FBQSxDQUFhLEVBQVMsQ0FBYSxFQUFBO0FBQW5DLFFBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFhLEdBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBUyxRQUFBLElBQUEsQ0FBQSxLQUFBLEtBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBYSxHQUFBLENBQUEsQ0FBQSxFQUFBO1FBQW5DLElBQUMsQ0FBQSxDQUFBLEdBQUQsQ0FBQyxDQUFZO1FBQVMsSUFBQyxDQUFBLENBQUEsR0FBRCxDQUFDLENBQVk7S0FBSTtBQUUxRCxJQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsS0FBSyxHQUFaLFlBQUE7UUFDQyxPQUFPLElB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RyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDcEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ2xDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNuQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3RDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDcEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ2pDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDdEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNsQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxFQUFFOzs7QUFHVixRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDbEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ2pDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ2xDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNsQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsRUFBRTtBQUNOLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxFQUFFOzs7QUFHVixRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ2xDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxFQUFFO0FBQ04sUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNsQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDcEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNuQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsRUFBRTtBQUNOLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDcEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7Q0FFVjs7QUMzR0ssU0FBVSxhQUFhLENBQUksR0FBYSxFQUFBO0FBQzdDLElBQUEsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDbkQsQ0FBQztBQU9LLFNBQVUsYUFBYSxDQUFDLFFBQWdCLEVBQUE7SUFDN0MsSUFBSSxRQUFRLEtBQUssQ0FBQyxFQUFFO1FBQ25CLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQTtRQUN4QixPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDZixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDbEIsUUFBQSxTQUFRO0FBQ1IsUUFBQSxNQUFNLGtCQUFrQixDQUFBO0FBQ3hCLEtBQUE7QUFDRCxJQUFBLE9BQU8sUUFBUSxDQUFBO0FBQ2hCOztBQ2RBOzs7QUFHRztBQUNILFNBQVMsY0FBYyxDQUFDLFFBQWtCLEVBQUUsS0FBYSxFQUFBOztBQUN4RCxJQUFBLFFBQVEsS0FBSztBQUNaLFFBQUEsS0FBSyxDQUFDO0FBQ0wsWUFBQSxPQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQVksUUFBUSxDQUFFLENBQUE7QUFDdkIsUUFBQSxLQUFLLENBQUM7WUFDTCxPQUNJLFFBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLFFBQVEsV0FDWCxRQUFRLEVBQUUsQ0FBQyxFQUNWLEVBQUEsRUFBQSxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFBLEVBQUEsQ0FDMUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQzNDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUM5QyxFQUFBLENBQUEsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQzlDLEVBQUEsRUFBQSxDQUFBO0FBQ0YsUUFBQSxLQUFLLENBQUM7WUFDTCxPQUNJLFFBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLFFBQVEsV0FDWCxRQUFRLEVBQUUsQ0FBQyxFQUNWLEVBQUEsRUFBQSxDQUFBLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFBLEVBQUEsQ0FDNUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQzVDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUM1QyxFQUFBLENBQUEsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQzdDLEVBQUEsRUFBQSxDQUFBO0FBQ0YsUUFBQSxLQUFLLENBQUM7WUFDTCxPQUNJLFFBQUEsQ0FBQSxRQUFBLENBQUEsRUFBQSxFQUFBLFFBQVEsV0FDWCxRQUFRLEVBQUUsQ0FBQyxFQUNW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
