const getStatus = async() => {
  let mongodb: any
  if (global.mongoClient) {
    const { hosts, metadata } = global.mongoClient?.options
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