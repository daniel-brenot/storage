"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueReset = exports.queueWhenAllDone = exports.queueAddMulti = exports.queueAdd = exports.queueMarkDone = exports.queueFetch = void 0;
const _ = require("lodash");
const pubsub = require("./pubsub");
const events_1 = require("events");
const queues = {
    usersLegacy: {
        pending: [],
        processing: [],
        emitter: new events_1.EventEmitter()
    },
    usersIvm: {
        pending: [],
        processing: [],
        emitter: new events_1.EventEmitter()
    },
    rooms: {
        pending: [],
        processing: [],
        emitter: new events_1.EventEmitter()
    }
};
function queueFetch(name, cb) {
    try {
        const check = function () {
            if (!queues[name].pending.length) {
                queues[name].emitter.once('add', check);
                return;
            }
            const item = queues[name].pending.pop();
            queues[name].processing.push(item);
            cb(null, item);
        };
        check();
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueFetch = queueFetch;
function queueMarkDone(name, id, cb) {
    try {
        _.pull(queues[name].processing, id);
        queues[name].emitter.emit('done');
        if (!!cb)
            cb(null, true);
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueMarkDone = queueMarkDone;
function queueAdd(name, id, cb) {
    try {
        queues[name].pending.push(id);
        queues[name].emitter.emit('add');
        if (!!cb)
            cb(null, true);
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueAdd = queueAdd;
function queueAddMulti(name, array, cb) {
    try {
        queues[name].pending = queues[name].pending.concat(array);
        queues[name].emitter.emit('add');
        if (!!cb)
            cb(null, true);
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueAddMulti = queueAddMulti;
function queueWhenAllDone(name, cb) {
    try {
        const check = function () {
            if (queues[name].pending.length || queues[name].processing.length) {
                queues[name].emitter.once('done', check);
                return;
            }
            pubsub.publish('queueDone:' + name, '1');
            cb(null, true);
        };
        check();
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueWhenAllDone = queueWhenAllDone;
function queueReset(name, cb) {
    try {
        queues[name].pending = [];
        queues[name].processing = [];
        queues[name].emitter.emit('done');
        if (!!cb)
            cb(null, true);
    }
    catch (e) {
        cb(e.message);
        console.error(e);
    }
}
exports.queueReset = queueReset;
