import { Client, GroupChat, Message } from 'whatsapp-web.js'
import redis from '../config/redis'
import { everyone } from './everyone'

function parseEventMessage(message: string) {
  const trimmedMessage = message.trim()
  const regex = /!event nome:\s*(.*?)\s*,?\s*data:\s*"(.*?)"\s*,?\s*horario:\s*"(.*?)"/
  const match = trimmedMessage.match(regex)

  if (match) {
    const nome = match[1].trim()
    const data = match[2].trim()
    const horario = match[3].trim()

    return {
      nome,
      data,
      horario,
    }
  }

  return null
}

export async function event(client: Client, message: Message) {
  const parsedData = parseEventMessage(message.body)
  if (!parsedData) {
    message.reply('⚠️ Esta mensagem não parece ser um evento válido. ⚠️')
    return
  }

  const contact = await message.getContact()
  const group = (await message.getChat()) as GroupChat
  const creator = `- ${contact.pushname || contact.number}`

  const eventExists = await redis.get(`${parsedData.nome}::${group.id._serialized}`)

  if (eventExists) {
    message.reply('⚠️ Evento ja Existe ⚠️')
    return
  }

  message.reply(
    `📅 *Novo Evento Criado!*\n\n` +
      `Um novo evento foi adicionado à sua agenda:\n\n` +
      `📝 *Nome do Evento:* ${parsedData?.nome}\n\n` +
      `📆 *Data:* ${parsedData?.data}\n\n` +
      `⏰ *Horário:* ${parsedData?.horario}\n\n` +
      `👥 *Participantes:*\n` +
      `${creator}\n` +
      `Para confirmar presença apenas responda a mensagem com !vou e para sair !nao-vou\n` +
      `Não se esqueça de adicionar este evento ao seu calendário! Caso tenha dúvidas ou precise de mais informações, digite *!help* para acessar a lista de comandos disponíveis.\n\n` +
      `Agradecemos por usar o ZapBot e esperamos que o evento seja um sucesso! 🎉`,
  )
  await everyone(client, message)

  await redis.set(
    `${parsedData.nome}::${group.id._serialized}`,
    JSON.stringify([creator]),
    'EX',
    Number(process.env.REDIS_TTL),
  )
}

export async function participation(client: Client, message: Message) {
  if (message.hasQuotedMsg) {
    const quotedMsg = await message.getQuotedMessage()
    const quotedText = quotedMsg.body
    const group = (await message.getChat()) as GroupChat

    const eventKeyMatch = quotedText.match(/📝 \*Nome do Evento:\* (.*?)\n/)
    console.log('body', message.body)

    if (eventKeyMatch) {
      const contact = await message.getContact()

      if (!contact.isMe) {
        const eventKey = eventKeyMatch[1].trim()
        const eventData = await redis.get(`${eventKey}::${group.id._serialized}`)
        if (!eventData) return
        let participants: Array<string> = JSON.parse(eventData)

        const participantName = `- ${contact.pushname || contact.number}`

        if (message.body !== '!nao-vou') {
          if (!participants.includes(participantName)) {
            participants.push(participantName)
          } else {
            message.reply(`⚠️ Você já está registrado neste evento ou o evento não existe mais. ⚠️`)
            return
          }
        } else {
          participants = participants.filter(item => item !== participantName)
        }

        await redis.set(
          `${eventKey}::${group.id._serialized}`,
          JSON.stringify(participants),
          'EX',
          Number(process.env.REDIS_TTL),
        )

        const participantsList = participants.join('\n')

        message.reply(
          `📅 *Atualização do Evento!*\n\n` +
            `📝 *Nome do Evento:* ${eventKey}\n\n` +
            `👥 *Participantes:*\n` +
            `${participantsList}\n` +
            `Para confirmar presença apenas responda a mensagem com !vou e para sair !nao-vou`,
        )
      }
    }
  }
}
