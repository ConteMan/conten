import User from "~/main/models/user"

export async function getUser() {
  try {
    console.log('sqlite3: ', User)
    if (!User) return false

    const user = await User.findOne({ where: { first_name: 'John' } })
    return user?.toJSON()
  }
  catch(e) {
    console.log('sqlite3-create: ', e)
  }
  return false
}