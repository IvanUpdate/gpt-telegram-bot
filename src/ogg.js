import ffmpeg from "fluent-ffmpeg";
import {createWriteStream} from 'fs'
import { dirname, resolve} from 'path'
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url))

class oggConverter {
  constructor(inputFilePath, outputFilePath) {
    this.inputFilePath = inputFilePath;
    this.outputFilePath = outputFilePath;
  }

  convert() {
    ffmpeg(this.inputFilePath)
      .toFormat("mp3")
      .on("error", (err) => {
        console.log(`An erorr occured: $(err.message)`);
      })
      .on("end", () => {
        console
          .log("covertion completed successfully")
          .save(this.outputFilePath);
      });
  }

  async create(inputFilePath, outputFilePath) {
    try {
        const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
        const response = await axios({
            method: 'get',
            url,
            responseType: 'stream',
        })
        const stream = createWriteStream(oggPath)
    } catch (e) {
        console.log('Error while creating ogg', e.message)
    }
  } 
}

export const ogg = new OggConverter();
