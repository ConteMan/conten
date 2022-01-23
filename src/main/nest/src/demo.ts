import { Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
const initSqlJs = require('sql.js')

@Injectable()
export class Demo {
  async getHello() {
    const userPath = await app.getPath('userData')
    const fullPath = path.join(userPath, '/data/sql.db')
    const filebuffer = fs.readFileSync(fullPath);

    const SQL = await initSqlJs()
    const db = new SQL.Database(filebuffer)
    
    const res = await db.exec('SELECT name,hired_on FROM employees ORDER BY hired_on;')
    return JSON.stringify(res)
  }
}
