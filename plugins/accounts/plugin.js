const database = require("./database");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const videosDatabase = require("../videos/database");

const {
    generateSecret,
    generateURI,
    verifySync
} = require("otplib");

const QRCode = require("qrcode");


module.exports = {

    name:"Accounts System",


    async activate(api){

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{

        cb(null,"uploads/channels");

    },


    filename:(req,file,cb)=>{

        cb(
            null,
            Date.now()+path.extname(file.originalname)
        );

    }

});


const upload = multer({
    storage
});

        await database.initDatabase();



        const hashPassword = (password)=>{

            return crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        };



        // =========================
        // Register
        // =========================

        api.registerRoute(
            "/accounts/register",
            "POST",

            async(req,res)=>{


                const {
                    username,
                    password,
                    enable2FA
                } = req.body;



                if(!username || !password){

                    return res.json({
                        success:false,
                        error:"Missing username or password"
                    });

                }



                await database.db.read();



                if(!database.db.data.channels){

                    database.db.data.channels=[];

                }



                const exists =
                database.db.data.users.find(
                    u =>
                    u.username.toLowerCase()
                    === username.toLowerCase()
                );



                if(exists){

                    return res.json({
                        success:false,
                        error:"User already exists"
                    });

                }



                const userId = Date.now();



                let secret = null;


                if(enable2FA === true || enable2FA === "true"){

                    secret = generateSecret();

                }



                const user = {

                    id:userId,

                    username,

                    password:
                    hashPassword(password),

                    twoFA:
                    secret !== null,

                    twoFASecret:
                    secret,

                    created_at:
                    new Date().toISOString()

                };



                const channel = {

                    id:Date.now()+1,

                    user_id:userId,

                    name:
                    username + " Channel",

                    description:
                    "My i.Tube Channel",

                    image:"",

                    link:"",

                    subscribers:[],

                    created_at:
                    new Date().toISOString()

                };



                database.db.data.users.push(user);

                database.db.data.channels.push(channel);



                await database.db.write();



                let qr=null;



                if(secret){


                    const uri =
                    generateURI({

                        issuer:"i.Tube",

                        label:username,

                        secret

                    });



                    qr =
                    await QRCode.toDataURL(uri);


                }



                res.json({

                    success:true,

                    message:"Account created",

                    qr,

                    secret,

                    user:{

                        id:user.id,

                        username:user.username,

                        twoFA:user.twoFA,

                        channel_id:channel.id

                    }

                });


            }

        );






        // =========================
        // Login
        // =========================


        api.registerRoute(
            "/accounts/login",
            "POST",

            async(req,res)=>{


                const {
                    username,
                    password,
                    code
                } = req.body;



                await database.db.read();



                const user =
                database.db.data.users.find(

                    u =>
                    u.username.toLowerCase()
                    === username.toLowerCase()

                );



                if(!user){

                    return res.status(401).json({

                        success:false,

                        error:"Wrong login"

                    });

                }



                if(
                    user.password !==
                    hashPassword(password)
                ){

                    return res.status(401).json({

                        success:false,

                        error:"Wrong login"

                    });

                }



                if(user.twoFA){


                    if(!code){

                        return res.status(401).json({

                            success:false,

                            error:
                            "Authenticator code required"

                        });

                    }



                    const valid =
                    verifySync({

                        token:code,

                        secret:user.twoFASecret

                    });



                    if(!valid){

                        return res.status(401).json({

                            success:false,

                            error:
                            "Invalid authenticator code"

                        });

                    }

                }





                // إنشاء قناة للحسابات القديمة

                if(!database.db.data.channels){

                    database.db.data.channels=[];

                }



                let channel =
                database.db.data.channels.find(

                    c =>
                    c.user_id == user.id

                );



                if(!channel){


                    channel={

                        id:Date.now()+1,

                        user_id:user.id,

                        name:
                        user.username+" Channel",

                        description:
                        "My i.Tube Channel",

                        image:"",

                        link:"",

                        created_at:
                        new Date().toISOString()

                    };


                    database.db.data.channels.push(channel);


                    await database.db.write();


                }





                const token =
                api.jwt.sign(

                    {

                        id:user.id,

                        username:user.username,

                        channel_id:channel.id

                    },


                    api.jwtSecret,


                    {

                        expiresIn:"7d"

                    }

                );




                res.json({

                    success:true,

                    token,


                    user:{

                        id:user.id,

                        username:user.username,

                        twoFA:user.twoFA,

                        channel_id:channel.id

                    }

                });



            }

        );



// Subscribe / Unsubscribe channel

api.registerRoute(
    "/channels/subscribe/:id",
    "POST",
    api.auth,

    async(req,res)=>{

        await database.db.read();

        const channel =
        database.db.data.channels.find(
            c=>c.id == req.params.id
        );


        if(!channel){

            return res.status(404).json({
                success:false,
                error:"Channel not found"
            });

        }


        if(!channel.subscribers){

            channel.subscribers=[];

        }


        const userId=req.user.id;


        if(channel.subscribers.includes(userId)){

            channel.subscribers =
            channel.subscribers.filter(
                id=>id!=userId
            );

        }else{

            channel.subscribers.push(userId);

        }


        await database.db.write();


        res.json({

            success:true,

            subscribers:
            channel.subscribers.length

        });

    }
);



// Get channel

api.registerRoute(
    "/channels/:id",
    "GET",

    async(req,res)=>{

        await database.db.read();


        const channel =
        database.db.data.channels.find(
            c=>c.id == req.params.id
        );


        if(!channel){

            return res.status(404).json({
                success:false,
                error:"Channel not found"
            });

        }


        res.json({

            success:true,

            channel

        });

    }
);



// Update channel

api.registerRoute(
    "/channels/update/:id",
    "POST",

    api.auth,

    async(req,res)=>{


        await database.db.read();


        const channel =
        database.db.data.channels.find(
            c=>c.id == req.params.id
        );


        if(!channel){

            return res.status(404).json({
                success:false,
                error:"Channel not found"
            });

        }



        if(channel.user_id != req.user.id){

            return res.status(403).json({
                success:false,
                error:"No permission"
            });

        }



        channel.name =
        req.body.name || channel.name;


        channel.description =
        req.body.description || channel.description;


        await database.db.write();


        res.json({

            success:true,

            channel

        });


    }
);



// Public channel videos

api.registerRoute(
    "/channels/:id/videos",
    "GET",

    async(req,res)=>{


        await videosDatabase.db.read();


        const videos =
        videosDatabase.db.data.videos || [];


        const result =
        videos.filter(

            v=>

            v.channel_id == req.params.id
            &&
            v.privacy === "public"

        );


        res.json({

            success:true,

            videos:result

        });


    }
);



// Edit channel with image

api.registerRoute(
    "/channels/edit",
    "POST",

    api.auth,

    upload.single("image"),


    async(req,res)=>{


        await database.db.read();


        const channel =
        database.db.data.channels.find(
            c=>c.user_id == req.user.id
        );


        if(!channel){

            return res.json({

                success:false,

                error:"Channel not found"

            });

        }



        if(req.body.name){

            channel.name=req.body.name;

        }



        if(req.body.description){

            channel.description=req.body.description;

        }



        if(req.file){

            channel.image =
            "/uploads/channels/"
            + req.file.filename;

        }



        await database.db.write();



        res.json({

            success:true,

            channel

        });


    }
);



// My channel

api.registerRoute(
    "/channels/my",
    "GET",

    api.auth,

    async(req,res)=>{


        await database.db.read();


        const channel =
        database.db.data.channels.find(
            c=>c.user_id == req.user.id
        );


        if(!channel){

            return res.status(404).json({

                success:false,

                error:"Channel not found"

            });

        }


        res.json({

            success:true,

            channel

        });


    }
);

        // =========================
        // Current user
        // =========================


        api.registerRoute(

            "/accounts/me",

            "GET",

            api.auth,


            async(req,res)=>{


                res.json({

                    success:true,

                    user:req.user

                });


            }

        );


    }


};