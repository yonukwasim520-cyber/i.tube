module.exports = {

    name: "Test UI",

    activate(api){

        api.addPage("test_ui");


        api.registerRoute(
            "/api/test",
            "GET",
            (req,res)=>{

                res.json({
                    plugin:"working"
                });

            }
        );

    }

};
