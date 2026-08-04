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
        videos: []
    }
);



async function initDatabase(){

    await db.read();


    if(!db.data){

        db.data = {
            videos: []
        };

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
