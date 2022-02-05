const CONSTANTS = require("./constants");

// "Type" in position_mark (cue points)
// 0 = 0b000 = normal
// 4 = 0b100 = loop

class Track {
    constructor(id, name, artist) {
        this.trackID = id;
        this.name = name;
        this.artist = artist;
        this.composer = "";
        this.album = "";
        this.grouping = "";
        this.genres = "";
        this.kind = "";
        this.size = "";
        this.totalTime = "";
        this.discNumber = "";
        this.trackNumber = "";
        this.year = "";
        this.averageBPM = "";
        this.dateAdded = "";
        this.bitRate = "";
        this.sampleRate = "";
        this.comments = "";
        this.playCount = "";
        this.rating = "";
        this.location = "";
        this.remixer = "";
        this.tonality = "";
        this.label = "";
        this.mix = "";
        this.tempo = [];
        this.cues = [];
        this.hotCues = [];
    }
    get title() {return this.name;}

    addTempo(initialTime, bpm, signature, beat) {
        this.tempo.push({initialTime, bpm, signature, beat});
    }

    addCuePoint(name, startTime, endTime) {
        let cue = {
            name: name,
            type: 0,
            startTime: startTime,
        };
        if(endTime ?? false) {
            cue.type = 4;
            cue.endTime = endTime;
        }
        this.cues.push(cue);
    }
    addHotCue(name, num, startTime, endTime, color) {
        let cue = {
            name: name,
            type: 0,
            startTime: startTime,
            color: color ?? CONSTANTS.DEFAULT_COLOR,
            number: num,
        };
        if(endTime ?? false) {
            cue.type = 4;
            cue.endTime = endTime;
        }
        this.hotCues.push(cue);
    }

    get xml() {
        return {
            "$": {
                TrackID: this.trackID, // The internally used ID of the track
                Name: this.name, // The name of the track which the user sees
                Artist: this.artist, // The artist of the track which the user sees
                Composer: this.composer, // The composer "..."
                Album: this.album, // The album "..."
                Grouping: this.grouping, // TODO: Not entirely sure what this is...
                Genre: this.genres[0], // The primary genre of a track (grabbing [0] but we can [].join(","))
                Kind: this.kind, //'MP3 File', // The kind of track (MP3 File, MP4 File, etc) -- verify()
                Size: this.size, // The size of the file in bytes -- verify()
                TotalTime: this.totalTime, // The total length of the song in seconds -- verify()
                DiscNumber: this.discNumber, // The disc number of the track
                TrackNumber: this.trackNumber, // The track number on the disc
                Year: this.year, // The year this track was released
                AverageBpm: this.averageBPM, // The most common BPM of the track - only for visual purposes
                DateAdded: this.dateAdded, // The date this track was added to the collection
                BitRate: this.bitRate, // The bitrate of the track -- verify()
                SampleRate: this.sampleRate, // The sample rate of the track -- verify()
                Comments: this.comments, // The user specified comments on the track
                PlayCount: this.playCount, // How many times this track was played
                Rating: this.rating, // The rating the track the user has given it
                Location: this.location, // The location on disk that this track belongs
                Remixer: this.remixer, // The remixer of the track
                Tonality: this.tonality, // The key of the track (visual only?)
                Label: this.label, // The label that this track belongs to 
                Mix: this.mix, // Absolutely zero clue on this one.
            },
            "TEMPO": this.tempo.map(t => ({
                "$": {
                    "Inizio": t.initialTime,
                    "Bpm": t.bpm,
                    "Metro": t.signature,
                    "Battito": t.beat,
                }
            })),
            "POSITION_MARK": [...this.cues, ...this.hotCues].map(c => {
                let cuePoint = {
                    "$": {
                        "Name": c.name,
                        "Type": c.type,
                        "Start": c.start,
                        "Num": "-1",
                    }
                };
                if(c.end) cuePoint.$.End = c.end;
                if(c.number >= 0) {
                    cuePoint.$.Num = c.number;
                    cuePoint.$.Red = c.colour.red;
                    cuePoint.$.Green = c.colour.green;
                    cuePoint.$.Blue = c.colour.blue;
                }
                return cuePoint;
            })
        };
    }

    static generate(track) {
        let t = new Track(track.$.TrackID, track.$.Name, track.$.Artist);
        t.composer = track.$.Composer;
        t.album = track.$.Album;
        t.grouping = track.$.Grouping;
        t.genres = track.$.Genre;
        t.kind = track.$.Kind;
        t.size = track.$.Size;
        t.totalTime = track.$.TotalTime;
        t.discNumber = track.$.DiscNumber;
        t.trackNumber = track.$.TrackNumber;
        t.year = track.$.Year;
        t.averageBPM = track.$.AverageBpm;
        t.dateAdded = track.$.DateAdded;
        t.bitRate = track.$.BitRate;
        t.sampleRate = track.$.SampleRate;
        t.comments = track.$.Comments;
        t.playCount = track.$.PlayCount;
        t.rating = track.$.Rating;
        t.location = track.$.Location;
        t.remixer = track.$.Remixer;
        t.tonality = track.$.Tonality;
        t.label = track.$.Label;
        t.mix = track.$.Mix;

        for(let tempo of track.TEMPO ?? []) {
            t.addTempo(tempo.$.Inizio, tempo.$.Bpm, tempo.$.Metro, tempo.$.Battito);
        }
        for(let cue of track.POSITION_MARK ?? []) {
            if(cue.$.Num >= 0) {
                t.addHotCue(cue.$.Name, cue.$.Num, cue.$.Start, cue.$.End, {red: cue.$.Red, green: cue.$.Green, blue: cue.$.Blue});
            } else {
                t.addCuePoint(cue.$.Name, cue.$.Start, cue.$.End);
            }
        }

        return t;
    }
}

module.exports = Track;