import fs from "fs";
import axios from "axios";
import getColors from "get-image-colors";
import { closest } from "color-2-name";
import { degToNum } from "./CoordonnatesTranslation.js";
import { Coordonnate } from "../types/Coordonnate.js";
import { TilePosition } from "../types/TilePosition.js";
import { Picture } from "../types/Picture.js";

const START_COORDONNATES: Coordonnate = { lat: 48.2055218, long: -3.1014815 };
const END_COORDONNATES: Coordonnate = { lat: 48.1862362, long: -3.0073569 };
const DEFAULT_ZOOM = 16;
const POND_LOWER_COLOR_LIMIT = "#00008B";
const POND_UPPER_COLOR_LIMIT = "#00FFFF";

export async function iterateFromStartToEndCoordonnatesToSavePictures(): Promise<
  Picture[]
> {
  const startTilePosition = getTilePositionFromCoordonnates(
    START_COORDONNATES,
    DEFAULT_ZOOM
  );
  const endTilePosition = getTilePositionFromCoordonnates(
    END_COORDONNATES,
    DEFAULT_ZOOM
  );

  const listOfPictures: Picture[] = [];

  let currentTilePosition = startTilePosition;
  for (let y = startTilePosition.y; y <= endTilePosition.y; y++) {
    for (let x = startTilePosition.x; x <= endTilePosition.x; x++) {
      currentTilePosition = { ...currentTilePosition, x, y };
      console.log("Get picture for :", { x, y });
      const picture = await extractAndSavePictureFromTilePosition(
        currentTilePosition
      );

      if (picture) {
        listOfPictures.push(picture);
      }
    }
  }

  return listOfPictures;
}

export function getTilePositionFromCoordonnates(
  coordonnate: Coordonnate,
  zoom: number
): TilePosition {
  return degToNum(coordonnate.lat, coordonnate.long, zoom);
}

export async function extractAndSavePictureFromTilePosition(
  tilePosition: TilePosition
): Promise<Picture | null> {
  const { x, y, zoom } = tilePosition;
  const PICTURE_URL = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;

  try {
    const response = await axios.get(PICTURE_URL, {
      responseType: "arraybuffer",
    });
    if (response.status !== 200) {
      throw new Error("Failed to fetch map from the URL");
    }

    // Save file to disk
    if (!fs.existsSync("savedPictures")) {
      fs.mkdirSync("savedPictures");
    }
    const fileName = `map-${x}-${y}.png`;
    fs.appendFileSync(`savedPictures/${fileName}`, Buffer.from(response.data));

    return {
      fileName,
      buffer: response.data,
    };
  } catch (err) {
    console.error("An error occured", err);
    return null;
  }
}

export async function isPictureContainsPond(
  picture: Picture
): Promise<boolean> {
  const colors = await getColors(picture.buffer, { type: "image/png" });
  return colors.some((color) => isBlueShade(color.hex()));
}

function isBlueShade(hexColor: string) {
  const authorizedColors = [
    "lightblue",
    "steelblue",
    "lightsteelblue",
    "cadetblue",
  ];
  return authorizedColors.includes(closest(hexColor).name);
}
