import { getMongoClient } from "../modules/db"

const getStatus = async() => {
  const mongodbClient = await getMongoClient()
  let mongodb: any
  if (mongodbClient) {
    const { hosts, metadata } = mongodbClient?.options
    mongodb = { hosts, metadata }
  }

  return {
    mongodb,
  } 
}

const receiveStatus = async(status: any) => {
  console.log('status: ', status)
  return { status }
}

export { getStatus, receiveStatus }