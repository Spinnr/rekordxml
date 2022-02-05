const fs = require("fs");
const xml = require("xml2js");

const CONSTANTS = require("./constants.js");
const Track = require("./track");

class RekordXML {
    constructor(location) {
        this.location = location;
        this.data = null;
        this.caches = {};
    }

    async read() {
        try {
            let data = await fs.promises.readFile(this.location);
            let xmlData = await xml.parseStringPromise(data);
            this.data = xmlData;
        } catch(e) {
            console.error(e);
            return false;
        }
        return true;
    }
    async save() {
        try {
            await fs.promises.writeFile(this.location, this.data);
        } catch(e) {
            console.error(e);
            return false;
        }
        return true;
    }
    async verify(eventEmitter) {
        eventEmitter = eventEmitter ?? new EventEmitter();
        console.log("Track verification is not implemented yet.");
    }

    get version() {
        return this.data?.DJ_PLAYLISTS.$.Version;
    }

    get collection() {
        if(this.caches.collection) return this.caches.collection;
        return (this.caches.collection = this.data?.DJ_PLAYLISTS.COLLECTION[0].TRACK.map(track => Track.generate(track)));
    }

    getTrackByID(trackID) {
        if(this.caches.tracks?.[trackID]) return this.caches.tracks[trackID];
        this.caches.tracks = this.caches.tracks ?? [];
        return (this.caches.tracks[trackID] = this.collection.find(track => track.trackID == trackID));
    }
}

module.exports = RekordXML;