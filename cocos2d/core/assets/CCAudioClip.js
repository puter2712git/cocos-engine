/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

const Asset = require("./CCAsset");
const EventTarget = require("../event/event-target");

function audioBufferToWAVBlob(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2 + 44; // WAV 파일 헤더(44 bytes) 추가

    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    // WAV 파일 헤더 작성
    writeUTFBytes(view, 0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeUTFBytes(view, 8, "WAVE");
    writeUTFBytes(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true); // ByteRate
    view.setUint16(32, numberOfChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeUTFBytes(view, 36, "data");
    view.setUint32(40, length - 44, true);

    // PCM 데이터 작성
    const channelData = new Float32Array(numberOfChannels);
    let offset = 44;

    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            channelData[channel] = audioBuffer.getChannelData(channel)[i];
            view.setInt16(offset, channelData[channel] * 0x7fff, true); // PCM 16비트 포맷
            offset += 2;
        }
    }

    // WAV 데이터로 Blob 생성
    return new Blob([view], { type: "audio/wav" });
}

function writeUTFBytes(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

var LoadMode = cc.Enum({
    WEB_AUDIO: 0,
    DOM_AUDIO: 1,
});

/**
 * !#en Class for audio data handling.
 * !#zh 音频资源类。
 * @class AudioClip
 * @extends Asset
 * @uses EventTarget
 */
var AudioClip = cc.Class({
    name: "cc.AudioClip",
    extends: Asset,
    mixins: [EventTarget],

    ctor() {
        this._loading = false;
        this.loaded = false;

        // the web audio buffer or <audio> element
        this._audio = null;
    },

    properties: {
        /**
         * !#en Get the audio clip duration
         * !#zh 获取音频剪辑的长度
         * @property duration
         * @type {Number}
         */
        duration: 0,
        loadMode: {
            default: LoadMode.WEB_AUDIO,
            type: LoadMode,
        },
        _nativeAsset: {
            get() {
                return this._audio;
            },
            set(value) {
                // HACK: fix load mp3 as audioClip, _nativeAsset is set as audioClip.
                // Should load mp3 as audioBuffer indeed.
                if (value instanceof cc.AudioClip) {
                    this._audio = value._nativeAsset;
                } else {
                    this._audio = value;
                }
                if (this._audio) {
                    this.loaded = true;
                    this.emit("load");
                }

                const wavBlob = audioBufferToWAVBlob(this._audio);
                const blobURL = URL.createObjectURL(wavBlob);
                const audio = new Audio();
                audio.src = blobURL;
            },
            override: true,
        },

        _nativeDep: {
            get() {
                return {
                    uuid: this._uuid,
                    audioLoadMode: this.loadMode,
                    ext: cc.path.extname(this._native),
                    __isNative__: true,
                };
            },
            override: true,
        },
    },

    statics: {
        LoadMode: LoadMode,
        _loadByUrl: function (url, callback) {
            var audioClip = cc.assetManager.assets.get(url);
            if (!audioClip) {
                cc.assetManager.loadRemote(url, function (error, data) {
                    if (error) {
                        return callback(error);
                    }
                    callback(null, data);
                });
            } else {
                callback(null, audioClip);
            }
        },
    },

    _ensureLoaded(onComplete) {
        if (!this.isValid) {
            return;
        }
        if (this.loaded) {
            return onComplete && onComplete();
        } else {
            if (onComplete) {
                this.once("load", onComplete);
            }
            if (!this._loading) {
                this._loading = true;
                let self = this;
                cc.assetManager.postLoadNative(this, function (err) {
                    self._loading = false;
                });
            }
        }
    },

    destroy() {
        cc.audioEngine.uncache(this);
        this._super();
    },
});

/**
 * !#zh
 * 当该资源加载成功后触发该事件
 * !#en
 * This event is emitted when the asset is loaded
 *
 * @event load
 */

cc.AudioClip = AudioClip;
module.exports = AudioClip;
