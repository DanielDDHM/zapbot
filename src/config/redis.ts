import IORedis from 'ioredis'
import 'dotenv/config'

const connectionIORedis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
})

export default connectionIORedis
