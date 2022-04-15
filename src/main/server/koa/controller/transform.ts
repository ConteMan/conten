import * as cheerio from 'cheerio'

async function transform(data: any) {
  const { module } = data
  
  if (module === 'v2ex')
    return v2ex(data)
  
  return {}
}

async function v2ex(data: any) {
  const { moduleType, data: dataStr } = data
  if (moduleType === 'getUserName') {
    const $ = cheerio.load(dataStr)
    const aDoms = $('#Top .tools a')
    const username = aDoms.length > 0 && aDoms.eq(1).attr('href') ? aDoms.eq(1).attr('href') as string : ''

    const userRes = await global.mongoClient?.db('contea_desktop').collection('user').insertOne({ username })

    return { username, userRes }
  }
}

export { transform }