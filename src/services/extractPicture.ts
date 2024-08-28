import fs from "fs";
import axios from "axios";
import getColors from "get-image-colors";
import { degToNum } from "./CoordonnatesTranslation.js";

const MAP_URL = "https://google.fr/maps/@48.2048424,-3.050833,17z";
const POND_COLOR = "#6694bf";

export async function extractPictureFromMapCoordonnates() {
  // TODO: Dynamic URL based on coordonnates
  const { x, y } = degToNum(48.2048424, -3.050833, 16);
  console.log("==> x :", x);
  console.log("==> y :", y);
  const PICTURE_URL = `https://tile.openstreetmap.org/16/${x}/${y}.png`;

  const response = await axios.get(PICTURE_URL, {
    responseType: "arraybuffer",
  });
  if (response.status !== 200) {
    throw new Error("Failed to fetch map from the URL");
  }

  // Save file to disk
  fs.mkdirSync("savedPictures");
  fs.appendFileSync(
    `savedPictures/map-${x}-${y}.png`,
    Buffer.from(response.data)
  );

  return response.data as Buffer;
}

export async function isPictureContainsPond(picture: Buffer): Promise<boolean> {
  const colors = await getColors(picture, { type: "image/png" });
  const index = colors.findIndex((color) => color.hex() === POND_COLOR);
  return index !== -1;
}
