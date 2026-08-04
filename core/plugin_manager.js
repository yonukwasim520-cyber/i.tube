const fs = require("fs");
const path = require("path");


class PluginManager {


    constructor(api){

        this.api = api;
        this.plugins = [];

    }



    async loadPlugins(){


        const pluginsPath =
        path.join(
            __dirname,
            "..",
            "plugins"
        );



        if(!fs.existsSync(pluginsPath)){
            return;
        }



        const folders =
        fs.readdirSync(pluginsPath);



        for(const folder of folders){


            const pluginPath =
            path.join(
                pluginsPath,
                folder,
                "plugin.js"
            );



            if(fs.existsSync(pluginPath)){


                try{


                    const plugin =
                    require(pluginPath);



                    if(plugin.activate){


                        await plugin.activate(
                            this.api
                        );



                        this.plugins.push(
                            plugin
                        );



                        console.log(
                            "Loaded Plugin:",
                            plugin.name
                        );


                    }



                }catch(error){


                    console.log(
                        "Plugin Error:",
                        folder,
                        error
                    );


                }


            }


        }


    }


}


module.exports = PluginManager;