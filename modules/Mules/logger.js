import pino from "pino";
import * as rotateFileStream from "rotating-file-stream";

const logStream = rotateFileStream.createStream("app.log", {
  path: "./logs",
  size: "10K",       // Rotate at 10 MB
  interval: "1d",    // Also rotate daily
  compress: "gzip"
});

let logger

if(true){
    logger=pino({
  level: process.env.LOG_LEVEL || "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "token"
        ],
    },
    pino.destination({
        dest: "./logs/app.log",
        mkdir: true,
        sync: false
        }),
        logStream
    )
}
else{
    logger=pino({
        level: process.env.LOG_LEVEL || "debug",

        redact: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "token"
                ],
        transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            singleLine: true,
            destination: 1
                    }
                    }
            }, 
        )
}

export default logger;


/*****************************************************************
 * 
 * 
 * 
 * Level	Value	Use for
    trace	10	Extremely detailed internal debugging
    debug	20	Development and troubleshooting details
    info	30	Normal application events
    warn	40	Unexpected situations that are not failures
    error	50	Failed operations or exceptions
    fatal	60	Critical errors that may terminate the process

    logger.trace({ data }, "Detailed trace");
    logger.debug({ userId }, "User lookup started");
    logger.info({ port }, "Server started");
    logger.warn({ attempts }, "Repeated failed login attempts");
    logger.error({ err }, "Database query failed");
    logger.fatal({ err }, "Application cannot start");
 * 
 * 
 */