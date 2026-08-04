const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");

const PluginManager = require("./core/plugin_manager");
const EventManager = require("./core/events/event_manager");


const app = express();


app.use(express.json());



const events = new EventManager();



const JWT_SECRET = "VideoPlatformSecretKey";





const api = {



    registerRoute(route, method, ...handlers){


        if(method === "GET"){


            app.get(
                route,
                ...handlers
            );


        }



        if(method === "POST"){


            app.post(
                route,
                ...handlers
            );


        }


    },





    addPage(folder){


        const pagePath = path.join(

            __dirname,

            "plugins",

            folder,

            "frontend"

        );



        app.use(

            "/" + folder,

            express.static(pagePath)

        );


    },






    auth(req,res,next){


        const header =
        req.headers.authorization;



        if(!header){


            return res.status(401).json({

                success:false,

                error:"Missing token"

            });


        }




        const token =
        header.replace(
            "Bearer ",
            ""
        );





        try{


            const user =
            jwt.verify(

                token,

                JWT_SECRET

            );



            req.user = user;



            next();



        }catch(error){



            return res.status(401).json({

                success:false,

                error:"Invalid token"

            });


        }


    },






    jwt: jwt,


    jwtSecret: JWT_SECRET,



    events: events


};







const pluginManager =
new PluginManager(api);



pluginManager.loadPlugins();







// تحويل الصفحة الرئيسية إلى الموقع

app.get("/", (req,res)=>{


    res.redirect("/web");


});








// ملفات الصور والفيديوهات

app.use(

    "/uploads",

    express.static(

        path.join(

            __dirname,

            "uploads"

        )

    )

);








const server =

app.listen(

    5900,

    ()=>{


        console.log(

            "Server running on port 5900"

        );


    }

);
