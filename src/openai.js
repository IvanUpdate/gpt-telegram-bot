import { Configuration, OpenAIApi } from "openai";
import config from 'config'
import { createReadStream } from 'fs'

class OpenAI {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system',
    }


    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey
        });
        this.openai = new OpenAIApi(configuration); 
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages
            })
            return response.data.choices[0].message
        } catch (e) {
            console.log('Error with chat gpt', e.message)
        }
    }

    async transcription(filePath) {
        try {
            const response = await this.openai.createTranscription(
              createReadStream(filePath),
              "whisper-1"
            );
            return response.data.text
        } catch (e) {
            console.log("Something goes wrong during transcription", e.message)
        }
    }

    async get_picture(description) {
        try {
            const response = await this.openai.createImage({
                prompt: description,
                n: 2,
                size: '1024x1024'
            })
            console.log(response.data)
            return response.data
        } catch (e) {
            console.log("Something goes wrong with image request", e.message)
        }
    }
}

export const openai = new OpenAI(config.get("OPENAI_KEY"))