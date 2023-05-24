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
        this.spriteSheet.src = './assets/images/tile-map.png';
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdHMvbWF0aHMudHMiLCJzcmMvdHMvY2FudmFzL2dyYXBoaWNzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90eXBlcy50cyIsInNyYy90cy9jYW52YXMvdGlsZS1yZW5kZXJlci50cyIsIm5vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL2RhdGEvdGVtcGxhdGUtc2V0LTIudHMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3V0aWxzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwLnRzIiwic3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBWZWN0b3IyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLCBwdWJsaWMgeTogbnVtYmVyID0gMCkge31cblxuXHRwdWJsaWMgY2xvbmUoKTogVmVjdG9yMiB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KVxuXHR9XG5cblx0cHVibGljIG11bHRpcGx5U2NhbGFyKHZhbHVlOiBudW1iZXIpOiBWZWN0b3IyIHtcblx0XHR0aGlzLnggKj0gdmFsdWVcblx0XHR0aGlzLnkgKj0gdmFsdWVcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIGFkZChvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCArPSBvdGhlci54XG5cdFx0dGhpcy55ICs9IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHN1YihvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCAtPSBvdGhlci54XG5cdFx0dGhpcy55IC09IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHJvdGF0ZUFyb3VuZFplcm8oYW5nbGU6IG51bWJlcik6IFZlY3RvcjIge1xuXHRcdGNvbnN0IHsgeCwgeSB9ID0gdGhpc1xuXHRcdHRoaXMueCA9IHggKiBNYXRoLmNvcyhhbmdsZSkgLSB5ICogTWF0aC5zaW4oYW5nbGUpXG5cdFx0dGhpcy55ID0geCAqIE1hdGguc2luKGFuZ2xlKSArIHkgKiBNYXRoLmNvcyhhbmdsZSlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG59XG4iLCJpbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSAnLi4vbWF0aHMnXG5cbnR5cGUgQ2FudmFzUG9zaXRpb24gPSB7XG5cdGN4OiBudW1iZXJcblx0Y3k6IG51bWJlclxuXHR3OiBudW1iZXJcbn1cblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2sgPSAoY29udGV4dD86IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgR3JhcGhpY3Mge1xuXHRjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkRcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxuXHRjYWxsYmFja3M6IENhbGxiYWNrW10gPSBbXVxuXG5cdHByaXZhdGUgY3VycmVudFBvc2l0aW9uOiBDYW52YXNQb3NpdGlvbiA9IHsgY3g6IDAsIGN5OiAwLCB3OiAxMDI0IH1cblx0aXNEcmFnZ2luZyA9IGZhbHNlXG5cdHN0YXJ0WDogbnVtYmVyID0gMFxuXHRzdGFydFk6IG51bWJlciA9IDBcblxuXHRwcml2YXRlIHNwcml0ZVNoZWV0OiBhbnlcblx0cHJpdmF0ZSBzcHJpdGVTaXplID0gMzJcblxuXHRwdWJsaWMgaW5pdCgpIHtcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG5cdFx0Y29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhaW5lcicpXG5cdFx0aWYgKCFjb250YWluZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignbm8gY29udGFpbmVyJylcblx0XHR9XG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKVxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcblx0XHR0aGlzLmNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2VcblxuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcblx0XHR0aGlzLmNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlXG5cdFx0XHR0aGlzLnN0YXJ0WCA9IGUuY2xpZW50WFxuXHRcdFx0dGhpcy5zdGFydFkgPSBlLmNsaWVudFlcblx0XHR9KVxuXG5cdFx0dGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcblx0XHRcdGlmICh0aGlzLmlzRHJhZ2dpbmcpIHtcblx0XHRcdFx0Y29uc3QgZHggPSBlLmNsaWVudFggLSB0aGlzLnN0YXJ0WFxuXHRcdFx0XHRjb25zdCBkeSA9IGUuY2xpZW50WSAtIHRoaXMuc3RhcnRZXG5cdFx0XHRcdHRoaXMuc3RhcnRYID0gZS5jbGllbnRYXG5cdFx0XHRcdHRoaXMuc3RhcnRZID0gZS5jbGllbnRZXG5cblx0XHRcdFx0dGhpcy5jdXJyZW50UG9zaXRpb24uY3ggLT1cblx0XHRcdFx0XHQoZHggKiB0aGlzLmN1cnJlbnRQb3NpdGlvbi53KSAvIHRoaXMuY2FudmFzLndpZHRoXG5cdFx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uLmN5IC09XG5cdFx0XHRcdFx0KGR5ICogdGhpcy5jdXJyZW50UG9zaXRpb24udykgLyB0aGlzLmNhbnZhcy53aWR0aFxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHR0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGUpID0+IHtcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlXG5cdFx0fSlcblxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgKGUpID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0Y29uc3QgZGVsdGEgPSBlLmRlbHRhWSA+IDAgPyAxLjEgOiAwLjlcblx0XHRcdHRoaXMuY3VycmVudFBvc2l0aW9uLncgKj0gZGVsdGFcblx0XHR9KVxuXG5cdFx0dGhpcy5zcHJpdGVTaGVldCA9IG5ldyBJbWFnZSgpXG5cdFx0dGhpcy5zcHJpdGVTaGVldC5zcmMgPSAnLi9hc3NldHMvaW1hZ2VzL3RpbGUtbWFwLnBuZydcblx0fVxuXG5cdHB1YmxpYyBkcmF3UmVjdCh4OiBudW1iZXIsIHk6IG51bWJlciwgdzogbnVtYmVyLCBoOiBudW1iZXIsIGNvbG9yOiBzdHJpbmcpIHtcblx0XHR0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvclxuXHRcdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKVxuXG5cdFx0Y29uc3QgeyB4OiBzY3JlZW5YMSwgeTogc2NyZWVuWTEgfSA9IHRoaXMucmVzb2x2ZVBvaW50KG5ldyBWZWN0b3IyKHgsIHkpKVxuXHRcdGNvbnN0IHsgeDogc2NyZWVuWDIsIHk6IHNjcmVlblkyIH0gPSB0aGlzLnJlc29sdmVQb2ludChcblx0XHRcdG5ldyBWZWN0b3IyKHggKyB3LCB5ICsgaClcblx0XHQpXG5cblx0XHR0aGlzLmNvbnRleHQucmVjdChcblx0XHRcdHNjcmVlblgxLFxuXHRcdFx0c2NyZWVuWTEsXG5cdFx0XHRzY3JlZW5YMiAtIHNjcmVlblgxLFxuXHRcdFx0c2NyZWVuWTIgLSBzY3JlZW5ZMVxuXHRcdClcblx0XHR0aGlzLmNvbnRleHQuc3Ryb2tlKClcblx0fVxuXG5cdHB1YmxpYyBkcmF3Q2lyY2xlKHg6IG51bWJlciwgeTogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgY29sb3I6IHN0cmluZykge1xuXHRcdHRoaXMuY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yXG5cdFx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpXG5cblx0XHRjb25zdCB7IHg6IHNjcmVlblgxLCB5OiBzY3JlZW5ZMSB9ID0gdGhpcy5yZXNvbHZlUG9pbnQobmV3IFZlY3RvcjIoeCwgeSkpXG5cblx0XHR0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gY29sb3Jcblx0XHR0aGlzLmNvbnRleHQuYmVnaW5QYXRoKClcblx0XHR0aGlzLmNvbnRleHQuYXJjKFxuXHRcdFx0c2NyZWVuWDEsXG5cdFx0XHRzY3JlZW5ZMSxcblx0XHRcdHRoaXMucmVzb2x2ZVNpemUocmFkaXVzKSxcblx0XHRcdDAsXG5cdFx0XHQyICogTWF0aC5QSVxuXHRcdClcblx0XHR0aGlzLmNvbnRleHQuZmlsbCgpXG5cdH1cblxuXHRwdWJsaWMgZHJhd1Nwcml0ZSh4OiBudW1iZXIsIHk6IG51bWJlciwgdGlsZUlkOiBudW1iZXIsIHJvdGF0aW9uOiBudW1iZXIpIHtcblx0XHRjb25zdCB7IHg6IHNjcmVlblgxLCB5OiBzY3JlZW5ZMSB9ID0gdGhpcy5yZXNvbHZlUG9pbnQobmV3IFZlY3RvcjIoeCwgeSkpXG5cblx0XHRjb25zdCBzcHJpdGVYID0gdGhpcy5zcHJpdGVTaXplICogKHRpbGVJZCAlIDE2KVxuXHRcdGNvbnN0IHNwcml0ZVkgPSB0aGlzLnNwcml0ZVNpemUgKiAodGlsZUlkIC0gKHRpbGVJZCAlIDE2KSlcblxuXHRcdGNvbnN0IHNpemUgPSB0aGlzLnJlc29sdmVTaXplKHRoaXMuc3ByaXRlU2l6ZSlcblxuXHRcdHRoaXMuY29udGV4dC5zYXZlKClcblxuXHRcdHRoaXMuY29udGV4dC50cmFuc2xhdGUoc2NyZWVuWDEgKyBzaXplIC8gMiwgc2NyZWVuWTEgKyBzaXplIC8gMilcblx0XHQvLyB0aGlzLmNvbnRleHQudHJhbnNsYXRlKHNjcmVlblgxLCBzY3JlZW5ZMSlcblx0XHR0aGlzLmNvbnRleHQucm90YXRlKChyb3RhdGlvbiAqIE1hdGguUEkpIC8gMilcblxuXHRcdHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoXG5cdFx0XHR0aGlzLnNwcml0ZVNoZWV0LFxuXHRcdFx0c3ByaXRlWCxcblx0XHRcdHNwcml0ZVksXG5cdFx0XHR0aGlzLnNwcml0ZVNpemUsXG5cdFx0XHR0aGlzLnNwcml0ZVNpemUsXG5cdFx0XHQtc2l6ZSAvIDIgLSAxLFxuXHRcdFx0LXNpemUgLyAyIC0gMSxcblx0XHRcdHNpemUgKyAyLFxuXHRcdFx0c2l6ZSArIDJcblx0XHQpXG5cblx0XHR0aGlzLmNvbnRleHQucmVzdG9yZSgpXG5cdH1cblxuXHRwdWJsaWMgcmVzb2x2ZVNpemUoeDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuICh4ICogdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCkgLyB0aGlzLmN1cnJlbnRQb3NpdGlvbi53XG5cdH1cblxuXHRwdWJsaWMgcmVzb2x2ZVBvaW50KHBvaW50OiBWZWN0b3IyKTogVmVjdG9yMiB7XG5cdFx0bGV0IG5ld3g6IG51bWJlciwgbmV3eTogbnVtYmVyXG5cdFx0Y29uc3QgcmF0aW8gPSB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoIC8gdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHRcblxuXHRcdG5ld3ggPVxuXHRcdFx0dGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCAvIDIgK1xuXHRcdFx0KChwb2ludC54IC0gdGhpcy5jdXJyZW50UG9zaXRpb24uY3gpIC8gdGhpcy5jdXJyZW50UG9zaXRpb24udykgKlxuXHRcdFx0XHR0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoXG5cdFx0bmV3eSA9XG5cdFx0XHR0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoIC8gcmF0aW8gLyAyICtcblx0XHRcdCgocG9pbnQueSAtIHRoaXMuY3VycmVudFBvc2l0aW9uLmN5KSAvIHRoaXMuY3VycmVudFBvc2l0aW9uLncpICpcblx0XHRcdFx0dGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aFxuXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyKG5ld3gsIG5ld3kpXG5cdH1cblxuXHRwdWJsaWMgYWRkRHJhd0NhbGxiYWNrKGNhbGxiYWNrOiBDYWxsYmFjaykge1xuXHRcdHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spXG5cdH1cblxuXHRwdWJsaWMgcmVtb3ZlRHJhd0NhbGxiYWNrKGNhbGxiYWNrOiBDYWxsYmFjaykge1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5jYWxsYmFja3MuZmluZEluZGV4KChjYikgPT4gY2IgPT09IGNhbGxiYWNrKVxuXHRcdGlmIChpbmRleCAhPSAtMSkge1xuXHRcdFx0dGhpcy5jYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhbmltYXRlKCkge1xuXHRcdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnIzI3MzIzZidcblx0XHR0aGlzLmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodClcblx0XHR0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2sodGhpcy5jb250ZXh0KSlcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hbmltYXRlLmNhbGwodGhpcykpXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGdyYXBoaWNzID0gbmV3IEdyYXBoaWNzKClcbiIsImV4cG9ydCBlbnVtIEJvcmRlclR5cGUge1xuXHRWb2lkID0gJ3ZvaWQnLFxuXHRCb3JkZXIgPSAnYm9yZGVyJyxcblx0R3JlZW4gPSAnZ3JlZW4nLFxufVxuXG5leHBvcnQgY29uc3QgQm9yZGVyQ29sb3JzID0ge1xuXHRbQm9yZGVyVHlwZS5Wb2lkXTogJyMwMDAwMDAnLFxuXHRbQm9yZGVyVHlwZS5Cb3JkZXJdOiAnIzAwMDBGRicsXG5cdFtCb3JkZXJUeXBlLkdyZWVuXTogJyMwMEZGMDAnLFxufVxuXG5leHBvcnQgZW51bSBEaXJlY3Rpb25zIHtcblx0dG9wID0gJ3RvcCcsXG5cdHJpZ2h0ID0gJ3JpZ2h0Jyxcblx0Ym90dG9tID0gJ2JvdHRvbScsXG5cdGxlZnQgPSAnbGVmdCcsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVtcGxhdGUge1xuXHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlXG5cdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZVxuXHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlXG5cdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlXG5cdGlkOiBudW1iZXJcblx0d2VpZ2h0OiBudW1iZXJcblx0cm90YXRpb246IG51bWJlclxufVxuIiwiaW1wb3J0IHsgVGlsZW1hcCB9IGZyb20gJy4uL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwJ1xyXG5pbXBvcnQgeyBCb3JkZXJDb2xvcnMsIERpcmVjdGlvbnMgfSBmcm9tICcuLi9nZW5lcmF0b3JzL3dhdmUtZnVuY3Rpb24tY29sbGFwc2UvdHlwZXMnXHJcbmltcG9ydCB7IEdyYXBoaWNzIH0gZnJvbSAnLi9ncmFwaGljcydcclxuXHJcbmV4cG9ydCBjbGFzcyBUaWxlUmVuZGVyZXIge1xyXG5cdHByaXZhdGUgU0laRSA9IDMyXHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZ3JhcGhpY3M6IEdyYXBoaWNzKSB7fVxyXG5cclxuXHRwdWJsaWMgcmVuZGVyKHRpbGVtYXA6IFRpbGVtYXApIHtcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGlsZW1hcC50aWxlcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHRpbGVtYXAudGlsZXNbaV0ubGVuZ3RoOyArK2opIHtcclxuXHRcdFx0XHR0aGlzLnJlbmRlclRpbGVTcHJpdGUodGlsZW1hcCwgaSwgailcclxuXHRcdFx0XHQvLyB0aGlzLnJlbmRlclRpbGVTaW1wbGUodGlsZW1hcCwgaSwgailcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJUaWxlU2ltcGxlKHRpbGVtYXA6IFRpbGVtYXAsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcblx0XHRjb25zdCB0aWxlID0gdGlsZW1hcC5nZXRUaWxlQXQoeCwgeSlcclxuXHJcblx0XHRpZiAoIXRpbGUpIHtcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2VudGVyWCA9ICh0aWxlLnggLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cdFx0Y29uc3QgY2VudGVyWSA9ICh0aWxlLnkgLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cclxuXHRcdHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoXHJcblx0XHRcdGNlbnRlclggLSB0aGlzLlNJWkUgLyAyICsgMixcclxuXHRcdFx0Y2VudGVyWSAtIHRoaXMuU0laRSAvIDIgKyAyLFxyXG5cdFx0XHR0aGlzLlNJWkUgLSA0LFxyXG5cdFx0XHR0aGlzLlNJWkUgLSA0LFxyXG5cdFx0XHQnI0VFRUVFRSdcclxuXHRcdClcclxuXHJcblx0XHRjb25zdCB0ZW1wbGF0ZSA9IHRpbGUudGVtcGxhdGVzWzBdXHJcblx0XHRpZiAodGVtcGxhdGUpIHtcclxuXHRcdFx0dGhpcy5ncmFwaGljcy5kcmF3Q2lyY2xlKGNlbnRlclgsIGNlbnRlclkgLSAxMCwgMiwgQm9yZGVyQ29sb3JzW3RlbXBsYXRlW0RpcmVjdGlvbnMudG9wXV0pXHJcblx0XHRcdHRoaXMuZ3JhcGhpY3MuZHJhd0NpcmNsZShjZW50ZXJYICsgMTAsIGNlbnRlclksIDIsIEJvcmRlckNvbG9yc1t0ZW1wbGF0ZVtEaXJlY3Rpb25zLnJpZ2h0XV0pXHJcblx0XHRcdHRoaXMuZ3JhcGhpY3MuZHJhd0NpcmNsZShjZW50ZXJYLCBjZW50ZXJZICsgMTAsIDIsIEJvcmRlckNvbG9yc1t0ZW1wbGF0ZVtEaXJlY3Rpb25zLmJvdHRvbV1dKVxyXG5cdFx0XHR0aGlzLmdyYXBoaWNzLmRyYXdDaXJjbGUoY2VudGVyWCAtIDEwLCBjZW50ZXJZLCAyLCBCb3JkZXJDb2xvcnNbdGVtcGxhdGVbRGlyZWN0aW9ucy5sZWZ0XV0pXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHJlbmRlclRpbGVTcHJpdGUodGlsZW1hcDogVGlsZW1hcCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuXHRcdGNvbnN0IHRpbGUgPSB0aWxlbWFwLmdldFRpbGVBdCh4LCB5KVxyXG5cclxuXHRcdGlmICghdGlsZSkge1xyXG5cdFx0XHRyZXR1cm5cclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBjZW50ZXJYID0gKHRpbGUueCAtIHRpbGVtYXAuc2l6ZSAvIDIpICogdGhpcy5TSVpFXHJcblx0XHRjb25zdCBjZW50ZXJZID0gKHRpbGUueSAtIHRpbGVtYXAuc2l6ZSAvIDIpICogdGhpcy5TSVpFXHJcblxyXG5cdFx0dGhpcy5ncmFwaGljcy5kcmF3U3ByaXRlKFxyXG5cdFx0XHRjZW50ZXJYIC0gdGhpcy5TSVpFIC8gMixcclxuXHRcdFx0Y2VudGVyWSAtIHRoaXMuU0laRSAvIDIsXHJcblx0XHRcdHRpbGUudGVtcGxhdGVzWzBdLmlkLFxyXG5cdFx0XHR0aWxlLnRlbXBsYXRlc1swXS5yb3RhdGlvblxyXG5cdFx0KVxyXG5cdH1cclxufVxyXG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcclxuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XHJcbiAgICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEluKHN0YXRlLCByZWNlaXZlcikge1xyXG4gICAgaWYgKHJlY2VpdmVyID09PSBudWxsIHx8ICh0eXBlb2YgcmVjZWl2ZXIgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlY2VpdmVyICE9PSBcImZ1bmN0aW9uXCIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSAnaW4nIG9wZXJhdG9yIG9uIG5vbi1vYmplY3RcIik7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciA9PT0gc3RhdGUgOiBzdGF0ZS5oYXMocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHMsXHJcbiAgICBfX2Fzc2lnbixcclxuICAgIF9fcmVzdCxcclxuICAgIF9fZGVjb3JhdGUsXHJcbiAgICBfX3BhcmFtLFxyXG4gICAgX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcixcclxuICAgIF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nLFxyXG4gICAgX19leHBvcnRTdGFyLFxyXG4gICAgX192YWx1ZXMsXHJcbiAgICBfX3JlYWQsXHJcbiAgICBfX3NwcmVhZCxcclxuICAgIF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdCxcclxuICAgIF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRHZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEluLFxyXG59O1xyXG4iLCJpbXBvcnQgeyBCb3JkZXJUeXBlLCBEaXJlY3Rpb25zLCBUZW1wbGF0ZSB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgYmFzZVRlbXBsYXRlczogUGFydGlhbDxUZW1wbGF0ZT5bXSA9IFtcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRpZDogMCxcblx0XHR3ZWlnaHQ6IDQsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiAxLFxuXHRcdHdlaWdodDogNCxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiAyLFxuXHRcdHdlaWdodDogOCxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0aWQ6IDMsXG5cdFx0d2VpZ2h0OiA0LFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiA0LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogNSxcblx0XHR3ZWlnaHQ6IDE2LFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDYsXG5cdFx0d2VpZ2h0OiAxLFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDgsXG5cdFx0d2VpZ2h0OiAxLFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiAxMyxcblx0XHR3ZWlnaHQ6IDE2LFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRpZDogNyxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDE0LFxuXHRcdHdlaWdodDogNCxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0aWQ6IDE1LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiA5LFxuXHRcdHdlaWdodDogMSxcblx0fSxcbl1cbiIsImV4cG9ydCBmdW5jdGlvbiByYW5kb21FbGVtZW50PFQ+KGFycjogQXJyYXk8VD4pIHtcblx0cmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEVtcHR5PFQ+KHZhcmlhYmxlOiBUIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFQge1xuXHRpZiAoIXZhcmlhYmxlKSB0aHJvdyAnQXNzZXJ0aW9uIGZhaWxlZCdcblx0cmV0dXJuIHZhcmlhYmxlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb25aZXJvKHZhcmlhYmxlOiBudW1iZXIpOiBudW1iZXIge1xuXHRpZiAodmFyaWFibGUgPT09IDApIHtcblx0XHRjb25zb2xlLmdyb3VwQ29sbGFwc2VkKClcblx0XHRjb25zb2xlLnRyYWNlKClcblx0XHRjb25zb2xlLmdyb3VwRW5kKClcblx0XHRkZWJ1Z2dlclxuXHRcdHRocm93ICdBc3NlcnRpb24gZmFpbGVkJ1xuXHR9XG5cdHJldHVybiB2YXJpYWJsZVxufVxuIiwiaW1wb3J0IHsgYmFzZVRlbXBsYXRlcyB9IGZyb20gJy4vZGF0YS90ZW1wbGF0ZS1zZXQtMidcbmltcG9ydCB7IERpcmVjdGlvbnMsIFRlbXBsYXRlIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGFzc2VydE5vblplcm8sIHJhbmRvbUVsZW1lbnQgfSBmcm9tICcuL3V0aWxzJ1xuXG4vKipcbiAqIENyZWF0ZXMgcm90YXRlZCBjb3B5IG9mIG9yaWdpbmFsIHRlbXBsYXRlXG4gKiBwb3B1bGF0ZXMgcm90YXRpb25cbiAqL1xuZnVuY3Rpb24gcm90YXRlVGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlLCB0aWNrczogbnVtYmVyKTogVGVtcGxhdGUge1xuXHRzd2l0Y2ggKHRpY2tzKSB7XG5cdFx0Y2FzZSAwOlxuXHRcdFx0cmV0dXJuIHsgLi4udGVtcGxhdGUgfVxuXHRcdGNhc2UgMTpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnRlbXBsYXRlLFxuXHRcdFx0XHRyb3RhdGlvbjogMSxcblx0XHRcdFx0W0RpcmVjdGlvbnMudG9wXTogdGVtcGxhdGVbRGlyZWN0aW9ucy5sZWZ0XSxcblx0XHRcdFx0W0RpcmVjdGlvbnMucmlnaHRdOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnRvcF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IHRlbXBsYXRlW0RpcmVjdGlvbnMucmlnaHRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogdGVtcGxhdGVbRGlyZWN0aW9ucy5ib3R0b21dLFxuXHRcdFx0fVxuXHRcdGNhc2UgMjpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnRlbXBsYXRlLFxuXHRcdFx0XHRyb3RhdGlvbjogMixcblx0XHRcdFx0W0RpcmVjdGlvbnMudG9wXTogdGVtcGxhdGVbRGlyZWN0aW9ucy5ib3R0b21dLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5yaWdodF06IHRlbXBsYXRlW0RpcmVjdGlvbnMubGVmdF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IHRlbXBsYXRlW0RpcmVjdGlvbnMudG9wXSxcblx0XHRcdFx0W0RpcmVjdGlvbnMubGVmdF06IHRlbXBsYXRlW0RpcmVjdGlvbnMucmlnaHRdLFxuXHRcdFx0fVxuXHRcdGNhc2UgMzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdC4uLnRlbXBsYXRlLFxuXHRcdFx0XHRyb3RhdGlvbjogMyxcblx0XHRcdFx0W0RpcmVjdGlvbnMudG9wXTogdGVtcGxhdGVbRGlyZWN0aW9ucy5yaWdodF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogdGVtcGxhdGVbRGlyZWN0aW9ucy5ib3R0b21dLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLmxlZnRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogdGVtcGxhdGVbRGlyZWN0aW9ucy50b3BdLFxuXHRcdFx0fVxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyAncm90YXRlVGVtcGxhdGUgZXhjZXB0aW9uJ1xuXHR9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVGVtcGxhdGVMaXN0KCk6IFRlbXBsYXRlW10ge1xuXHRjb25zdCBvdXQ6IFRlbXBsYXRlW10gPSBbXVxuXG5cdGNvbnN0IGVucmljaGVkOiBUZW1wbGF0ZVtdID0gYmFzZVRlbXBsYXRlcy5tYXAoXG5cdFx0KHQpOiBUZW1wbGF0ZSA9PiAoeyByb3RhdGlvbjogMCwgd2VpZ2h0OiAxLCAuLi50IH0gYXMgVGVtcGxhdGUpXG5cdClcblxuXHRlbnJpY2hlZC5mb3JFYWNoKCh0KSA9PiB7XG5cdFx0dHJ5UHVzaFRlbXBsYXRlKG91dCwgcm90YXRlVGVtcGxhdGUodCwgMCkpXG5cdFx0dHJ5UHVzaFRlbXBsYXRlKG91dCwgcm90YXRlVGVtcGxhdGUodCwgMSkpXG5cdFx0dHJ5UHVzaFRlbXBsYXRlKG91dCwgcm90YXRlVGVtcGxhdGUodCwgMikpXG5cdFx0dHJ5UHVzaFRlbXBsYXRlKG91dCwgcm90YXRlVGVtcGxhdGUodCwgMykpXG5cdH0pXG5cdHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdHJ5UHVzaFRlbXBsYXRlKG91dDogVGVtcGxhdGVbXSwgdDogVGVtcGxhdGUpIHtcblx0aWYgKFxuXHRcdCEhb3V0LmZpbmQoXG5cdFx0XHQoZWwpID0+XG5cdFx0XHRcdGVsW0RpcmVjdGlvbnMudG9wXSA9PT0gdFtEaXJlY3Rpb25zLnRvcF0gJiZcblx0XHRcdFx0ZWxbRGlyZWN0aW9ucy5yaWdodF0gPT09IHRbRGlyZWN0aW9ucy5yaWdodF0gJiZcblx0XHRcdFx0ZWxbRGlyZWN0aW9ucy5ib3R0b21dID09PSB0W0RpcmVjdGlvbnMuYm90dG9tXSAmJlxuXHRcdFx0XHRlbFtEaXJlY3Rpb25zLmxlZnRdID09PSB0W0RpcmVjdGlvbnMubGVmdF0gJiZcblx0XHRcdFx0ZWwuaWQgPT09IHQuaWRcblx0XHQpXG5cdCkge1xuXHRcdHJldHVyblxuXHR9XG5cdG91dC5wdXNoKHQpXG59XG5cbmNvbnN0IHRlbXBsYXRlczogVGVtcGxhdGVbXSA9IGJ1aWxkVGVtcGxhdGVMaXN0KClcblxuZXhwb3J0IGNsYXNzIFRpbGVtYXAge1xuXHRwdWJsaWMgY2FsbHMgPSAwXG5cblx0cHVibGljIHRpbGVzOiAoVGlsZSB8IG51bGwpW11bXSA9IFtdXG5cblx0cHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBzaXplOiBudW1iZXIgPSA1KSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKykge1xuXHRcdFx0dGhpcy50aWxlc1tpXSA9IFtdXG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2l6ZTsgaisrKSB7XG5cdFx0XHRcdHRoaXMudGlsZXNbaV1bal0gPSBuZXcgVGlsZShpLCBqLCB0aGlzKVxuXHRcdFx0XHRpZiAoaSA9PT0gMCB8fCBqID09PSAwIHx8IGkgPT09IHNpemUgLSAxIHx8IGogPT09IHNpemUgLSAxKSB7XG5cdFx0XHRcdFx0dGhpcy50aWxlc1tpXVtqXS5jb2xsYXBzZVRvKDApXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgUHJvcGFnYXRpb25Qcm9jZXNzID0gY2xhc3Mge1xuXHRcdHByaXZhdGUgcTogVGlsZVtdID0gW11cblxuXHRcdHB1YmxpYyBjb25zdHJ1Y3Rvcihwcml2YXRlIHRpbGVNYXA6IFRpbGVtYXApIHt9XG5cblx0XHRwdWJsaWMgc3RhcnQoaTogbnVtYmVyLCBqOiBudW1iZXIpIHtcblx0XHRcdHRoaXMucHVzaFRvUShpLCBqKVxuXHRcdFx0bGV0IHRpbGU6IFRpbGVcblx0XHRcdGxldCBndWFyZCA9IDBcblx0XHRcdHdoaWxlICgodGlsZSA9IHRoaXMucS5zaGlmdCgpKSkge1xuXHRcdFx0XHRpZiAoZ3VhcmQrKyA+IDIwMCkge1xuXHRcdFx0XHRcdHRocm93ICdHdWFyZCBvdmVyZmxvdydcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnByb3BhZ2F0ZSh0aWxlLngsIHRpbGUueSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRwcml2YXRlIHByb3BhZ2F0ZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuXHRcdFx0Y29uc3Qgc2VsZiA9IHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCwgeSlcblx0XHRcdGlmICghc2VsZikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCwgeSAtIDEpLFxuXHRcdFx0XHREaXJlY3Rpb25zLnRvcFxuXHRcdFx0KVxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCArIDEsIHkpLFxuXHRcdFx0XHREaXJlY3Rpb25zLnJpZ2h0XG5cdFx0XHQpXG5cdFx0XHR0aGlzLmZpbHRlclRhcmdldFRlbXBsYXRlcyhcblx0XHRcdFx0c2VsZixcblx0XHRcdFx0dGhpcy50aWxlTWFwLmdldFRpbGVBdCh4LCB5ICsgMSksXG5cdFx0XHRcdERpcmVjdGlvbnMuYm90dG9tXG5cdFx0XHQpXG5cdFx0XHR0aGlzLmZpbHRlclRhcmdldFRlbXBsYXRlcyhcblx0XHRcdFx0c2VsZixcblx0XHRcdFx0dGhpcy50aWxlTWFwLmdldFRpbGVBdCh4IC0gMSwgeSksXG5cdFx0XHRcdERpcmVjdGlvbnMubGVmdFxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdHByaXZhdGUgZmlsdGVyVGFyZ2V0VGVtcGxhdGVzKFxuXHRcdFx0c291cmNlOiBUaWxlLFxuXHRcdFx0dGFyZ2V0OiBUaWxlIHwgbnVsbCxcblx0XHRcdGRpcmVjdGlvbjogRGlyZWN0aW9uc1xuXHRcdCkge1xuXHRcdFx0aWYgKCF0YXJnZXQpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRjb25zdCBuZXdUZW1wbGF0ZXM6IFRlbXBsYXRlW10gPSBbXVxuXG5cdFx0XHRmb3IgKGxldCB0YXJnZXRUZW1wbGF0ZSBvZiB0YXJnZXQudGVtcGxhdGVzKSB7XG5cdFx0XHRcdGxldCByZXN1bHQgPSBmYWxzZVxuXHRcdFx0XHRmb3IgKGxldCBzb3VyY2VUZW1wbGF0ZSBvZiBzb3VyY2UudGVtcGxhdGVzKSB7XG5cdFx0XHRcdFx0Ly8gYXQgbGVhc3Qgb25lIG9mIHNvdXJjZSB0ZW1wbGF0ZXMgZml0cyB0YXJnZXQgdGVtcGxhdGVcblx0XHRcdFx0XHQvLyB3ZSBrZWVwIHRoYXQgdGFyZ2V0IHRlbXBsYXRlIG9uIHNvdXJjZVxuXHRcdFx0XHRcdHJlc3VsdCB8fD0gdGhpcy50aWxlTWFwLmNoZWNrVGlsZXMoXG5cdFx0XHRcdFx0XHRzb3VyY2VUZW1wbGF0ZSxcblx0XHRcdFx0XHRcdHRhcmdldFRlbXBsYXRlLFxuXHRcdFx0XHRcdFx0ZGlyZWN0aW9uXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0XHRuZXdUZW1wbGF0ZXMucHVzaCh0YXJnZXRUZW1wbGF0ZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gYXNzZXJ0Tm9uWmVybyhuZXdUZW1wbGF0ZXMubGVuZ3RoKVxuXG5cdFx0XHRpZiAodGFyZ2V0LnRlbXBsYXRlcy5sZW5ndGggIT09IG5ld1RlbXBsYXRlcy5sZW5ndGgpIHtcblx0XHRcdFx0Ly8gZnVydGhlciBwcm9wYWdhdGlvbiByZXF1aXJlZFxuXHRcdFx0XHR0aGlzLnB1c2hUb1EodGFyZ2V0LngsIHRhcmdldC55IC0gMSlcblx0XHRcdFx0dGhpcy5wdXNoVG9RKHRhcmdldC54ICsgMSwgdGFyZ2V0LnkpXG5cdFx0XHRcdHRoaXMucHVzaFRvUSh0YXJnZXQueCwgdGFyZ2V0LnkgKyAxKVxuXHRcdFx0XHR0aGlzLnB1c2hUb1EodGFyZ2V0LnggLSAxLCB0YXJnZXQueSlcblx0XHRcdH1cblxuXHRcdFx0dGFyZ2V0LnJlcGxhY2VUZW1wbGF0ZXMobmV3VGVtcGxhdGVzKVxuXHRcdH1cblxuXHRcdHByaXZhdGUgcHVzaFRvUSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuXHRcdFx0Y29uc3QgY2VsbCA9IHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCwgeSlcblx0XHRcdGlmIChjZWxsKSB7XG5cdFx0XHRcdHRoaXMucS5wdXNoKGNlbGwpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGdldFRpbGVBdChpOiBudW1iZXIsIGo6IG51bWJlcik6IFRpbGUgfCBudWxsIHtcblx0XHRpZiAoaSA8IDAgfHwgaSA+IHRoaXMuc2l6ZSAtIDEgfHwgaiA8IDAgfHwgaiA+IHRoaXMuc2l6ZSAtIDEpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnRpbGVzW2ldW2pdXG5cdH1cblxuXHRwcml2YXRlIGdldE5leHRUaWxlKCk6IFRpbGUgfCBudWxsIHtcblx0XHRsZXQgbWluOiBudW1iZXIgPSBJbmZpbml0eVxuXHRcdGxldCB0aWxlczogVGlsZVtdID0gW11cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2l6ZTsgaSsrKSB7XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuc2l6ZTsgaisrKSB7XG5cdFx0XHRcdGlmICh0aGlzLnRpbGVzW2ldW2pdKSB7XG5cdFx0XHRcdFx0aWYgKHRoaXMudGlsZXNbaV1bal0uZW50aHJvcHkgPT09IDEpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVzW2ldW2pdLmVudGhyb3B5IDwgbWluKSB7XG5cdFx0XHRcdFx0XHRtaW4gPSB0aGlzLnRpbGVzW2ldW2pdLmVudGhyb3B5XG5cdFx0XHRcdFx0XHR0aWxlcyA9IFt0aGlzLnRpbGVzW2ldW2pdXVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy50aWxlc1tpXVtqXS5lbnRocm9weSA9PT0gbWluKSB7XG5cdFx0XHRcdFx0XHR0aWxlcy5wdXNoKHRoaXMudGlsZXNbaV1bal0pXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICh0aWxlcy5sZW5ndGggPCAxKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblxuXHRcdHJldHVybiByYW5kb21FbGVtZW50PFRpbGU+KHRpbGVzKVxuXHR9XG5cblx0cHVibGljIGNoZWNrVGlsZXMoXG5cdFx0c2VsZjogVGVtcGxhdGUsXG5cdFx0b3RoZXI6IFRlbXBsYXRlLFxuXHRcdGRpcmVjdGlvbjogRGlyZWN0aW9uc1xuXHQpOiBib29sZWFuIHtcblx0XHRsZXQgcmVzdWx0OiBib29sZWFuXG5cdFx0c3dpdGNoIChkaXJlY3Rpb24pIHtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy50b3A6XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy50b3BdID09PSBvdGhlcltEaXJlY3Rpb25zLmJvdHRvbV1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy5yaWdodDpcblx0XHRcdFx0cmVzdWx0ID0gc2VsZltEaXJlY3Rpb25zLnJpZ2h0XSA9PT0gb3RoZXJbRGlyZWN0aW9ucy5sZWZ0XVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBEaXJlY3Rpb25zLmJvdHRvbTpcblx0XHRcdFx0cmVzdWx0ID0gc2VsZltEaXJlY3Rpb25zLmJvdHRvbV0gPT09IG90aGVyW0RpcmVjdGlvbnMudG9wXVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBEaXJlY3Rpb25zLmxlZnQ6XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy5sZWZ0XSA9PT0gb3RoZXJbRGlyZWN0aW9ucy5yaWdodF1cblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cdFx0dGhpcy5jYWxscysrXG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG5cblx0cHJpdmF0ZSBjb2xsYXBzZVRpbGUodGlsZTogVGlsZSkge1xuXHRcdHRpbGUuY29sbGFwc2UoKVxuXHRcdGNvbnN0IHByb3BhZ2F0aW9uID0gbmV3IFRpbGVtYXAuUHJvcGFnYXRpb25Qcm9jZXNzKHRoaXMpXG5cdFx0cHJvcGFnYXRpb24uc3RhcnQodGlsZS54LCB0aWxlLnkpXG5cdH1cblxuXHRwdWJsaWMgYnVpbGQoKSB7XG5cdFx0bGV0IHRpbGU6IFRpbGVcblx0XHR3aGlsZSAoKHRpbGUgPSB0aGlzLmdldE5leHRUaWxlKCkpKSB7XG5cdFx0XHR0aGlzLmNvbGxhcHNlVGlsZSh0aWxlKVxuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cdHB1YmxpYyB0ZW1wbGF0ZXM6IFRlbXBsYXRlW10gPSBbLi4udGVtcGxhdGVzXVxuXHRwdWJsaWMgZW50aHJvcHk6IG51bWJlciA9IHRoaXMudGVtcGxhdGVzLmxlbmd0aFxuXHRwdWJsaWMgZGVhZCA9IGZhbHNlXG5cblx0cHVibGljIGNvbnN0cnVjdG9yKFxuXHRcdHB1YmxpYyB4OiBudW1iZXIsXG5cdFx0cHVibGljIHk6IG51bWJlcixcblx0XHRwcml2YXRlIHRpbGVNYXA6IFRpbGVtYXBcblx0KSB7fVxuXG5cdHByaXZhdGUgZ2V0V2VpZ2h0ZWRSYW5kb21UZW1wbGF0ZSgpOiBUZW1wbGF0ZSB7XG5cdFx0YXNzZXJ0Tm9uWmVybyh0aGlzLnRlbXBsYXRlcy5sZW5ndGgpXG5cdFx0Y29uc3QgdG90YWxXZWlnaHQgPSB0aGlzLnRlbXBsYXRlcy5yZWR1Y2UoKGFjYywgY3VyKSA9PiBhY2MgKyBjdXIud2VpZ2h0LCAwKVxuXHRcdGNvbnN0IHJhbmRvbVdlaWdodCA9IE1hdGgucmFuZG9tKCkgKiB0b3RhbFdlaWdodFxuXHRcdGxldCB3ZWlnaHQgPSAwXG5cdFx0Zm9yIChsZXQgdCBvZiB0aGlzLnRlbXBsYXRlcykge1xuXHRcdFx0aWYgKHdlaWdodCArIHQud2VpZ2h0ID4gcmFuZG9tV2VpZ2h0KSB7XG5cdFx0XHRcdHJldHVybiB0XG5cdFx0XHR9XG5cdFx0XHR3ZWlnaHQgKz0gdC53ZWlnaHRcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMudGVtcGxhdGVzW3RoaXMudGVtcGxhdGVzLmxlbmd0aCAtIDFdXG5cdH1cblxuXHRwdWJsaWMgY29sbGFwc2UoKSB7XG5cdFx0aWYgKHRoaXMuZGVhZCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGNvbnN0IGNvcHkgPSBbLi4udGhpcy50ZW1wbGF0ZXNdXG5cdFx0YXNzZXJ0Tm9uWmVybyh0aGlzLnRlbXBsYXRlcy5sZW5ndGgpXG5cdFx0Ly8gY29uc3QgcmFuZG9tVGVtcGxhdGUgPSByYW5kb21FbGVtZW50PFRlbXBsYXRlPihjb3B5KVxuXHRcdGNvbnN0IHJhbmRvbVRlbXBsYXRlID0gdGhpcy5nZXRXZWlnaHRlZFJhbmRvbVRlbXBsYXRlKClcblx0XHR0aGlzLnRlbXBsYXRlcyA9IFtyYW5kb21UZW1wbGF0ZV1cblx0XHR0aGlzLmVudGhyb3B5ID0gMVxuXHR9XG5cblx0cHVibGljIGNvbGxhcHNlVG8oaTogbnVtYmVyKSB7XG5cdFx0aWYgKHRoaXMuZGVhZCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGFzc2VydE5vblplcm8odGhpcy50ZW1wbGF0ZXMubGVuZ3RoKVxuXHRcdHRoaXMudGVtcGxhdGVzID0gW3RoaXMudGVtcGxhdGVzWzBdXVxuXHRcdHRoaXMuZW50aHJvcHkgPSAxXG5cdH1cblxuXHRwcml2YXRlIGRpZSgpIHtcblx0XHR0aGlzLmRlYWQgPSB0cnVlXG5cdFx0dGhpcy50aWxlTWFwLnRpbGVzW3RoaXMueF1bdGhpcy55XSA9IG51bGxcblx0fVxuXG5cdHB1YmxpYyByZXBsYWNlVGVtcGxhdGVzKG5ld1RlbXBsYXRlczogVGVtcGxhdGVbXSkge1xuXHRcdHRoaXMudGVtcGxhdGVzID0gbmV3VGVtcGxhdGVzXG5cdFx0dGhpcy5lbnRocm9weSA9IHRoaXMudGVtcGxhdGVzLmxlbmd0aFxuXHRcdGlmICh0aGlzLmVudGhyb3B5IDwgMSkge1xuXHRcdFx0dGhpcy5kaWUoKVxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IHsgQ2FsbGJhY2ssIGdyYXBoaWNzIH0gZnJvbSAnLi9jYW52YXMvZ3JhcGhpY3MnXG5pbXBvcnQgeyBUaWxlUmVuZGVyZXIgfSBmcm9tICcuL2NhbnZhcy90aWxlLXJlbmRlcmVyJ1xuaW1wb3J0IHsgVGlsZW1hcCB9IGZyb20gJy4vZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3RpbGVtYXAnXG5cbmNvbnN0IGdlbmVyYXRlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRGl2RWxlbWVudD4oJyNnZW5lcmF0ZScpXG5sZXQgY2FsbGJhY2s6IENhbGxiYWNrIHwgbnVsbCA9IG51bGxcblxuZnVuY3Rpb24gZ2VuZXJhdGUoKSB7XG5cdGlmIChjYWxsYmFjaykge1xuXHRcdGdyYXBoaWNzLnJlbW92ZURyYXdDYWxsYmFjayhjYWxsYmFjaylcblx0fVxuXG5cdGNvbnN0IHRpbGVNYXAgPSBuZXcgVGlsZW1hcCg2NClcblx0dGlsZU1hcC5idWlsZCgpXG5cblx0Y29uc3QgaXRlcmF0aW9uc0VsZW1lbnQgPVxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KCcjaXRlcmF0aW9ucycpXG5cdGl0ZXJhdGlvbnNFbGVtZW50LmlubmVyVGV4dCA9IE51bWJlcih0aWxlTWFwLmNhbGxzKS50b0xvY2FsZVN0cmluZygpXG5cblx0Y29uc3QgdGlsZVJlbmRlcmVyID0gbmV3IFRpbGVSZW5kZXJlcihncmFwaGljcylcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGlsZVJlbmRlcmVyLnJlbmRlcih0aWxlTWFwKVxuXHR9XG5cdGdyYXBoaWNzLmFkZERyYXdDYWxsYmFjayhjYWxsYmFjaylcbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG5cdGdyYXBoaWNzLmluaXQoKVxuXHRncmFwaGljcy5hbmltYXRlKClcblx0Z2VuZXJhdGUoKVxufSlcblxuZ2VuZXJhdGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBnZW5lcmF0ZSgpKVxuIl0sIm5hbWVzIjpbIl9hIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUEsT0FBQSxrQkFBQSxZQUFBO0lBQ0MsU0FBMEIsT0FBQSxDQUFBLENBQWEsRUFBUyxDQUFhLEVBQUE7QUFBbkMsUUFBQSxJQUFBLENBQUEsS0FBQSxLQUFBLENBQUEsRUFBQSxFQUFBLENBQWEsR0FBQSxDQUFBLENBQUEsRUFBQTtBQUFTLFFBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFhLEdBQUEsQ0FBQSxDQUFBLEVBQUE7UUFBbkMsSUFBQyxDQUFBLENBQUEsR0FBRCxDQUFDLENBQVk7UUFBUyxJQUFDLENBQUEsQ0FBQSxHQUFELENBQUMsQ0FBWTtLQUFJO0FBRTFELElBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFLLEdBQVosWUFBQTtRQUNDLE9BQU8s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QUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDdEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUN0QyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDcEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLEVBQUU7OztBQUdWLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNsQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxFQUFFO0FBQ04sUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLEVBQUU7OztBQUdWLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDbEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLEVBQUU7QUFDTixRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ25DLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxFQUFFO0FBQ04sUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOztDQUVWOztBQzNHSyxTQUFVLGFBQWEsQ0FBSSxHQUFhLEVBQUE7QUFDN0MsSUFBQSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtBQUNuRCxDQUFDO0FBT0ssU0FBVSxhQUFhLENBQUMsUUFBZ0IsRUFBQTtJQUM3QyxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7UUFDbkIsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFBO1FBQ3hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUNmLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUNsQixRQUFBLFNBQVE7QUFDUixRQUFBLE1BQU0sa0JBQWtCLENBQUE7QUFDeEIsS0FBQTtBQUNELElBQUEsT0FBTyxRQUFRLENBQUE7QUFDaEI7O0FDZEE7OztBQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsUUFBa0IsRUFBRSxLQUFhLEVBQUE7O0FBQ3hELElBQUEsUUFBUSxLQUFLO0FBQ1osUUFBQSxLQUFLLENBQUM7QUFDTCxZQUFBLE9BQUEsUUFBQSxDQUFBLEVBQUEsRUFBWSxRQUFRLENBQUUsQ0FBQTtBQUN2QixRQUFBLEtBQUssQ0FBQztZQUNMLE9BQ0ksUUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBUSxXQUNYLFFBQVEsRUFBRSxDQUFDLEVBQ1YsRUFBQSxFQUFBLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUEsRUFBQSxDQUMxQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FDM0MsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQzlDLEVBQUEsQ0FBQSxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFDOUMsRUFBQSxFQUFBLENBQUE7QUFDRixRQUFBLEtBQUssQ0FBQztZQUNMLE9BQ0ksUUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBUSxXQUNYLFFBQVEsRUFBRSxDQUFDLEVBQ1YsRUFBQSxFQUFBLENBQUEsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUEsRUFBQSxDQUM1QyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FDNUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQzVDLEVBQUEsQ0FBQSxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDN0MsRUFBQSxFQUFBLENBQUE7QUFDRixRQUFBLEtBQUssQ0FBQztZQUNMLE9BQ0ksUUFBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLEVBQUEsUUFBUSxXQUNYLFFBQVEsRUFBRSxDQUFDLEVB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R0FBVyxRQUFRLENBQUE7UUFDMUIsSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFBO0FBQ3RCLFFBQUEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsWUFBQSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ3JCLG9CQUFBLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxFQUFFO3dCQUNwQyxTQUFRO0FBQ1IscUJBQUE7QUFDRCxvQkFBQSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRTtBQUNwQyx3QkFBQSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUE7QUFDL0Isd0JBQUEsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzFCLHFCQUFBO0FBQ0Qsb0JBQUEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsS0FBSyxHQUFHLEVBQUU7QUFDdEMsd0JBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDNUIscUJBQUE7QUFDRCxpQkFBQTtBQUNELGFBQUE7QUFDRCxTQUFBO0FBQ0QsUUFBQSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdB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
