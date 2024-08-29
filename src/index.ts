import { pino } from "pino";
import {
  isPictureContainsPond,
  iterateFromStartToEndCoordonnatesToSavePictures,
} from "./services/extractPicture.js";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

logger.info("Starting search pond worker...");

async function main() {
  try {
    const listOfPictures =
      await iterateFromStartToEndCoordonnatesToSavePictures();

    logger.info("Search pond on saved pictures...");
    for (const picture of listOfPictures) {
      picture.hasPond = await isPictureContainsPond(picture);
      if (picture.hasPond) {
        logger.info(`Picture ${picture.fileName} contains a pond !`);
      }
    }

    logger.info("Job is done !");
  } catch (err) {
    logger.error("An error occured", err);
    process.exit(1);
  }
}

main();
