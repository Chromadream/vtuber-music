import { Entry } from "./db";

const convertType = (currentType: string): "Cover" | "Original" => {
    switch (currentType) {
        case "Music_Cover":
            return 'Cover';
        case "Original_Song":
            return 'Original';
        default:
            return 'Original';
    }
}

const getName = (response: any): string => {
    const channel = response.channel;
    return 'english_name' in channel ? channel.english_name : channel.name;
}

const getMusic = async (holodexApiKey: string, org: "Hololive" | "Nijisanji"): Promise<Entry[]> => {
    try {
        const response = await fetch("https://holodex.net/api/v2/search/videoSearch", {
            method: "POST", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-APIKEY': holodexApiKey
            }, body: JSON.stringify({
                "sort": "newest",
                "lang": [
                  "en",
                  "ja"
                ],
                "target": [
                  "stream"
                ],
                "topic": ["Music_Cover", "Original_Song"],
                "org": [
                  org
                ],
                "comment": [],
                "paginated": true,
                "offset": 0,
                "limit": 5
              })
        });
        const json = (await response.json()) as any;
        const results = json.items;
        return results.filter((result: any) => result.status === "past")
                    .map((result: any) => new Entry(result.id, getName(result) , result.title, convertType(result.topic_id), result.channel.photo));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export { getMusic }