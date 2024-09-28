import { everyone } from './everyone'
import { sticker } from './sticker'
import { aiCall, chatReset } from './ai'
import { Client, Message } from 'whatsapp-web.js'
import { MESSAGES } from '../messages'
import { groupInvite } from './groupInvite'

export const commands: Record<string, any> = {
  '!sticker': sticker,
  '!everyone': everyone,
  '!ai': aiCall,
  '!ai-delete': chatReset,
  '!invite': groupInvite,
  '!help': async (client: Client, message: Message) => message.reply(MESSAGES.HELP),
}
