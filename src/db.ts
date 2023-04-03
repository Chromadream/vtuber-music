class Entry {
    public youtubeID: string;
    public channelName: string;
    public title: string;
    public contentType: string;
    public channelProfileImage?: string;
    constructor(youtubeID: string, channelName: string, title: string, contentType: string, channelProfileImage?: string) {
        this.youtubeID = youtubeID;
        this.channelName = channelName;
        this.title = title;
        this.contentType = contentType;
        this.channelProfileImage = channelProfileImage;
    }
}

const mapEntriesToSelect = (entries: Entry[]): string => entries.map(entry => `'${entry.youtubeID}'`).reduce((prev, cur) => `${prev},${cur}`, "").substring(1);

const diffNewEntries = async (db: D1Database, entries: Entry[]): Promise<Entry[]> => {
    const stmt = `SELECT * FROM Links WHERE youtubeID in (${mapEntriesToSelect(entries)})`;
    const {results} = await db.prepare(stmt)
                        .all();
    const rows = (results as Entry[]);
    return entries.filter(entry => rows.findIndex(row => row.youtubeID === entry.youtubeID) === -1);
}

const mapEntriesToInsert = (entries: Entry[]): string => {
    return entries.map(entry => `('${entry.youtubeID}', '${entry.channelName}', '${entry.title}', '${entry.contentType}')`)
                  .reduce((prev, cur) => `${prev},${cur}`, "")
                  .substring(1);
}

const saveNewEntries = async (db: D1Database, entries: Entry[]): Promise<boolean> => {
    if (entries.length === 0){
        return true;
    }
    const stmt = `INSERT INTO Links (youtubeID, channelName, title, contentType) VALUES (${mapEntriesToInsert(entries)})`;
    console.log(stmt);
    const {success} = await db.prepare(`INSERT INTO Links (youtubeID, channelName, title, contentType) VALUES ${mapEntriesToInsert(entries)}`)
                        .run();
    console.log(`Adding ${entries.length} of new entries: ${success}`);
    return success;
}

export {Entry, diffNewEntries, saveNewEntries};