const fs = require("fs");
const xml = require("xml2js");

class RekordXML {
    constructor(location) {
        this.location = location;
        this.data = null;
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
}

module.exports = {
    RekordXML
};