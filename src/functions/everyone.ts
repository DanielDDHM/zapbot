import { Client, Message } from 'whatsapp-web.js'

export async function everyone(client: Client, message: Message) {
  const chat: any = await message.getChat()

  let text = ''
  let mentions = []

  for (let participant of chat?.participants) {
    const contact = await client.getContactById(participant.id._serialized)

    mentions.push(contact)
    text += `@${participant.id.user} `
  }

  await chat.sendMessage(text, { mentions })
}
