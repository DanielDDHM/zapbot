import { Client, MessageMedia, Message, LocalAuth, MessageTypes } from 'whatsapp-web.js';
import qrcode from "qrcode-terminal";
import axios from 'axios';

const client = new Client({
  qrMaxRetries: 3,
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

client.on('message_create', async (message: Message, sender: any) => {
  const command = message.body.split(' ')[0]
  if (command === "/sticker"){
    if(message.type === MessageTypes.IMAGE) {
      try {
        const { data } = await message.downloadMedia()
        const image = new MessageMedia('image/jpeg', data, 'image.jpg')
        await message.reply(image, undefined, { sendMediaAsSticker: true })
      } catch(e) {
        await message.reply('❌ Não foi possível gerar um sticker com essa imagem')
      }
    } else if(message.type === MessageTypes.VIDEO){
      try {
        const { data } = await message.downloadMedia()
        const image = new MessageMedia('video/mp4', data, 'video/mp4')
        await message.reply(image, undefined, { sendMediaAsSticker: true })
      } catch(e) {
        await message.reply('❌ Não foi possível gerar um sticker com esse video')
      }
    } else if(message.type === MessageTypes.TEXT){
      try {
          const url = message.body.substring(message.body.indexOf(" ")).trim()
          const { data } = await axios.get(url, {responseType: 'arraybuffer'})
          const returnedB64 = Buffer.from(data).toString('base64');
          const image = await new MessageMedia("image/jpeg", returnedB64, "image.jpg")
          await message.reply(image, undefined ,{ sendMediaAsSticker: true })
      } catch(e) {
          message.reply("❌ Não foi possível gerar um sticker com esse link")
      }
    }
  }

  if(command === "/image"){
    try {
      const url = message.body.substring(message.body.indexOf(" ")).trim()
      const { data } = await axios.get(url, {responseType: 'arraybuffer'})
      const returnedB64 = Buffer.from(data).toString('base64');
      const image = await new MessageMedia("image/jpeg", returnedB64, "image.jpg")
      await message.reply(image, undefined, { sendMediaAsSticker: true })
    } catch(e) {
        message.reply("❌ Não foi possível gerar um sticker com esse link")
    }
  }
});

client.on('message', async (message: Message) => {
  const command = message.body.split(' ')[0]
  console.log(message.from)
  if(command === "/teamo"){
    const image = MessageMedia.fromFilePath('./assets/abc.webp')
    await message.reply(image)
    await client.sendMessage(message.from, 'TE AMO MAS TU ME FUUUUUDEUUUUUU, TE AMO MAS TU ME FUDEU')
    await client.sendMessage(message.from, 'https://www.youtube.com/watch?v=rotmF54eSe0&ab_channel=Furac%C3%A3o2000', {linkPreview: true})
    // try {
  
    // } catch(e) {
    //     message.reply("❌ Nao foi possivel te dar amor, tente na proxima")
    // }
  } 
});
