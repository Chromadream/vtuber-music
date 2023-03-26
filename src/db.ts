class Entry {
    public youtubeID: string;
    public channelName: string;
    public title: string;
    public contentType: string;
    constructor(youtubeID: string, channelName: string, title: string, contentType: string) {
        this.youtubeID = youtubeID;
        this.channelName = channelName;
        this.title = title;
        this.contentType = contentType;
    }
}

const getPreparedStatement = (count: number): string => {
    let str = "?1";
    for (let index = 2; index <= count; index++) {
        str = `${str},?${index}`
    }
    return str;
}

const diffNewEntries = async (db: D1Database, entries: Entry[]): Promise<Entry[]> => {
    const {results} = await db.prepare(`SELECT * FROM Links WHERE youtubeID in (${getPreparedStatement(entries.length)})`)
                        .bind(...entries.map(entry => entry.youtubeID))
                        .all();
    const rows = (results as Entry[]);
    return entries.filter(entry => rows.findIndex(row => row.youtubeID === entry.youtubeID) === -1);
}

const saveNewEntries = async (db: D1Database, entries: Entry[]): Promise<boolean> => {
    const {success} = await db.prepare(`INSERT INTO Links (youtubeID, channelName, title, contentType) VALUES (${getPreparedStatement(entries.length * 4)})`)
                        .bind(...(entries.map(entry => [entry.youtubeID, entry.channelName, entry.title, entry.contentType]).flat()))
                        .run();
    console.log(`Adding ${entries.length} of new entries: ${success}`);
    return success;
}

export {Entry, diffNewEntries, saveNewEntries};