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

const getMusic = async (holodexApiKey: string, org: "Hololive" | "Nijisanji"): Promise<Entry[]> => {
    try {
        const response = await fetch("https://holodex.net/api/v2/search/videoSearch", {
            method: "POST", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-APIKEY': holodexApiKey
            }, body: JSON.stringify({
                "sort": "oldest",
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
                "limit": 30
              })
        });
        const json = (await response.json()) as any;
        const results = json.items;
        return results.filter((result: any) => result.status === "past")
                    .map((result: any) => new Entry(result.id, result.channel.english_name, result.title, convertType(result.topic_id)));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export { getMusic }