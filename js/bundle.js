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
                _this.currentPosition.cx -= (dx * _this.currentPosition.w) / _this.canvas.width;
                _this.currentPosition.cy -= (dy * _this.currentPosition.w) / _this.canvas.width;
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
        this.spriteSheet.src = '/assets/images/tile-map.png';
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
                ((point.x - this.currentPosition.cx) / this.currentPosition.w) * this.context.canvas.width;
        newy =
            this.context.canvas.width / ratio / 2 +
                ((point.y - this.currentPosition.cy) / this.currentPosition.w) * this.context.canvas.width;
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyJzcmMvdHMvbWF0aHMudHMiLCJzcmMvdHMvY2FudmFzL2dyYXBoaWNzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90eXBlcy50cyIsInNyYy90cy9jYW52YXMvdGlsZS1yZW5kZXJlci50cyIsIm5vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL2RhdGEvdGVtcGxhdGUtc2V0LTIudHMiLCJzcmMvdHMvZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3V0aWxzLnRzIiwic3JjL3RzL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwLnRzIiwic3JjL3RzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBWZWN0b3IyIHtcblx0cHVibGljIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLCBwdWJsaWMgeTogbnVtYmVyID0gMCkge31cblxuXHRwdWJsaWMgY2xvbmUoKTogVmVjdG9yMiB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KVxuXHR9XG5cblx0cHVibGljIG11bHRpcGx5U2NhbGFyKHZhbHVlOiBudW1iZXIpOiBWZWN0b3IyIHtcblx0XHR0aGlzLnggKj0gdmFsdWVcblx0XHR0aGlzLnkgKj0gdmFsdWVcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIGFkZChvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCArPSBvdGhlci54XG5cdFx0dGhpcy55ICs9IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHN1YihvdGhlcjogVmVjdG9yMik6IFZlY3RvcjIge1xuXHRcdHRoaXMueCAtPSBvdGhlci54XG5cdFx0dGhpcy55IC09IG90aGVyLnlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0cHVibGljIHJvdGF0ZUFyb3VuZFplcm8oYW5nbGU6IG51bWJlcik6IFZlY3RvcjIge1xuXHRcdGNvbnN0IHsgeCwgeSB9ID0gdGhpc1xuXHRcdHRoaXMueCA9IHggKiBNYXRoLmNvcyhhbmdsZSkgLSB5ICogTWF0aC5zaW4oYW5nbGUpXG5cdFx0dGhpcy55ID0geCAqIE1hdGguc2luKGFuZ2xlKSArIHkgKiBNYXRoLmNvcyhhbmdsZSlcblx0XHRyZXR1cm4gdGhpc1xuXHR9XG59XG4iLCJpbXBvcnQgeyBWZWN0b3IyIH0gZnJvbSAnLi4vbWF0aHMnXHJcblxyXG50eXBlIENhbnZhc1Bvc2l0aW9uID0ge1xyXG5cdGN4OiBudW1iZXJcclxuXHRjeTogbnVtYmVyXHJcblx0dzogbnVtYmVyXHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIENhbGxiYWNrID0gKGNvbnRleHQ/OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpID0+IHZvaWRcclxuXHJcbmV4cG9ydCBjbGFzcyBHcmFwaGljcyB7XHJcblx0Y29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXHJcblx0Y2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudFxyXG5cdGNhbGxiYWNrczogQ2FsbGJhY2tbXSA9IFtdXHJcblxyXG5cdHByaXZhdGUgY3VycmVudFBvc2l0aW9uOiBDYW52YXNQb3NpdGlvbiA9IHsgY3g6IDAsIGN5OiAwLCB3OiAxMDI0IH1cclxuXHRpc0RyYWdnaW5nID0gZmFsc2VcclxuXHRzdGFydFg6IG51bWJlciA9IDBcclxuXHRzdGFydFk6IG51bWJlciA9IDBcclxuXHJcblx0cHJpdmF0ZSBzcHJpdGVTaGVldDogYW55XHJcblx0cHJpdmF0ZSBzcHJpdGVTaXplID0gMzJcclxuXHJcblx0cHVibGljIGluaXQoKSB7XHJcblx0XHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXHJcblx0XHRjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGFpbmVyJylcclxuXHRcdGlmICghY29udGFpbmVyKSB7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignbm8gY29udGFpbmVyJylcclxuXHRcdH1cclxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcylcclxuXHRcdHRoaXMuY29udGV4dCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJylcclxuXHRcdHRoaXMuY29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZVxyXG5cclxuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGhcclxuXHRcdHRoaXMuY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG5cclxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB7XHJcblx0XHRcdHRoaXMuaXNEcmFnZ2luZyA9IHRydWVcclxuXHRcdFx0dGhpcy5zdGFydFggPSBlLmNsaWVudFhcclxuXHRcdFx0dGhpcy5zdGFydFkgPSBlLmNsaWVudFlcclxuXHRcdH0pXHJcblxyXG5cdFx0dGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGUpID0+IHtcclxuXHRcdFx0aWYgKHRoaXMuaXNEcmFnZ2luZykge1xyXG5cdFx0XHRcdGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gdGhpcy5zdGFydFhcclxuXHRcdFx0XHRjb25zdCBkeSA9IGUuY2xpZW50WSAtIHRoaXMuc3RhcnRZXHJcblx0XHRcdFx0dGhpcy5zdGFydFggPSBlLmNsaWVudFhcclxuXHRcdFx0XHR0aGlzLnN0YXJ0WSA9IGUuY2xpZW50WVxyXG5cclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRQb3NpdGlvbi5jeCAtPSAoZHggKiB0aGlzLmN1cnJlbnRQb3NpdGlvbi53KSAvIHRoaXMuY2FudmFzLndpZHRoXHJcblx0XHRcdFx0dGhpcy5jdXJyZW50UG9zaXRpb24uY3kgLT0gKGR5ICogdGhpcy5jdXJyZW50UG9zaXRpb24udykgLyB0aGlzLmNhbnZhcy53aWR0aFxyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cclxuXHRcdHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCAoZSkgPT4ge1xyXG5cdFx0XHR0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZVxyXG5cdFx0fSlcclxuXHJcblx0XHR0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIChlKSA9PiB7XHJcblx0XHRcdGUucHJldmVudERlZmF1bHQoKVxyXG5cdFx0XHRjb25zdCBkZWx0YSA9IGUuZGVsdGFZID4gMCA/IDEuMSA6IDAuOVxyXG5cdFx0XHR0aGlzLmN1cnJlbnRQb3NpdGlvbi53ICo9IGRlbHRhXHJcblx0XHR9KVxyXG5cclxuXHRcdHRoaXMuc3ByaXRlU2hlZXQgPSBuZXcgSW1hZ2UoKVxyXG5cdFx0dGhpcy5zcHJpdGVTaGVldC5zcmMgPSAnL2Fzc2V0cy9pbWFnZXMvdGlsZS1tYXAucG5nJ1xyXG5cdH1cclxuXHJcblx0cHVibGljIGRyYXdSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3OiBudW1iZXIsIGg6IG51bWJlciwgY29sb3I6IHN0cmluZykge1xyXG5cdFx0dGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3JcclxuXHRcdHRoaXMuY29udGV4dC5iZWdpblBhdGgoKVxyXG5cclxuXHRcdGNvbnN0IHsgeDogc2NyZWVuWDEsIHk6IHNjcmVlblkxIH0gPSB0aGlzLnJlc29sdmVQb2ludChuZXcgVmVjdG9yMih4LCB5KSlcclxuXHRcdGNvbnN0IHsgeDogc2NyZWVuWDIsIHk6IHNjcmVlblkyIH0gPSB0aGlzLnJlc29sdmVQb2ludChuZXcgVmVjdG9yMih4ICsgdywgeSArIGgpKVxyXG5cclxuXHRcdHRoaXMuY29udGV4dC5yZWN0KHNjcmVlblgxLCBzY3JlZW5ZMSwgc2NyZWVuWDIgLSBzY3JlZW5YMSwgc2NyZWVuWTIgLSBzY3JlZW5ZMSlcclxuXHRcdHRoaXMuY29udGV4dC5zdHJva2UoKVxyXG5cdH1cclxuXHJcblx0cHVibGljIGRyYXdDaXJjbGUoeDogbnVtYmVyLCB5OiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBjb2xvcjogc3RyaW5nKSB7XHJcblx0XHR0aGlzLmNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvclxyXG5cdFx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpXHJcblxyXG5cdFx0Y29uc3QgeyB4OiBzY3JlZW5YMSwgeTogc2NyZWVuWTEgfSA9IHRoaXMucmVzb2x2ZVBvaW50KG5ldyBWZWN0b3IyKHgsIHkpKVxyXG5cclxuXHRcdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBjb2xvclxyXG5cdFx0dGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpXHJcblx0XHR0aGlzLmNvbnRleHQuYXJjKHNjcmVlblgxLCBzY3JlZW5ZMSwgdGhpcy5yZXNvbHZlU2l6ZShyYWRpdXMpLCAwLCAyICogTWF0aC5QSSlcclxuXHRcdHRoaXMuY29udGV4dC5maWxsKClcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBkcmF3U3ByaXRlKHg6IG51bWJlciwgeTogbnVtYmVyLCB0aWxlSWQ6IG51bWJlciwgcm90YXRpb246IG51bWJlcikge1xyXG5cdFx0Y29uc3QgeyB4OiBzY3JlZW5YMSwgeTogc2NyZWVuWTEgfSA9IHRoaXMucmVzb2x2ZVBvaW50KG5ldyBWZWN0b3IyKHgsIHkpKVxyXG5cclxuXHRcdGNvbnN0IHNwcml0ZVggPSB0aGlzLnNwcml0ZVNpemUgKiAodGlsZUlkICUgMTYpXHJcblx0XHRjb25zdCBzcHJpdGVZID0gdGhpcy5zcHJpdGVTaXplICogKHRpbGVJZCAtICh0aWxlSWQgJSAxNikpXHJcblxyXG5cdFx0Y29uc3Qgc2l6ZSA9IHRoaXMucmVzb2x2ZVNpemUodGhpcy5zcHJpdGVTaXplKVxyXG5cclxuXHRcdHRoaXMuY29udGV4dC5zYXZlKClcclxuXHJcblx0XHR0aGlzLmNvbnRleHQudHJhbnNsYXRlKHNjcmVlblgxICsgc2l6ZSAvIDIsIHNjcmVlblkxICsgc2l6ZSAvIDIpXHJcblx0XHQvLyB0aGlzLmNvbnRleHQudHJhbnNsYXRlKHNjcmVlblgxLCBzY3JlZW5ZMSlcclxuXHRcdHRoaXMuY29udGV4dC5yb3RhdGUoKHJvdGF0aW9uICogTWF0aC5QSSkgLyAyKVxyXG5cclxuXHRcdHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoXHJcblx0XHRcdHRoaXMuc3ByaXRlU2hlZXQsXHJcblx0XHRcdHNwcml0ZVgsXHJcblx0XHRcdHNwcml0ZVksXHJcblx0XHRcdHRoaXMuc3ByaXRlU2l6ZSxcclxuXHRcdFx0dGhpcy5zcHJpdGVTaXplLFxyXG5cdFx0XHQtc2l6ZSAvIDIgLSAxLFxyXG5cdFx0XHQtc2l6ZSAvIDIgLSAxLFxyXG5cdFx0XHRzaXplICsgMixcclxuXHRcdFx0c2l6ZSArIDJcclxuXHRcdClcclxuXHJcblx0XHR0aGlzLmNvbnRleHQucmVzdG9yZSgpXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgcmVzb2x2ZVNpemUoeDogbnVtYmVyKSB7XHJcblx0XHRyZXR1cm4gKHggKiB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoKSAvIHRoaXMuY3VycmVudFBvc2l0aW9uLndcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZXNvbHZlUG9pbnQocG9pbnQ6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuXHRcdGxldCBuZXd4OiBudW1iZXIsIG5ld3k6IG51bWJlclxyXG5cdFx0Y29uc3QgcmF0aW8gPSB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoIC8gdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHRcclxuXHJcblx0XHRuZXd4ID1cclxuXHRcdFx0dGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCAvIDIgK1xyXG5cdFx0XHQoKHBvaW50LnggLSB0aGlzLmN1cnJlbnRQb3NpdGlvbi5jeCkgLyB0aGlzLmN1cnJlbnRQb3NpdGlvbi53KSAqIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGhcclxuXHRcdG5ld3kgPVxyXG5cdFx0XHR0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoIC8gcmF0aW8gLyAyICtcclxuXHRcdFx0KChwb2ludC55IC0gdGhpcy5jdXJyZW50UG9zaXRpb24uY3kpIC8gdGhpcy5jdXJyZW50UG9zaXRpb24udykgKiB0aGlzLmNvbnRleHQuY2FudmFzLndpZHRoXHJcblxyXG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IyKG5ld3gsIG5ld3kpXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYWRkRHJhd0NhbGxiYWNrKGNhbGxiYWNrOiBDYWxsYmFjaykge1xyXG5cdFx0dGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjaylcclxuXHR9XHJcblxyXG5cdHB1YmxpYyByZW1vdmVEcmF3Q2FsbGJhY2soY2FsbGJhY2s6IENhbGxiYWNrKSB7XHJcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuY2FsbGJhY2tzLmZpbmRJbmRleCgoY2IpID0+IGNiID09PSBjYWxsYmFjaylcclxuXHRcdGlmIChpbmRleCAhPSAtMSkge1xyXG5cdFx0XHR0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYW5pbWF0ZSgpIHtcclxuXHRcdHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSAnIzI3MzIzZidcclxuXHRcdHRoaXMuY29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KVxyXG5cdFx0dGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKHRoaXMuY29udGV4dCkpXHJcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hbmltYXRlLmNhbGwodGhpcykpXHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZ3JhcGhpY3MgPSBuZXcgR3JhcGhpY3MoKVxyXG4iLCJleHBvcnQgZW51bSBCb3JkZXJUeXBlIHtcblx0Vm9pZCA9ICd2b2lkJyxcblx0Qm9yZGVyID0gJ2JvcmRlcicsXG5cdEdyZWVuID0gJ2dyZWVuJyxcbn1cblxuZXhwb3J0IGNvbnN0IEJvcmRlckNvbG9ycyA9IHtcblx0W0JvcmRlclR5cGUuVm9pZF06ICcjMDAwMDAwJyxcblx0W0JvcmRlclR5cGUuQm9yZGVyXTogJyMwMDAwRkYnLFxuXHRbQm9yZGVyVHlwZS5HcmVlbl06ICcjMDBGRjAwJyxcbn1cblxuZXhwb3J0IGVudW0gRGlyZWN0aW9ucyB7XG5cdHRvcCA9ICd0b3AnLFxuXHRyaWdodCA9ICdyaWdodCcsXG5cdGJvdHRvbSA9ICdib3R0b20nLFxuXHRsZWZ0ID0gJ2xlZnQnLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlIHtcblx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZVxuXHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGVcblx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZVxuXHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZVxuXHRpZDogbnVtYmVyXG5cdHdlaWdodDogbnVtYmVyXG5cdHJvdGF0aW9uOiBudW1iZXJcbn1cbiIsImltcG9ydCB7IFRpbGVtYXAgfSBmcm9tICcuLi9nZW5lcmF0b3JzL3dhdmUtZnVuY3Rpb24tY29sbGFwc2UvdGlsZW1hcCdcclxuaW1wb3J0IHsgQm9yZGVyQ29sb3JzLCBEaXJlY3Rpb25zIH0gZnJvbSAnLi4vZ2VuZXJhdG9ycy93YXZlLWZ1bmN0aW9uLWNvbGxhcHNlL3R5cGVzJ1xyXG5pbXBvcnQgeyBHcmFwaGljcyB9IGZyb20gJy4vZ3JhcGhpY3MnXHJcblxyXG5leHBvcnQgY2xhc3MgVGlsZVJlbmRlcmVyIHtcclxuXHRwcml2YXRlIFNJWkUgPSAzMlxyXG5cclxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIGdyYXBoaWNzOiBHcmFwaGljcykge31cclxuXHJcblx0cHVibGljIHJlbmRlcih0aWxlbWFwOiBUaWxlbWFwKSB7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRpbGVtYXAudGlsZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aWxlbWFwLnRpbGVzW2ldLmxlbmd0aDsgKytqKSB7XHJcblx0XHRcdFx0dGhpcy5yZW5kZXJUaWxlU3ByaXRlKHRpbGVtYXAsIGksIGopXHJcblx0XHRcdFx0Ly8gdGhpcy5yZW5kZXJUaWxlU2ltcGxlKHRpbGVtYXAsIGksIGopXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVuZGVyVGlsZVNpbXBsZSh0aWxlbWFwOiBUaWxlbWFwLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG5cdFx0Y29uc3QgdGlsZSA9IHRpbGVtYXAuZ2V0VGlsZUF0KHgsIHkpXHJcblxyXG5cdFx0aWYgKCF0aWxlKSB7XHJcblx0XHRcdHJldHVyblxyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGNlbnRlclggPSAodGlsZS54IC0gdGlsZW1hcC5zaXplIC8gMikgKiB0aGlzLlNJWkVcclxuXHRcdGNvbnN0IGNlbnRlclkgPSAodGlsZS55IC0gdGlsZW1hcC5zaXplIC8gMikgKiB0aGlzLlNJWkVcclxuXHJcblx0XHR0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KFxyXG5cdFx0XHRjZW50ZXJYIC0gdGhpcy5TSVpFIC8gMiArIDIsXHJcblx0XHRcdGNlbnRlclkgLSB0aGlzLlNJWkUgLyAyICsgMixcclxuXHRcdFx0dGhpcy5TSVpFIC0gNCxcclxuXHRcdFx0dGhpcy5TSVpFIC0gNCxcclxuXHRcdFx0JyNFRUVFRUUnXHJcblx0XHQpXHJcblxyXG5cdFx0Y29uc3QgdGVtcGxhdGUgPSB0aWxlLnRlbXBsYXRlc1swXVxyXG5cdFx0aWYgKHRlbXBsYXRlKSB7XHJcblx0XHRcdHRoaXMuZ3JhcGhpY3MuZHJhd0NpcmNsZShjZW50ZXJYLCBjZW50ZXJZIC0gMTAsIDIsIEJvcmRlckNvbG9yc1t0ZW1wbGF0ZVtEaXJlY3Rpb25zLnRvcF1dKVxyXG5cdFx0XHR0aGlzLmdyYXBoaWNzLmRyYXdDaXJjbGUoY2VudGVyWCArIDEwLCBjZW50ZXJZLCAyLCBCb3JkZXJDb2xvcnNbdGVtcGxhdGVbRGlyZWN0aW9ucy5yaWdodF1dKVxyXG5cdFx0XHR0aGlzLmdyYXBoaWNzLmRyYXdDaXJjbGUoY2VudGVyWCwgY2VudGVyWSArIDEwLCAyLCBCb3JkZXJDb2xvcnNbdGVtcGxhdGVbRGlyZWN0aW9ucy5ib3R0b21dXSlcclxuXHRcdFx0dGhpcy5ncmFwaGljcy5kcmF3Q2lyY2xlKGNlbnRlclggLSAxMCwgY2VudGVyWSwgMiwgQm9yZGVyQ29sb3JzW3RlbXBsYXRlW0RpcmVjdGlvbnMubGVmdF1dKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSByZW5kZXJUaWxlU3ByaXRlKHRpbGVtYXA6IFRpbGVtYXAsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcblx0XHRjb25zdCB0aWxlID0gdGlsZW1hcC5nZXRUaWxlQXQoeCwgeSlcclxuXHJcblx0XHRpZiAoIXRpbGUpIHtcclxuXHRcdFx0cmV0dXJuXHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY2VudGVyWCA9ICh0aWxlLnggLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cdFx0Y29uc3QgY2VudGVyWSA9ICh0aWxlLnkgLSB0aWxlbWFwLnNpemUgLyAyKSAqIHRoaXMuU0laRVxyXG5cclxuXHRcdHRoaXMuZ3JhcGhpY3MuZHJhd1Nwcml0ZShcclxuXHRcdFx0Y2VudGVyWCAtIHRoaXMuU0laRSAvIDIsXHJcblx0XHRcdGNlbnRlclkgLSB0aGlzLlNJWkUgLyAyLFxyXG5cdFx0XHR0aWxlLnRlbXBsYXRlc1swXS5pZCxcclxuXHRcdFx0dGlsZS50ZW1wbGF0ZXNbMF0ucm90YXRpb25cclxuXHRcdClcclxuXHR9XHJcbn1cclxuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2VzRGVjb3JhdGUoY3RvciwgZGVzY3JpcHRvckluLCBkZWNvcmF0b3JzLCBjb250ZXh0SW4sIGluaXRpYWxpemVycywgZXh0cmFJbml0aWFsaXplcnMpIHtcclxuICAgIGZ1bmN0aW9uIGFjY2VwdChmKSB7IGlmIChmICE9PSB2b2lkIDAgJiYgdHlwZW9mIGYgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZ1bmN0aW9uIGV4cGVjdGVkXCIpOyByZXR1cm4gZjsgfVxyXG4gICAgdmFyIGtpbmQgPSBjb250ZXh0SW4ua2luZCwga2V5ID0ga2luZCA9PT0gXCJnZXR0ZXJcIiA/IFwiZ2V0XCIgOiBraW5kID09PSBcInNldHRlclwiID8gXCJzZXRcIiA6IFwidmFsdWVcIjtcclxuICAgIHZhciB0YXJnZXQgPSAhZGVzY3JpcHRvckluICYmIGN0b3IgPyBjb250ZXh0SW5bXCJzdGF0aWNcIl0gPyBjdG9yIDogY3Rvci5wcm90b3R5cGUgOiBudWxsO1xyXG4gICAgdmFyIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9ySW4gfHwgKHRhcmdldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSkgOiB7fSk7XHJcbiAgICB2YXIgXywgZG9uZSA9IGZhbHNlO1xyXG4gICAgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICB2YXIgY29udGV4dCA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gY29udGV4dEluKSBjb250ZXh0W3BdID0gcCA9PT0gXCJhY2Nlc3NcIiA/IHt9IDogY29udGV4dEluW3BdO1xyXG4gICAgICAgIGZvciAodmFyIHAgaW4gY29udGV4dEluLmFjY2VzcykgY29udGV4dC5hY2Nlc3NbcF0gPSBjb250ZXh0SW4uYWNjZXNzW3BdO1xyXG4gICAgICAgIGNvbnRleHQuYWRkSW5pdGlhbGl6ZXIgPSBmdW5jdGlvbiAoZikgeyBpZiAoZG9uZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBhZGQgaW5pdGlhbGl6ZXJzIGFmdGVyIGRlY29yYXRpb24gaGFzIGNvbXBsZXRlZFwiKTsgZXh0cmFJbml0aWFsaXplcnMucHVzaChhY2NlcHQoZiB8fCBudWxsKSk7IH07XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9ICgwLCBkZWNvcmF0b3JzW2ldKShraW5kID09PSBcImFjY2Vzc29yXCIgPyB7IGdldDogZGVzY3JpcHRvci5nZXQsIHNldDogZGVzY3JpcHRvci5zZXQgfSA6IGRlc2NyaXB0b3Jba2V5XSwgY29udGV4dCk7XHJcbiAgICAgICAgaWYgKGtpbmQgPT09IFwiYWNjZXNzb3JcIikge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSB2b2lkIDApIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0ID09PSBudWxsIHx8IHR5cGVvZiByZXN1bHQgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QgZXhwZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5nZXQpKSBkZXNjcmlwdG9yLmdldCA9IF87XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5zZXQpKSBkZXNjcmlwdG9yLnNldCA9IF87XHJcbiAgICAgICAgICAgIGlmIChfID0gYWNjZXB0KHJlc3VsdC5pbml0KSkgaW5pdGlhbGl6ZXJzLnVuc2hpZnQoXyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKF8gPSBhY2NlcHQocmVzdWx0KSkge1xyXG4gICAgICAgICAgICBpZiAoa2luZCA9PT0gXCJmaWVsZFwiKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICAgICAgZWxzZSBkZXNjcmlwdG9yW2tleV0gPSBfO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh0YXJnZXQpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGNvbnRleHRJbi5uYW1lLCBkZXNjcmlwdG9yKTtcclxuICAgIGRvbmUgPSB0cnVlO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcnVuSW5pdGlhbGl6ZXJzKHRoaXNBcmcsIGluaXRpYWxpemVycywgdmFsdWUpIHtcclxuICAgIHZhciB1c2VWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbml0aWFsaXplcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YWx1ZSA9IHVzZVZhbHVlID8gaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZywgdmFsdWUpIDogaW5pdGlhbGl6ZXJzW2ldLmNhbGwodGhpc0FyZyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdXNlVmFsdWUgPyB2YWx1ZSA6IHZvaWQgMDtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Byb3BLZXkoeCkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInN5bWJvbFwiID8geCA6IFwiXCIuY29uY2F0KHgpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc2V0RnVuY3Rpb25OYW1lKGYsIG5hbWUsIHByZWZpeCkge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN5bWJvbFwiKSBuYW1lID0gbmFtZS5kZXNjcmlwdGlvbiA/IFwiW1wiLmNvbmNhdChuYW1lLmRlc2NyaXB0aW9uLCBcIl1cIikgOiBcIlwiO1xyXG4gICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmLCBcIm5hbWVcIiwgeyBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBwcmVmaXggPyBcIlwiLmNvbmNhdChwcmVmaXgsIFwiIFwiLCBuYW1lKSA6IG5hbWUgfSk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0Lm1ldGFkYXRhID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiBSZWZsZWN0Lm1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXRlcih0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcclxuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxyXG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XHJcbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2dlbmVyYXRvcih0aGlzQXJnLCBib2R5KSB7XHJcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xyXG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBmYWxzZSB9IDogZiA/IGYodikgOiB2OyB9IDogZjsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY1ZhbHVlcyhvKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIG0gPSBvW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSwgaTtcclxuICAgIHJldHVybiBtID8gbS5jYWxsKG8pIDogKG8gPSB0eXBlb2YgX192YWx1ZXMgPT09IFwiZnVuY3Rpb25cIiA/IF9fdmFsdWVzKG8pIDogb1tTeW1ib2wuaXRlcmF0b3JdKCksIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiKSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpKTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpW25dID0gb1tuXSAmJiBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2ID0gb1tuXSh2KSwgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgdi5kb25lLCB2LnZhbHVlKTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIGQsIHYpIHsgUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZnVuY3Rpb24odikgeyByZXNvbHZlKHsgdmFsdWU6IHYsIGRvbmU6IGQgfSk7IH0sIHJlamVjdCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWFrZVRlbXBsYXRlT2JqZWN0KGNvb2tlZCwgcmF3KSB7XHJcbiAgICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb29rZWQsIFwicmF3XCIsIHsgdmFsdWU6IHJhdyB9KTsgfSBlbHNlIHsgY29va2VkLnJhdyA9IHJhdzsgfVxyXG4gICAgcmV0dXJuIGNvb2tlZDtcclxufTtcclxuXHJcbnZhciBfX3NldE1vZHVsZURlZmF1bHQgPSBPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBcImRlZmF1bHRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdiB9KTtcclxufSkgOiBmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBvW1wiZGVmYXVsdFwiXSA9IHY7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayBpbiBtb2QpIGlmIChrICE9PSBcImRlZmF1bHRcIiAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobW9kLCBrKSkgX19jcmVhdGVCaW5kaW5nKHJlc3VsdCwgbW9kLCBrKTtcclxuICAgIF9fc2V0TW9kdWxlRGVmYXVsdChyZXN1bHQsIG1vZCk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnREZWZhdWx0KG1vZCkge1xyXG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBkZWZhdWx0OiBtb2QgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRHZXQocmVjZWl2ZXIsIHN0YXRlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBnZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCByZWFkIHByaXZhdGUgbWVtYmVyIGZyb20gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiBraW5kID09PSBcIm1cIiA/IGYgOiBraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlcikgOiBmID8gZi52YWx1ZSA6IHN0YXRlLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBzdGF0ZSwgdmFsdWUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcIm1cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgbWV0aG9kIGlzIG5vdCB3cml0YWJsZVwiKTtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIHNldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHdyaXRlIHByaXZhdGUgbWVtYmVyIHRvIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4gKGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyLCB2YWx1ZSkgOiBmID8gZi52YWx1ZSA9IHZhbHVlIDogc3RhdGUuc2V0KHJlY2VpdmVyLCB2YWx1ZSkpLCB2YWx1ZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRJbihzdGF0ZSwgcmVjZWl2ZXIpIHtcclxuICAgIGlmIChyZWNlaXZlciA9PT0gbnVsbCB8fCAodHlwZW9mIHJlY2VpdmVyICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZWNlaXZlciAhPT0gXCJmdW5jdGlvblwiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB1c2UgJ2luJyBvcGVyYXRvciBvbiBub24tb2JqZWN0XCIpO1xyXG4gICAgcmV0dXJuIHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgPT09IHN0YXRlIDogc3RhdGUuaGFzKHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgX19leHRlbmRzLFxyXG4gICAgX19hc3NpZ24sXHJcbiAgICBfX3Jlc3QsXHJcbiAgICBfX2RlY29yYXRlLFxyXG4gICAgX19wYXJhbSxcclxuICAgIF9fbWV0YWRhdGEsXHJcbiAgICBfX2F3YWl0ZXIsXHJcbiAgICBfX2dlbmVyYXRvcixcclxuICAgIF9fY3JlYXRlQmluZGluZyxcclxuICAgIF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzLFxyXG4gICAgX19yZWFkLFxyXG4gICAgX19zcHJlYWQsXHJcbiAgICBfX3NwcmVhZEFycmF5cyxcclxuICAgIF9fc3ByZWFkQXJyYXksXHJcbiAgICBfX2F3YWl0LFxyXG4gICAgX19hc3luY0dlbmVyYXRvcixcclxuICAgIF9fYXN5bmNEZWxlZ2F0b3IsXHJcbiAgICBfX2FzeW5jVmFsdWVzLFxyXG4gICAgX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXIsXHJcbiAgICBfX2ltcG9ydERlZmF1bHQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZFNldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxufTtcclxuIiwiaW1wb3J0IHsgQm9yZGVyVHlwZSwgRGlyZWN0aW9ucywgVGVtcGxhdGUgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGJhc2VUZW1wbGF0ZXM6IFBhcnRpYWw8VGVtcGxhdGU+W10gPSBbXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDAsXG5cdFx0d2VpZ2h0OiA0LFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRpZDogMSxcblx0XHR3ZWlnaHQ6IDQsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogMixcblx0XHR3ZWlnaHQ6IDgsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMubGVmdF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdGlkOiAzLFxuXHRcdHdlaWdodDogNCxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmJvdHRvbV06IEJvcmRlclR5cGUuQm9yZGVyLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogNCxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Cb3JkZXIsXG5cdFx0aWQ6IDUsXG5cdFx0d2VpZ2h0OiAxNixcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiA2LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiA4LFxuXHRcdHdlaWdodDogMSxcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogMTMsXG5cdFx0d2VpZ2h0OiAxNixcblx0fSxcblx0e1xuXHRcdFtEaXJlY3Rpb25zLnRvcF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuVm9pZCxcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0aWQ6IDcsXG5cdFx0d2VpZ2h0OiAxLFxuXHR9LFxuXHR7XG5cdFx0W0RpcmVjdGlvbnMudG9wXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5yaWdodF06IEJvcmRlclR5cGUuR3JlZW4sXG5cdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5sZWZ0XTogQm9yZGVyVHlwZS5Wb2lkLFxuXHRcdGlkOiAxNCxcblx0XHR3ZWlnaHQ6IDQsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogQm9yZGVyVHlwZS5HcmVlbixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdGlkOiAxNSxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5cdHtcblx0XHRbRGlyZWN0aW9ucy50b3BdOiBCb3JkZXJUeXBlLlZvaWQsXG5cdFx0W0RpcmVjdGlvbnMucmlnaHRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiBCb3JkZXJUeXBlLkdyZWVuLFxuXHRcdFtEaXJlY3Rpb25zLmxlZnRdOiBCb3JkZXJUeXBlLkJvcmRlcixcblx0XHRpZDogOSxcblx0XHR3ZWlnaHQ6IDEsXG5cdH0sXG5dXG4iLCJleHBvcnQgZnVuY3Rpb24gcmFuZG9tRWxlbWVudDxUPihhcnI6IEFycmF5PFQ+KSB7XG5cdHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRFbXB0eTxUPih2YXJpYWJsZTogVCB8IG51bGwgfCB1bmRlZmluZWQpOiBUIHtcblx0aWYgKCF2YXJpYWJsZSkgdGhyb3cgJ0Fzc2VydGlvbiBmYWlsZWQnXG5cdHJldHVybiB2YXJpYWJsZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm9uWmVybyh2YXJpYWJsZTogbnVtYmVyKTogbnVtYmVyIHtcblx0aWYgKHZhcmlhYmxlID09PSAwKSB7XG5cdFx0Y29uc29sZS5ncm91cENvbGxhcHNlZCgpXG5cdFx0Y29uc29sZS50cmFjZSgpXG5cdFx0Y29uc29sZS5ncm91cEVuZCgpXG5cdFx0ZGVidWdnZXJcblx0XHR0aHJvdyAnQXNzZXJ0aW9uIGZhaWxlZCdcblx0fVxuXHRyZXR1cm4gdmFyaWFibGVcbn1cbiIsImltcG9ydCB7IGJhc2VUZW1wbGF0ZXMgfSBmcm9tICcuL2RhdGEvdGVtcGxhdGUtc2V0LTInXG5pbXBvcnQgeyBEaXJlY3Rpb25zLCBUZW1wbGF0ZSB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBhc3NlcnROb25aZXJvLCByYW5kb21FbGVtZW50IH0gZnJvbSAnLi91dGlscydcblxuLyoqXG4gKiBDcmVhdGVzIHJvdGF0ZWQgY29weSBvZiBvcmlnaW5hbCB0ZW1wbGF0ZVxuICogcG9wdWxhdGVzIHJvdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIHJvdGF0ZVRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSwgdGlja3M6IG51bWJlcik6IFRlbXBsYXRlIHtcblx0c3dpdGNoICh0aWNrcykge1xuXHRcdGNhc2UgMDpcblx0XHRcdHJldHVybiB7IC4uLnRlbXBsYXRlIH1cblx0XHRjYXNlIDE6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDEsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMubGVmdF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnJpZ2h0XTogdGVtcGxhdGVbRGlyZWN0aW9ucy50b3BdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnJpZ2h0XSxcblx0XHRcdFx0W0RpcmVjdGlvbnMubGVmdF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdH1cblx0XHRjYXNlIDI6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDIsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdFx0W0RpcmVjdGlvbnMucmlnaHRdOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLmxlZnRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5ib3R0b21dOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnRvcF0sXG5cdFx0XHRcdFtEaXJlY3Rpb25zLmxlZnRdOiB0ZW1wbGF0ZVtEaXJlY3Rpb25zLnJpZ2h0XSxcblx0XHRcdH1cblx0XHRjYXNlIDM6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi50ZW1wbGF0ZSxcblx0XHRcdFx0cm90YXRpb246IDMsXG5cdFx0XHRcdFtEaXJlY3Rpb25zLnRvcF06IHRlbXBsYXRlW0RpcmVjdGlvbnMucmlnaHRdLFxuXHRcdFx0XHRbRGlyZWN0aW9ucy5yaWdodF06IHRlbXBsYXRlW0RpcmVjdGlvbnMuYm90dG9tXSxcblx0XHRcdFx0W0RpcmVjdGlvbnMuYm90dG9tXTogdGVtcGxhdGVbRGlyZWN0aW9ucy5sZWZ0XSxcblx0XHRcdFx0W0RpcmVjdGlvbnMubGVmdF06IHRlbXBsYXRlW0RpcmVjdGlvbnMudG9wXSxcblx0XHRcdH1cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgJ3JvdGF0ZVRlbXBsYXRlIGV4Y2VwdGlvbidcblx0fVxufVxuXG5mdW5jdGlvbiBidWlsZFRlbXBsYXRlTGlzdCgpOiBUZW1wbGF0ZVtdIHtcblx0Y29uc3Qgb3V0OiBUZW1wbGF0ZVtdID0gW11cblxuXHRjb25zdCBlbnJpY2hlZDogVGVtcGxhdGVbXSA9IGJhc2VUZW1wbGF0ZXMubWFwKFxuXHRcdCh0KTogVGVtcGxhdGUgPT4gKHsgcm90YXRpb246IDAsIHdlaWdodDogMSwgLi4udCB9IGFzIFRlbXBsYXRlKVxuXHQpXG5cblx0ZW5yaWNoZWQuZm9yRWFjaCgodCkgPT4ge1xuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDApKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDEpKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDIpKVxuXHRcdHRyeVB1c2hUZW1wbGF0ZShvdXQsIHJvdGF0ZVRlbXBsYXRlKHQsIDMpKVxuXHR9KVxuXHRyZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHRyeVB1c2hUZW1wbGF0ZShvdXQ6IFRlbXBsYXRlW10sIHQ6IFRlbXBsYXRlKSB7XG5cdGlmIChcblx0XHQhIW91dC5maW5kKFxuXHRcdFx0KGVsKSA9PlxuXHRcdFx0XHRlbFtEaXJlY3Rpb25zLnRvcF0gPT09IHRbRGlyZWN0aW9ucy50b3BdICYmXG5cdFx0XHRcdGVsW0RpcmVjdGlvbnMucmlnaHRdID09PSB0W0RpcmVjdGlvbnMucmlnaHRdICYmXG5cdFx0XHRcdGVsW0RpcmVjdGlvbnMuYm90dG9tXSA9PT0gdFtEaXJlY3Rpb25zLmJvdHRvbV0gJiZcblx0XHRcdFx0ZWxbRGlyZWN0aW9ucy5sZWZ0XSA9PT0gdFtEaXJlY3Rpb25zLmxlZnRdICYmXG5cdFx0XHRcdGVsLmlkID09PSB0LmlkXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm5cblx0fVxuXHRvdXQucHVzaCh0KVxufVxuXG5jb25zdCB0ZW1wbGF0ZXM6IFRlbXBsYXRlW10gPSBidWlsZFRlbXBsYXRlTGlzdCgpXG5cbmV4cG9ydCBjbGFzcyBUaWxlbWFwIHtcblx0cHVibGljIGNhbGxzID0gMFxuXG5cdHB1YmxpYyB0aWxlczogKFRpbGUgfCBudWxsKVtdW10gPSBbXVxuXG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgc2l6ZTogbnVtYmVyID0gNSkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zaXplOyBpKyspIHtcblx0XHRcdHRoaXMudGlsZXNbaV0gPSBbXVxuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnNpemU7IGorKykge1xuXHRcdFx0XHR0aGlzLnRpbGVzW2ldW2pdID0gbmV3IFRpbGUoaSwgaiwgdGhpcylcblx0XHRcdFx0aWYgKGkgPT09IDAgfHwgaiA9PT0gMCB8fCBpID09PSBzaXplIC0gMSB8fCBqID09PSBzaXplIC0gMSkge1xuXHRcdFx0XHRcdHRoaXMudGlsZXNbaV1bal0uY29sbGFwc2VUbygwKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIFByb3BhZ2F0aW9uUHJvY2VzcyA9IGNsYXNzIHtcblx0XHRwcml2YXRlIHE6IFRpbGVbXSA9IFtdXG5cblx0XHRwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSB0aWxlTWFwOiBUaWxlbWFwKSB7fVxuXG5cdFx0cHVibGljIHN0YXJ0KGk6IG51bWJlciwgajogbnVtYmVyKSB7XG5cdFx0XHR0aGlzLnB1c2hUb1EoaSwgailcblx0XHRcdGxldCB0aWxlOiBUaWxlXG5cdFx0XHRsZXQgZ3VhcmQgPSAwXG5cdFx0XHR3aGlsZSAoKHRpbGUgPSB0aGlzLnEuc2hpZnQoKSkpIHtcblx0XHRcdFx0aWYgKGd1YXJkKysgPiAyMDApIHtcblx0XHRcdFx0XHR0aHJvdyAnR3VhcmQgb3ZlcmZsb3cnXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5wcm9wYWdhdGUodGlsZS54LCB0aWxlLnkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cHJpdmF0ZSBwcm9wYWdhdGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcblx0XHRcdGNvbnN0IHNlbGYgPSB0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkpXG5cdFx0XHRpZiAoIXNlbGYpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZmlsdGVyVGFyZ2V0VGVtcGxhdGVzKFxuXHRcdFx0XHRzZWxmLFxuXHRcdFx0XHR0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkgLSAxKSxcblx0XHRcdFx0RGlyZWN0aW9ucy50b3Bcblx0XHRcdClcblx0XHRcdHRoaXMuZmlsdGVyVGFyZ2V0VGVtcGxhdGVzKFxuXHRcdFx0XHRzZWxmLFxuXHRcdFx0XHR0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHggKyAxLCB5KSxcblx0XHRcdFx0RGlyZWN0aW9ucy5yaWdodFxuXHRcdFx0KVxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCwgeSArIDEpLFxuXHRcdFx0XHREaXJlY3Rpb25zLmJvdHRvbVxuXHRcdFx0KVxuXHRcdFx0dGhpcy5maWx0ZXJUYXJnZXRUZW1wbGF0ZXMoXG5cdFx0XHRcdHNlbGYsXG5cdFx0XHRcdHRoaXMudGlsZU1hcC5nZXRUaWxlQXQoeCAtIDEsIHkpLFxuXHRcdFx0XHREaXJlY3Rpb25zLmxlZnRcblx0XHRcdClcblx0XHR9XG5cblx0XHRwcml2YXRlIGZpbHRlclRhcmdldFRlbXBsYXRlcyhcblx0XHRcdHNvdXJjZTogVGlsZSxcblx0XHRcdHRhcmdldDogVGlsZSB8IG51bGwsXG5cdFx0XHRkaXJlY3Rpb246IERpcmVjdGlvbnNcblx0XHQpIHtcblx0XHRcdGlmICghdGFyZ2V0KSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgbmV3VGVtcGxhdGVzOiBUZW1wbGF0ZVtdID0gW11cblxuXHRcdFx0Zm9yIChsZXQgdGFyZ2V0VGVtcGxhdGUgb2YgdGFyZ2V0LnRlbXBsYXRlcykge1xuXHRcdFx0XHRsZXQgcmVzdWx0ID0gZmFsc2Vcblx0XHRcdFx0Zm9yIChsZXQgc291cmNlVGVtcGxhdGUgb2Ygc291cmNlLnRlbXBsYXRlcykge1xuXHRcdFx0XHRcdC8vIGF0IGxlYXN0IG9uZSBvZiBzb3VyY2UgdGVtcGxhdGVzIGZpdHMgdGFyZ2V0IHRlbXBsYXRlXG5cdFx0XHRcdFx0Ly8gd2Uga2VlcCB0aGF0IHRhcmdldCB0ZW1wbGF0ZSBvbiBzb3VyY2Vcblx0XHRcdFx0XHRyZXN1bHQgfHw9IHRoaXMudGlsZU1hcC5jaGVja1RpbGVzKFxuXHRcdFx0XHRcdFx0c291cmNlVGVtcGxhdGUsXG5cdFx0XHRcdFx0XHR0YXJnZXRUZW1wbGF0ZSxcblx0XHRcdFx0XHRcdGRpcmVjdGlvblxuXHRcdFx0XHRcdClcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRcdFx0bmV3VGVtcGxhdGVzLnB1c2godGFyZ2V0VGVtcGxhdGUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIGFzc2VydE5vblplcm8obmV3VGVtcGxhdGVzLmxlbmd0aClcblxuXHRcdFx0aWYgKHRhcmdldC50ZW1wbGF0ZXMubGVuZ3RoICE9PSBuZXdUZW1wbGF0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGZ1cnRoZXIgcHJvcGFnYXRpb24gcmVxdWlyZWRcblx0XHRcdFx0dGhpcy5wdXNoVG9RKHRhcmdldC54LCB0YXJnZXQueSAtIDEpXG5cdFx0XHRcdHRoaXMucHVzaFRvUSh0YXJnZXQueCArIDEsIHRhcmdldC55KVxuXHRcdFx0XHR0aGlzLnB1c2hUb1EodGFyZ2V0LngsIHRhcmdldC55ICsgMSlcblx0XHRcdFx0dGhpcy5wdXNoVG9RKHRhcmdldC54IC0gMSwgdGFyZ2V0LnkpXG5cdFx0XHR9XG5cblx0XHRcdHRhcmdldC5yZXBsYWNlVGVtcGxhdGVzKG5ld1RlbXBsYXRlcylcblx0XHR9XG5cblx0XHRwcml2YXRlIHB1c2hUb1EoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcblx0XHRcdGNvbnN0IGNlbGwgPSB0aGlzLnRpbGVNYXAuZ2V0VGlsZUF0KHgsIHkpXG5cdFx0XHRpZiAoY2VsbCkge1xuXHRcdFx0XHR0aGlzLnEucHVzaChjZWxsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnZXRUaWxlQXQoaTogbnVtYmVyLCBqOiBudW1iZXIpOiBUaWxlIHwgbnVsbCB7XG5cdFx0aWYgKGkgPCAwIHx8IGkgPiB0aGlzLnNpemUgLSAxIHx8IGogPCAwIHx8IGogPiB0aGlzLnNpemUgLSAxKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy50aWxlc1tpXVtqXVxuXHR9XG5cblx0cHJpdmF0ZSBnZXROZXh0VGlsZSgpOiBUaWxlIHwgbnVsbCB7XG5cdFx0bGV0IG1pbjogbnVtYmVyID0gSW5maW5pdHlcblx0XHRsZXQgdGlsZXM6IFRpbGVbXSA9IFtdXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemU7IGkrKykge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnNpemU7IGorKykge1xuXHRcdFx0XHRpZiAodGhpcy50aWxlc1tpXVtqXSkge1xuXHRcdFx0XHRcdGlmICh0aGlzLnRpbGVzW2ldW2pdLmVudGhyb3B5ID09PSAxKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy50aWxlc1tpXVtqXS5lbnRocm9weSA8IG1pbikge1xuXHRcdFx0XHRcdFx0bWluID0gdGhpcy50aWxlc1tpXVtqXS5lbnRocm9weVxuXHRcdFx0XHRcdFx0dGlsZXMgPSBbdGhpcy50aWxlc1tpXVtqXV1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRoaXMudGlsZXNbaV1bal0uZW50aHJvcHkgPT09IG1pbikge1xuXHRcdFx0XHRcdFx0dGlsZXMucHVzaCh0aGlzLnRpbGVzW2ldW2pdKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGlsZXMubGVuZ3RoIDwgMSkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRyZXR1cm4gcmFuZG9tRWxlbWVudDxUaWxlPih0aWxlcylcblx0fVxuXG5cdHB1YmxpYyBjaGVja1RpbGVzKFxuXHRcdHNlbGY6IFRlbXBsYXRlLFxuXHRcdG90aGVyOiBUZW1wbGF0ZSxcblx0XHRkaXJlY3Rpb246IERpcmVjdGlvbnNcblx0KTogYm9vbGVhbiB7XG5cdFx0bGV0IHJlc3VsdDogYm9vbGVhblxuXHRcdHN3aXRjaCAoZGlyZWN0aW9uKSB7XG5cdFx0XHRjYXNlIERpcmVjdGlvbnMudG9wOlxuXHRcdFx0XHRyZXN1bHQgPSBzZWxmW0RpcmVjdGlvbnMudG9wXSA9PT0gb3RoZXJbRGlyZWN0aW9ucy5ib3R0b21dXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIERpcmVjdGlvbnMucmlnaHQ6XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy5yaWdodF0gPT09IG90aGVyW0RpcmVjdGlvbnMubGVmdF1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy5ib3R0b206XG5cdFx0XHRcdHJlc3VsdCA9IHNlbGZbRGlyZWN0aW9ucy5ib3R0b21dID09PSBvdGhlcltEaXJlY3Rpb25zLnRvcF1cblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgRGlyZWN0aW9ucy5sZWZ0OlxuXHRcdFx0XHRyZXN1bHQgPSBzZWxmW0RpcmVjdGlvbnMubGVmdF0gPT09IG90aGVyW0RpcmVjdGlvbnMucmlnaHRdXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXHRcdHRoaXMuY2FsbHMrK1xuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdHByaXZhdGUgY29sbGFwc2VUaWxlKHRpbGU6IFRpbGUpIHtcblx0XHR0aWxlLmNvbGxhcHNlKClcblx0XHRjb25zdCBwcm9wYWdhdGlvbiA9IG5ldyBUaWxlbWFwLlByb3BhZ2F0aW9uUHJvY2Vzcyh0aGlzKVxuXHRcdHByb3BhZ2F0aW9uLnN0YXJ0KHRpbGUueCwgdGlsZS55KVxuXHR9XG5cblx0cHVibGljIGJ1aWxkKCkge1xuXHRcdGxldCB0aWxlOiBUaWxlXG5cdFx0d2hpbGUgKCh0aWxlID0gdGhpcy5nZXROZXh0VGlsZSgpKSkge1xuXHRcdFx0dGhpcy5jb2xsYXBzZVRpbGUodGlsZSlcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXHRwdWJsaWMgdGVtcGxhdGVzOiBUZW1wbGF0ZVtdID0gWy4uLnRlbXBsYXRlc11cblx0cHVibGljIGVudGhyb3B5OiBudW1iZXIgPSB0aGlzLnRlbXBsYXRlcy5sZW5ndGhcblx0cHVibGljIGRlYWQgPSBmYWxzZVxuXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihcblx0XHRwdWJsaWMgeDogbnVtYmVyLFxuXHRcdHB1YmxpYyB5OiBudW1iZXIsXG5cdFx0cHJpdmF0ZSB0aWxlTWFwOiBUaWxlbWFwXG5cdCkge31cblxuXHRwcml2YXRlIGdldFdlaWdodGVkUmFuZG9tVGVtcGxhdGUoKTogVGVtcGxhdGUge1xuXHRcdGFzc2VydE5vblplcm8odGhpcy50ZW1wbGF0ZXMubGVuZ3RoKVxuXHRcdGNvbnN0IHRvdGFsV2VpZ2h0ID0gdGhpcy50ZW1wbGF0ZXMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyLndlaWdodCwgMClcblx0XHRjb25zdCByYW5kb21XZWlnaHQgPSBNYXRoLnJhbmRvbSgpICogdG90YWxXZWlnaHRcblx0XHRsZXQgd2VpZ2h0ID0gMFxuXHRcdGZvciAobGV0IHQgb2YgdGhpcy50ZW1wbGF0ZXMpIHtcblx0XHRcdGlmICh3ZWlnaHQgKyB0LndlaWdodCA+IHJhbmRvbVdlaWdodCkge1xuXHRcdFx0XHRyZXR1cm4gdFxuXHRcdFx0fVxuXHRcdFx0d2VpZ2h0ICs9IHQud2VpZ2h0XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnRlbXBsYXRlc1t0aGlzLnRlbXBsYXRlcy5sZW5ndGggLSAxXVxuXHR9XG5cblx0cHVibGljIGNvbGxhcHNlKCkge1xuXHRcdGlmICh0aGlzLmRlYWQpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRjb25zdCBjb3B5ID0gWy4uLnRoaXMudGVtcGxhdGVzXVxuXHRcdGFzc2VydE5vblplcm8odGhpcy50ZW1wbGF0ZXMubGVuZ3RoKVxuXHRcdC8vIGNvbnN0IHJhbmRvbVRlbXBsYXRlID0gcmFuZG9tRWxlbWVudDxUZW1wbGF0ZT4oY29weSlcblx0XHRjb25zdCByYW5kb21UZW1wbGF0ZSA9IHRoaXMuZ2V0V2VpZ2h0ZWRSYW5kb21UZW1wbGF0ZSgpXG5cdFx0dGhpcy50ZW1wbGF0ZXMgPSBbcmFuZG9tVGVtcGxhdGVdXG5cdFx0dGhpcy5lbnRocm9weSA9IDFcblx0fVxuXG5cdHB1YmxpYyBjb2xsYXBzZVRvKGk6IG51bWJlcikge1xuXHRcdGlmICh0aGlzLmRlYWQpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRhc3NlcnROb25aZXJvKHRoaXMudGVtcGxhdGVzLmxlbmd0aClcblx0XHR0aGlzLnRlbXBsYXRlcyA9IFt0aGlzLnRlbXBsYXRlc1swXV1cblx0XHR0aGlzLmVudGhyb3B5ID0gMVxuXHR9XG5cblx0cHJpdmF0ZSBkaWUoKSB7XG5cdFx0dGhpcy5kZWFkID0gdHJ1ZVxuXHRcdHRoaXMudGlsZU1hcC50aWxlc1t0aGlzLnhdW3RoaXMueV0gPSBudWxsXG5cdH1cblxuXHRwdWJsaWMgcmVwbGFjZVRlbXBsYXRlcyhuZXdUZW1wbGF0ZXM6IFRlbXBsYXRlW10pIHtcblx0XHR0aGlzLnRlbXBsYXRlcyA9IG5ld1RlbXBsYXRlc1xuXHRcdHRoaXMuZW50aHJvcHkgPSB0aGlzLnRlbXBsYXRlcy5sZW5ndGhcblx0XHRpZiAodGhpcy5lbnRocm9weSA8IDEpIHtcblx0XHRcdHRoaXMuZGllKClcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7IENhbGxiYWNrLCBncmFwaGljcyB9IGZyb20gJy4vY2FudmFzL2dyYXBoaWNzJ1xuaW1wb3J0IHsgVGlsZVJlbmRlcmVyIH0gZnJvbSAnLi9jYW52YXMvdGlsZS1yZW5kZXJlcidcbmltcG9ydCB7IFRpbGVtYXAgfSBmcm9tICcuL2dlbmVyYXRvcnMvd2F2ZS1mdW5jdGlvbi1jb2xsYXBzZS90aWxlbWFwJ1xuXG5jb25zdCBnZW5lcmF0ZUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTERpdkVsZW1lbnQ+KCcjZ2VuZXJhdGUnKVxubGV0IGNhbGxiYWNrOiBDYWxsYmFjayB8IG51bGwgPSBudWxsXG5cbmZ1bmN0aW9uIGdlbmVyYXRlKCkge1xuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRncmFwaGljcy5yZW1vdmVEcmF3Q2FsbGJhY2soY2FsbGJhY2spXG5cdH1cblxuXHRjb25zdCB0aWxlTWFwID0gbmV3IFRpbGVtYXAoNjQpXG5cdHRpbGVNYXAuYnVpbGQoKVxuXG5cdGNvbnN0IGl0ZXJhdGlvbnNFbGVtZW50ID1cblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PignI2l0ZXJhdGlvbnMnKVxuXHRpdGVyYXRpb25zRWxlbWVudC5pbm5lclRleHQgPSBOdW1iZXIodGlsZU1hcC5jYWxscykudG9Mb2NhbGVTdHJpbmcoKVxuXG5cdGNvbnN0IHRpbGVSZW5kZXJlciA9IG5ldyBUaWxlUmVuZGVyZXIoZ3JhcGhpY3MpXG5cdGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuXHRcdHRpbGVSZW5kZXJlci5yZW5kZXIodGlsZU1hcClcblx0fVxuXHRncmFwaGljcy5hZGREcmF3Q2FsbGJhY2soY2FsbGJhY2spXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuXHRncmFwaGljcy5pbml0KClcblx0Z3JhcGhpY3MuYW5pbWF0ZSgpXG5cdGdlbmVyYXRlKClcbn0pXG5cbmdlbmVyYXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZ2VuZXJhdGUoKSlcbiJdLCJuYW1lcyI6WyJfYSJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFBLE9BQUEsa0JBQUEsWUFBQTtJQUNDLFNBQTBCLE9BQUEsQ0FBQSxDQUFhLEVBQVMsQ0FBYSxFQUFBO0FBQW5DLFFBQUEsSUFBQSxDQUFBLEtBQUEsS0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFhLEdBQUEsQ0FBQSxDQUFBLEVBQUE7QUFBUyxRQUFBLElBQUEsQ0FB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Q0FBQyxDQUFDLENBQUM7QUFDN0Q7OztBQzNOTyxJQUFNLGFBQWEsR0FBd0I7O0FBRWhELFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNwQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ25DLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDdEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLENBQUM7OztBQUdULFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxJQUFJO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNwQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUN0QyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLE1BQU07QUFDcEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxDQUFDO0FBQ0wsUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLEVBQUU7OztBQUdWLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNsQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDakMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLENBQUM7QUFDTCxRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUcsR0FBQSxVQUFVLENBQUMsTUFBTTtBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDckMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBRyxHQUFBLFVBQVUsQ0FBQyxNQUFNO0FBQ3BDLFFBQUEsRUFBQSxDQUFBLEVBQUUsR0FBRSxFQUFFO0FBQ04sUUFBQSxFQUFBLENBQUEsTUFBTSxHQUFFLEVBQUU7OztBQUdWLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNqQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbkMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3JDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUcsR0FBQSxVQUFVLENBQUMsSUFBSTtBQUNsQyxRQUFBLEVBQUEsQ0FBQSxFQUFFLEdBQUUsQ0FBQztBQUNMLFFBQUEsRUFBQSxDQUFBLE1BQU0sR0FBRSxDQUFDOzs7QUFHVCxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFHLEdBQUEsVUFBVSxDQUFDLEtBQUs7QUFDbEMsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ3BDLFFBQUEsRUFBQSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUcsR0FBQSxVQUFVLENBQUMsS0FBSztBQUNyQyxRQUFBLEVBQUEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFHLEdBQUEsVUFBVSxDQUFDLElBQUk7QUFDbEMsUUFBQSxFQUFBLENBQUEsRUFBRSxHQUFFLEVBQUU7QUFDTixRQUFBLEVBQUEsQ0FBQSxNQUFNLEdBQUUsQ0FBQzs7O0FBR1QsUUFBQSxFQUFBLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRyxHQUFBLFVBQVUsQ0FBQyxLQUFLO0FBQ2xDLFFBQUEsRUFBQSxD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
