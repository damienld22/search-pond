import { pino } from "pino";
import {
  isPictureContainsPond,
  extractPictureFromMapCoordonnates,
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
    const picture = await extractPictureFromMapCoordonnates();
    const pictureContainsPond = await isPictureContainsPond(picture);
    console.log("==> pictureContainsPond :", pictureContainsPond);
    logger.info("Job is done !");
  } catch (err) {
    logger.error("An error occured", err);
    process.exit(1);
  }
}

main();
