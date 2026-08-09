const dgram = require("dgram");
const { Bonjour } = require("bonjour-service");


const HTTP_PORT = 5900;
const UDP_PORT = 41234;


// --------------------
// mDNS Bonjour
// --------------------

const bonjour = new Bonjour();


bonjour.publish({

    name: "i.Tube",

    type: "http",

    port: HTTP_PORT

});


console.log(
    "mDNS: i.Tube.local published"
);



// --------------------
// UDP Discovery
// --------------------

const udp = dgram.createSocket("udp4");


udp.on("message", (msg, rinfo)=>{


    if(msg.toString() === "DISCOVER_ITUBE"){


        const response = JSON.stringify({

            name:"i.Tube",

            host:rinfo.address,

            port:HTTP_PORT

        });


        udp.send(

            response,

            rinfo.port,

            rinfo.address

        );


    }


});



udp.bind(UDP_PORT, ()=>{


    udp.setBroadcast(true);


    console.log(
        "UDP Discovery running"
    );


});
