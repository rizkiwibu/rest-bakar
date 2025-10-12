require("dotenv").config(); // Load .env file
const path = require("path");
const fs = require("fs");
const Fastify = require("fastify");
const autoload = require("@fastify/autoload");
const fastifyStatic = require("@fastify/static");
const fastify = require("fastify")({ logger: true });

if (!process.env.PORT) {
    console.error("❌ ERROR: PORT harus diatur di file .env");
    process.exit(1);
}

const PORT = process.env.PORT; // Pastikan PORT selalu berasal dari .env

const app = Fastify({
    logger: process.env.NODE_ENV === "production" ? true : {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
            },
        },
    },
});

app.register(require("./plugins/swagger"));
app.register(require("./middlewares/rateLimit"));
app.register(require("./middlewares/logger"));
app.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
});

app.register(autoload, {
    dir: path.join(__dirname, "routes"),
    options: { prefix: "/api" },
});

app.register(require("@fastify/view"), {
    engine: { ejs: require("ejs") },
    root: path.join(__dirname, "views"),
});

app.get("/", (request, reply) => {
    reply.view("index.ejs", { title: "Dashboard" });
});

app.get("/donasi", (request, reply) => {
    reply.view("donasi.ejs", { title: "Donasi" });
});

app.get("/hentai", (request, reply) => {
    reply.view("hentai.ejs", { title: "hentaividio" });
});
app.get("/profile", (request, reply) => {
    reply.view("dashboard.ejs", { title: "profile" });
});

app.get("/animeku", (request, reply) => {
    reply.view("putarvidio.ejs", { title: "animeku" });
});

app.get("/upload", (request, reply) => {
    reply.redirect("https://uploader.rizk.my.id");
});

app.get("/dashboard", (request, reply) => {
    reply.view("dashboard.ejs", { title: "dashboard" });
});

app.get("/tiktok", (request, reply) => {
    reply.view("tiktok.ejs", { title: "tiktok downloader" });
});
app.get("/script/installerthema.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/installerthema.sh");
});

app.get("/script/installerpanel.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/installerpanel.sh");
});
app.get("/script/root.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/root.sh");
});
app.get("/script/swapfile.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/swapfile.sh");
});
app.get("/script/detect.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/detect.sh");
});
app.get("/script/my.sh", (request, reply) => {
    reply.header("Content-Type", "application/x-sh");
    reply.view("script/my.sh");
});
app.get("/gcbot", (request, reply) => {
    reply.redirect("https://chat.whatsapp.com/KIcqnzY4NJMHXPTz8Xopvd");
});

app.get("/animeradio", (request, reply) => {
    reply.redirect("https://play.streamafrica.net/weebanimeradio");
});
app.get("/lofiradio", (request, reply) => {
    reply.redirect("https://play.streamafrica.net/lofiradio");
});
app.get("/japancitypop", (request, reply) => {
    reply.redirect("https://play.streamafrica.net/japancitypop");
});



const registerRoutes = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            registerRoutes(filePath);
        } else if (file.endsWith(".js")) {
            app.register(require(filePath));
        }
    });
};

registerRoutes(path.join(__dirname, "routes"));

const start = async () => {
    try {
        await app.listen({ port: Number(PORT), host: "0.0.0.0" }); // Pakai 0.0.0.0 agar bisa diakses dari luar Docker
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();