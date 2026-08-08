module.exports = {

    name:"Event Test",

    activate(api){


        api.events.on(
            "video_uploaded",
            (video)=>{

                console.log(
                    "New Video:",
                    video.title
                );

            }
        );


        api.registerRoute(
            "/test/upload",
            "GET",
            (req,res)=>{


                const video = {
                    title:"My First Video"
                };


                api.events.emit(
                    "video_uploaded",
                    video
                );


                res.json({
                    success:true
                });


            }
        );


    }

};
