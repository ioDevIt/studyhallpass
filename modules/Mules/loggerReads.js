import { copyFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

import logger from "./logger.js";

export async function readCopyOfLog(sourcePath) {
  const copyPath = `${sourcePath}.${Date.now()}.copy`;

  try {
    logger.info(sourcePath)
    logger.info(copyPath)

    await copyFile(sourcePath, copyPath);

    const content = await readFile(copyPath, "utf8");
    const entries = [];

    for (const line of content.split(/\r?\n/)) {
      if (!line.trim()) continue;

      try {
        entries.push(JSON.parse(line));
      } catch {
        // Ignore an incomplete final line
      }
    }

    return entries;
  } finally {
    await unlink(copyPath).catch(() => {});
  }
}

// const entries = await readCopyOfLog("./logs/app.log");
// console.log(entries);