const database = require("./database");
const accountsDatabase = require("../accounts/database");

const multer = require("multer");
const path = require("path");
const fs = require("fs");


const db = database.db;
const accountsDB = accountsDatabase.db;



const uploadPath = path.join(
    __dirname,
    "../../storage/videos"
);



if(!fs.existsSync(uploadPath)){

    fs.mkdirSync(
        uploadPath,
        {
            recursive:true
        }
    );

}




const storage = multer.diskStorage({

    destination(req,file,cb){

        cb(null, uploadPath);

    },


    filename(req,file,cb){

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});



const upload = multer({
    storage
});





module.exports = {

    name:"Videos System",



    async activate(api){


        await database.initDatabase();

        await accountsDatabase.initDatabase();


api.registerRoute(
    "/videos/owner",
    "GET",
    api.auth,

    async(req,res)=>{

        await database.db.read();

        const videos =
        database.db.data.videos || [];


        const myVideos =
        videos.filter(
            v => v.owner_id == req.user.id
        );


        res.json({
            success:true,
            videos:myVideos
        });

    }
);

api.registerRoute(
    "/videos/edit/:id",
    "POST",
    api.auth,

    async(req,res)=>{

        await database.db.read();


        const video =
        database.db.data.videos.find(
            v => v.id == req.params.id
        );


        if(!video){

            return res.json({
                success:false,
                error:"Video not found"
            });

        }


        if(video.owner_id != req.user.id){

            return res.status(403).json({
                success:false,
                error:"Not owner"
            });

        }


        video.title =
        req.body.title || video.title;


        video.description =
        req.body.description || video.description;


        video.privacy =
        req.body.privacy || video.privacy;


        await database.db.write();


        res.json({
            success:true,
            video
        });


    }
);

api.registerRoute(
    "/videos/remove/:id",
    "POST",
    api.auth,

    async(req,res)=>{


        await database.db.read();


        const index =
        database.db.data.videos.findIndex(
            v => v.id == req.params.id
        );


        if(index === -1){

            return res.json({
                success:false,
                error:"Video not found"
            });

        }


        const video =
        database.db.data.videos[index];


        if(video.owner_id != req.user.id){

            return res.status(403).json({
                success:false,
                error:"Not owner"
            });

        }


        database.db.data.videos.splice(index,1);


        await database.db.write();


        res.json({
            success:true
        });


    }
);

        // =========================
// Upload Video
// =========================

api.registerRoute(
    "/videos/upload",
    "POST",

    api.auth,

    upload.single("video"),


    async(req,res)=>{


        const {

            title,

            description,

            privacy

        } = req.body;



        if(!req.file){

            return res.json({

                success:false,

                error:"No video file"

            });

        }



        await db.read();

        await accountsDB.read();





        // جلب قناة المستخدم تلقائياً

        const channel =

        accountsDB.data.channels.find(

            c =>

            c.user_id == req.user.id

        );





        if(!channel){


            return res.status(403).json({

                success:false,

                error:"No channel found"

            });


        }


        const video = {

    id: Date.now(),

    owner_id: req.user.id,

    channel_id: channel.id,

    title: title || "Untitled Video",

    description: description || "",

    file: req.file.filename,

    privacy: privacy || "public",

    type: req.body.type || "normal",

    likes: [],

    dislikes: [],

    views: 0,

    created_at: new Date().toISOString()

};





        if(!db.data.videos){

            db.data.videos=[];

        }



        db.data.videos.push(video);



        await db.write();





        res.json({

            success:true,

            message:"Video uploaded",

            video

        });



    }

);










        // كل الفيديوهات
        api.registerRoute(
    "/videos/list",
    "GET",

    async(req,res)=>{


        await db.read();

        await accountsDB.read();



        const videos =
        db.data.videos.filter(video=>{


            // عرض الفيديوهات العامة فقط
            if(video.privacy === "public"){

                return true;

            }


            // الفيديو الخاص لا يظهر هنا
            return false;


        }).map(video=>{


            const channel =
            accountsDB.data.channels.find(
                c=>c.id == video.channel_id
            );


            return {

                ...video,

                channel_name:
                channel ? channel.name : "Unknown",


                subscribers:
                channel && channel.subscribers
                ? channel.subscribers.length
                : 0

            };


        });



        res.json(videos);


    }

);

    const channel =
    accountsDB.data.channels.find(
        c=>c.id == video.channel_id
    );


    return {

        ...video,

        channel_name:
        channel ? channel.name : "Unknown",

        subscribers:
        channel && channel.subscribers
        ? channel.subscribers.length
        : 0

    };

});


res.json(videos);


            }

        );


api.registerRoute(
    "/channels/:id/videos",
    "GET",

    async(req,res)=>{

        await db.read();


        const videos =
        db.data.videos.filter(

            v=>

            v.channel_id == req.params.id
            &&
            v.privacy == "public"

        );


        res.json({

            success:true,

            videos

        });


    }
);


api.registerRoute(
    "/videos/like/:id",
    "POST",

    api.auth,

    async(req,res)=>{


        await db.read();


        const video =
        db.data.videos.find(
            v =>
            v.id == req.params.id
        );


        if(!video){

            return res.status(404).json({
                error:"Video not found"
            });

        }



        if(!video.likes){

            video.likes=[];

        }


        if(!video.dislikes){

            video.dislikes=[];

        }



        const userId =
        req.user.id;



        if(video.likes.includes(userId)){


            video.likes =
            video.likes.filter(
                id=>id != userId
            );


        }else{


            video.likes.push(userId);



            video.dislikes =
            video.dislikes.filter(
                id=>id != userId
            );


        }



        await db.write();



        res.json({

            success:true,

            likes:video.likes.length,

            dislikes:video.dislikes.length

        });


    }

);

api.registerRoute(
    "/videos/owner",
    "GET",
    api.auth,

    async(req,res)=>{

        await videosDatabase.db.read();

        const videos =
        (videosDatabase.db.data.videos || []).filter(
            v => v.owner_id == req.user.id
        );

        res.json({

            success:true,

            videos

        });

    }

);

api.registerRoute(
    "/videos/dislike/:id",
    "POST",

    api.auth,

    async(req,res)=>{


        await db.read();


        const video =
        db.data.videos.find(
            v =>
            v.id == req.params.id
        );



        if(!video){

            return res.status(404).json({
                error:"Video not found"
            });

        }



        if(!video.likes){

            video.likes=[];

        }


        if(!video.dislikes){

            video.dislikes=[];

        }



        const userId =
        req.user.id;



        if(video.dislikes.includes(userId)){


            video.dislikes =
            video.dislikes.filter(
                id=>id != userId
            );


        }else{


            video.dislikes.push(userId);



            video.likes =
            video.likes.filter(
                id=>id != userId
            );


        }



        await db.write();



        res.json({

            success:true,

            likes:video.likes.length,

            dislikes:video.dislikes.length

        });


    }

);



        // فيديوهات المستخدم
        api.registerRoute(
            "/videos/my",
            "GET",

            api.auth,


            async(req,res)=>{


                await db.read();

                await accountsDB.read();




                const channels =
                accountsDB.data.channels.filter(

                    c =>
                    c.user_id == req.user.id

                );



                const ids =
                channels.map(

                    c=>c.id

                );




                const videos =
                db.data.videos.filter(

                    v =>
                    ids.includes(
                        Number(v.channel_id)
                    )

                );




                res.json({

                    success:true,

                    videos

                });



            }

        );









        // تعديل فيديو
        api.registerRoute(
            "/videos/update/:id",
            "POST",

            api.auth,


            async(req,res)=>{


                await db.read();

                await accountsDB.read();



                const video =
                db.data.videos.find(

                    v =>
                    v.id == req.params.id

                );



                if(!video){

                    return res.status(404).json({

                        error:"Video not found"

                    });

                }




                const channel =
                accountsDB.data.channels.find(

                    c =>
                    c.id == video.channel_id &&
                    c.user_id == req.user.id

                );



                if(!channel){

                    return res.status(403).json({

                        error:"No permission"

                    });

                }




                video.title =
                req.body.title ||
                video.title;



                video.description =
                req.body.description ||
                video.description;



                video.privacy =
                req.body.privacy ||
                video.privacy;




                await db.write();




                res.json({

                    success:true,

                    video

                });



            }

        );










        // حذف فيديو
        api.registerRoute(
            "/videos/delete/:id",
            "POST",

            api.auth,


            async(req,res)=>{


                await db.read();

                await accountsDB.read();




                const index =
                db.data.videos.findIndex(

                    v =>
                    v.id == req.params.id

                );



                if(index === -1){

                    return res.status(404).json({

                        error:"Video not found"

                    });

                }




                const video =
                db.data.videos[index];





                const channel =
                accountsDB.data.channels.find(

                    c =>
                    c.id == video.channel_id &&
                    c.user_id == req.user.id

                );



                if(!channel){

                    return res.status(403).json({

                        error:"No permission"

                    });

                }





                const file =
                path.join(

                    uploadPath,

                    video.file

                );




                if(fs.existsSync(file)){

                    fs.unlinkSync(file);

                }




                db.data.videos.splice(
                    index,
                    1
                );



                await db.write();




                res.json({

                    success:true,

                    message:"Video deleted"

                });



            }

        );








        // تشغيل الفيديو مع Range Requests
        api.registerRoute(
            "/videos/watch/:file",
            "GET",


            async(req,res)=>{


                const filePath =
                path.join(

                    uploadPath,

                    req.params.file

                );



                if(!fs.existsSync(filePath)){

                    return res.status(404).end();

                }




                const size =
                fs.statSync(filePath).size;



                const range =
                req.headers.range;



                if(!range){


                    res.writeHead(200,{

                        "Content-Length":size,

                        "Content-Type":"video/mp4"

                    });



                    fs.createReadStream(filePath)
                    .pipe(res);


                    return;

                }




                const parts =
                range.replace(
                    /bytes=/,
                    ""
                ).split("-");



                const start =
                parseInt(parts[0]);



                const end =
                parts[1]
                ? parseInt(parts[1])
                : size - 1;



                const chunk =
                end-start+1;




                res.writeHead(206,{

                    "Content-Range":
                    `bytes ${start}-${end}/${size}`,

                    "Accept-Ranges":"bytes",

                    "Content-Length":chunk,

                    "Content-Type":"video/mp4"

                });



                fs.createReadStream(

                    filePath,

                    {
                        start,
                        end
                    }

                ).pipe(res);



            }

        );




    }

};