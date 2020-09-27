"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const _ = require("lodash");
const net = require("net");
const events_1 = require("events");
const common = require("@screeps/common");
const common_1 = require("@screeps/common");
const databaseMethods = require("./db");
const pubsub = require("./pubsub");
const queueMethods = require("./queue");
const config = Object.assign(common.configManager.config, { storage: new events_1.EventEmitter() });
Object.assign(config.storage, {
    socketListener(socket) {
        const connectionDesc = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`[${connectionDesc}] Incoming connection`);
        socket.on('error', error => console.log(`[${connectionDesc}] Connection error: ${error.message}`));
        const pubsubConnection = pubsub.create();
        new common_1.rpc(socket, _.extend({}, databaseMethods, queueMethods, pubsubConnection.methods));
        socket.on('close', () => {
            pubsubConnection.close();
            console.log(`[${connectionDesc}] Connection closed`);
        });
    }
});
async function start() {
    if (!process.env.STORAGE_PORT) {
        throw new Error('STORAGE_PORT environment variable is not set!');
    }
    if (!process.env.DB_PATH) {
        throw new Error('DB_PATH environment variable is not set!');
    }
    common.configManager.load();
    try {
        await config.storage.loadDb();
        console.log(`Starting storage server`);
        const server = net.createServer(config.storage.socketListener);
        server.on('listening', () => {
            console.log('Storage listening on', process.env.STORAGE_PORT);
            if (process.send) {
                process.send('storageLaunched');
            }
        });
        server.listen(parseInt(process.env.STORAGE_PORT, 10), process.env.STORAGE_HOST || 'localhost');
    }
    catch (error) {
        console.error(error);
    }
}
exports.start = start;
