import { GroupChat, Message } from 'whatsapp-web.js'
import client from './client'
import { config } from 'dotenv'
import { commands, quotedCommands } from './commands'
import { aiChatCall } from './chat/chat'

config()

client.on('message', async (message: Message) => {
  const group = await message.getChat()
  client.getChatById(group.id._serialized).then(async (chat: GroupChat | any) => {
    if (chat.isGroup) {
      const command = message.body.split(' ')[0]
      const handler = commands[command]

      if (handler) {
        await handler(client, message)
        message.react('👍')
      }

      if (message.hasQuotedMsg) {
        const quotedHandler = quotedCommands[command]
        await quotedHandler(client, message)
      }
    } else {
      await aiChatCall(client, message)
    }
  })
})
