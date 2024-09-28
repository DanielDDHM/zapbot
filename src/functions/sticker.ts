import axios from "axios";
import { Client, Message, MessageMedia, MessageTypes } from "whatsapp-web.js";

export async function sticker(client: Client, message: Message) {
    if (message.type === MessageTypes.IMAGE) {
        try {
            const { data } = await message.downloadMedia()
            const image = new MessageMedia('image/jpeg', data, 'image.jpg')
            await message.reply(image, undefined, { sendMediaAsSticker: true })
        } catch (e) {
            await message.reply('❌ Não foi possível gerar um sticker com essa imagem ❌')
        }
    }
    if (message.type === MessageTypes.VIDEO) {
        try {
            const { data } = await message.downloadMedia()
            const image = new MessageMedia('video/mp4', data, 'video/mp4')
            await message.reply(image, undefined, { sendMediaAsSticker: true })
        } catch (e) {
            await message.reply('❌ Não foi possível gerar um sticker com esse video ❌')
        }
    } 
    if (message.type === MessageTypes.TEXT) {
        try {
            const url = message.body.substring(message.body.indexOf(" ")).trim()
            const { data } = await axios.get(url, { responseType: 'arraybuffer' })
            const returnedB64 = Buffer.from(data).toString('base64');
            const image = await new MessageMedia("image/jpeg", returnedB64, "image.jpg")
            await message.reply(image, undefined, { sendMediaAsSticker: true })
        } catch (e) {
            message.reply(`❌ Não foi possível gerar um sticker com esse ${message.type} ❌`)
        }
    }
}