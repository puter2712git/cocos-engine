const EventTarget = require("../core/event/event-target");
const sys = require("../core/platform.CCSys");
const LoadMode = require("../core/assets/CCAudioClip").LoadMode;

let touchBinded = false;
let touchPlayList = [];

let CustomAudio = function (src) {
    EventTarget.call(this);
    this._src = src;

    // Because <audio> tag doesn't control multiple clips,
    // this object controls multiple <audio> tags with pool,
    this._poolSize = 1;
    this._elementPool = [];
};

cc.js.extend(CustomAudio, EventTarget);

CustomAudio.State = {
    ERROR: -1,
    INITIALIZING: 0,
    PLAYING: 1,
    PAUSED: 2,
    STOPPED: 3,
};

(function (proto) {
    proto._createElement = function () {
        for (let i = 0; i < this._poolSize; i++) {
            let elem = document.createElement("audio");
            elem.src;
        }
    };
});

let CustomAudioElement = function () {
    this._element = null;
    this.volume = 1;

    this._loop = false;
    this._startTime = -1;
    this.playedLength = 0;

    this._currentTimer = null;
};

(function (proto) {
    proto.play = function (offset) {
        this._element.play();
    };

    proto.pause = function () {
        this._element.pause();
    };

    Object.defineProperty(proto, "paused", {
        get: function () {
            return this._element.paused;
        },
        enumerable: true,
        configurable: true,
    });

    Object.defineProperty(proto, "loop", {
        get: function () {
            return this._loop;
        },
        set: function (bool) {
            this._element.loop = bool;
            this._loop = bool;
        },
        enumerable: true,
        configurable: true,
    });

    Object.defineProperty(proto, "volume", {
        get: function () {
            return this._volume;
        },
        set: function (num) {
            this._volume = num;
            this._element.volume = num;
        },
        enumerable: true,
        configurable: true,
    });

    Object.defineProperty(proto, "currentTime");
});
