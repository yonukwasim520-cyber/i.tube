const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");


const databaseFile = path.join(
    __dirname,
    "database.json"
);


const adapter = new JSONFile(
    databaseFile
);



const db = new Low(
    adapter,
    {
        users: [],
        channels: [],
        tokens: []
    }
);



async function initDatabase(){


    await db.read();



    if(!db.data){


        db.data = {

            users: [],

            channels: [],

            tokens: []

        };


    }



    db.data.users ||= [];

    db.data.channels ||= [];

    db.data.tokens ||= [];



    await db.write();



    console.log(
        "Accounts Database Connected"
    );


}



module.exports = {

    db,

    initDatabase

};