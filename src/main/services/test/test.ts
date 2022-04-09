class Test {
  constructor() {
    console.log('test')
  }

  async getUser() {
    if (global.mongoClient) {
      const db = global.mongoClient.db('contea_desktop')
      const collection = db.collection('User')
      const result = await collection.find({}).toArray()
      return { data: result }
    }
    return { error: true }
  }
}

export default new Test()