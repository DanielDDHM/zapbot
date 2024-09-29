import { Chat } from '@prisma/client'
import { Message } from 'whatsapp-web.js'

export function verifyLimitChat(chat: Chat, message: Message) {
  if (process.env.QTD_MAX_CHAT) {
    if (chat.chat.length > Number(process.env.QTD_MAX_CHAT)) {
      message.reply('Limite atingido, caso queira continuar entre em contato com responsavel')
      return
    }
  }
}
