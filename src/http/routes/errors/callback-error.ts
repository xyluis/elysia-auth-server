export class CallbackError extends Error {
  constructor(name: string, message: string) {
    super(`${name}: ${message}`)
  }
}
