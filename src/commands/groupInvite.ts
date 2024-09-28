import { Client, GroupChat, Message } from 'whatsapp-web.js'

export async function groupInvite(client: Client, message: Message) {
  const group = await message.getChat()
  client.getChatById(group.id._serialized).then(async (chat: GroupChat | any) => {
    const inviteCode = await chat.getInviteCode()
    console.log(`Link de convite: https://chat.whatsapp.com/${inviteCode}`)
    message.reply(`Link de convite aqui: https://chat.whatsapp.com/${inviteCode}`)
  })
}
