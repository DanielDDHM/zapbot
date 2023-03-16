import { Client, MessageMedia } from 'whatsapp-web.js';
import qrcode from "qrcode-terminal";
import axios from 'axios';

const client = new Client({
  qrMaxRetries: 3,
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

client.on('message_create', async (message: any) => {
  const command = message.body.split(' ')[0]
  if (command === "/sticker"){
    if(message.type === "image") {
      const { data } = await message.downloadMedia()
      const image = MessageMedia.fromFilePath('./assets/abc.webp')
      await message.reply(image)
      // try {
      // } catch(e) {
      //   await message.reply('❌ Não foi possível gerar um sticker com essa imagem')
      // }
  } else {
      try {
          const url = message.body.substring(message.body.indexOf(" ")).trim()
          const { data } = await axios.get(url, {responseType: 'arraybuffer'})
          const returnedB64 = Buffer.from(data).toString('base64');
          const image = await new MessageMedia("image/jpeg", returnedB64, "image.jpg")
          await message.reply(image, { sendMediaAsSticker: true })
      } catch(e) {
          message.reply("❌ Não foi possível gerar um sticker com esse link")
      }
    }
  }
});