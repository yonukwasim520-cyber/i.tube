module.exports = {

    name: "Example Plugin",

    activate(api) {

        console.log("Example Plugin Activated");

        api.registerRoute(
            "/hello",
            "GET",
            (req, res) => {

                res.json({
                    message: "Hello from plugin"
                });

            }
        );

    }

};