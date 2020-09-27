"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.publish = void 0;
const events_1 = require("events");
const subs = {};
let id = 0;
const emitter = new events_1.EventEmitter();
emitter.setMaxListeners(0);
function publish(channel, data, cb) {
    emitter.emit(channel, { channel, data });
    emitter.emit('*', { channel, data });
    if (!!cb)
        cb(null);
}
exports.publish = publish;
function create() {
    const connId = id++;
    const connSubs = subs[connId] = [];
    return {
        methods: {
            publish,
            subscribe(channel, listener) {
                connSubs.push([channel, listener]);
                emitter.on(channel, listener);
                return () => {
                    emitter.removeListener(channel, listener);
                };
            },
        },
        close() {
            connSubs.forEach(i => emitter.removeListener(i[0], i[1]));
            delete subs[connId];
        }
    };
}
exports.create = create;
