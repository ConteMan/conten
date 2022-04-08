import { getMongoClient } from "../modules/db"

export const getStatus = async() => {
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