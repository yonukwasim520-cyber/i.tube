const dgram = require("dgram");
const os = require("os");

const HTTP_PORT = 5900;
const UDP_PORT = 41234;

// ================================
// Find server LAN IPv4
// ================================
function getLocalIPv4() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const info of interfaces[name] || []) {
            if (
                info.family === "IPv4" &&
                !info.internal &&
                !info.address.startsWith("127.")
            ) {
                return info.address;
            }
        }
    }

    return "127.0.0.1";
}

const serverIP = getLocalIPv4();

console.log("i.Tube Discovery IP:", serverIP);

// ================================
// UDP Discovery
// ================================
const udp = dgram.createSocket("udp4");

udp.on("error", (err) => {
    console.error("UDP Discovery error:", err);
});

// Every device can discover independently.
// There is NO single-client state.
udp.on("message", (msg, rinfo) => {
    const message = msg.toString().trim();

    if (message !== "DISCOVER_ITUBE") {
        return;
    }

    const response = JSON.stringify({
        name: "i.Tube",
        host: serverIP,
        port: HTTP_PORT
    });

    udp.send(
        Buffer.from(response),
        0,
        Buffer.byteLength(response),
        rinfo.port,
        rinfo.address,
        (err) => {
            if (err) {
                console.error(
                    "Discovery response error:",
                    err.message
                );
            } else {
                console.log(
                    `Discovery response -> ${rinfo.address}:${rinfo.port}`
                );
            }
        }
    );
});

udp.bind(UDP_PORT, "0.0.0.0", () => {
    udp.setBroadcast(true);

    console.log(
        `UDP Discovery running on ${serverIP}:${UDP_PORT}`
    );
});
