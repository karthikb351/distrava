export default {
  async fetch(request, env) {
    return await handleRequest(request, env)
  },
}

async function handleRequest(request, env) {
  const id = env.SHORTLINK.idFromName('shortlink')
  const obj = env.SHORTLINK.get(id)
  const resp = await obj.fetch(request.url)
  return resp
}

export class ShortLink {
  constructor(state, env) {
    this.state = state
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    // Apply requested action.
    const url = new URL(request.url)
    switch (url.pathname) {
      case '/shortlink/set':
        const keyToSet = url.searchParams.get('uuid')
        const valueToSet = url.searchParams.get('url')
        await this.state.storage.put('keyToSet', valueToSet)
        return new Response(valueToSet)
        break
      case '/shortlink/get':
        const keyToGet = url.searchParams.get('uuid')
        const value = await this.state.storage.get(keyToGet)
        return new Response(value)
        break
      default:
        return new Response('Not found', { status: 404 })
    }
  }
}
