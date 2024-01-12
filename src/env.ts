import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  RUNTIME: z.enum(['bun', 'edge']).default('bun'),
  CLIENT_BASE_URI: z.string().url(),
  JWT_SECRET_KEY: z.string().min(1),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_CLIENT_REDIRECT_URI: z.string().url(),
})

export const env = envSchema.parse(process.env)
