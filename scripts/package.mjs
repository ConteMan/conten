import fs from 'fs-extra'
import path from 'path'

async function getPackageLock() {
  try {
    const packageLockPath = path.join(path.resolve(), 'package-lock.json')
    const packageLock = await fs.readJson(packageLockPath)
    return packageLock
  }
  catch(e) {
    console.log(`script > package > getPackageLock > error: ${e}`)
  }
}

async function deal() {
  try {
    const packageData = await getPackageLock()

    const formatData = {}
    const { name, version, license, dependencies, devDependencies } = packageData.packages['']
    formatData.name = name
    formatData.version = version
    formatData.license = license
    
    const dealDependencies = {}
    const dealDevDependencies = {}
    for (const key in dependencies) {
      dealDependencies[key] = {
        versionDefault: dependencies[key],
        ...packageData.packages[`node_modules/${key}`],
      }
    }
    for (const key in devDependencies) {
      dealDevDependencies[key] = {
        versionDefault: devDependencies[key],
        ...packageData.packages[`node_modules/${key}`],
      }
    }
  
    formatData.dependencies = dealDependencies
    formatData.devDependencies = dealDevDependencies

    const formatDataPath = path.join(path.resolve(), 'src/main/config/packageInfo.json')

    await fs.writeJSON(formatDataPath, formatData, { spaces: 2 })
  }
  catch(e) {
    console.log(`script > package > deal > error: ${e}`)
  }
}

deal()
