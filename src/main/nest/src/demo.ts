import { Injectable } from '@nestjs/common'
import initSqlJs from 'sql.js/dist/sql-wasm'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

@Injectable()
export class Demo {
  async getHello() {
    return 'hello world ~!'
    // const userPath = await app.getPath('userData')
    // const fullPath = path.join(userPath, '/data/sql.db')
    // console.log('fullPath:', fullPath)
    // const filebuffer = fs.readFileSync(fullPath);
    // console.log('filebuffer:', filebuffer)
    // console.log('initSqlJs():', await initSqlJs())
    // initSqlJs().then(function(SQL){
    //   // Load the db
    //   const db = new SQL.Database(filebuffer);
    //   console.log('database:', db)
    //   return db.exec('SELECT name,hired_on FROM employees ORDER BY hired_on;')
    // });

  }
}
