import { Message } from 'whatsapp-web.js'
import client from './client'
import { config } from 'dotenv'
import { commands } from './functions'

config()

client.on('message', async (message: Message) => {
  const command = message.body.split(' ')[0]

  const handler = commands[command]

  if (handler) {
    await handler(client, message)
    message.react('👍')
  }
})
