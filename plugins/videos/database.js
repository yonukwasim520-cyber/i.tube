const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");

const file = path.join(
    __dirname,
    "videos.json"
);

const adapter = new JSONFile(file);

const db = new Low(
    adapter,
    {
        videos: [],
        comments: []
    }
);

async function initDatabase(){

    await db.read();

    if(!db.data){

        db.data = {
            videos: [],
            comments: []
        };

    }

    // حماية من قواعد البيانات القديمة
    if(!Array.isArray(db.data.videos)){

        db.data.videos = [];

    }

    if(!Array.isArray(db.data.comments)){

        db.data.comments = [];

    }

    await db.write();

    console.log(
        "Videos Database Connected"
    );

}

module.exports = {
    db,
    initDatabase
};