import Collection from "./collection";

const fs = require("fs");

/**
 * @extends Collection
 */
export default class EmojiCollection extends Collection {
    /**
     * @param {Array<Object>} emojis
     */
    constructor(emojis: Array<any> = []) {
        super(emojis);
    }

    /**
     * @param {String} name
     * @returns {String}
     */
    get(name: string) {
        return this.find("name", name).id;
    }

    /**
     * @param {String} path
     * @returns {EmojiCollection}
     */
    static fromFile(path: string) {
        if (!fs.existsSync(path)) {
            throw new Error(`[EmojiCollection.fromFile] Path does not exist: ${path}`);
        }

        return new EmojiCollection(JSON.parse(fs.readFileSync(path).toString()));
    }
}