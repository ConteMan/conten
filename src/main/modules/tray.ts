import { Tray } from "electron";
import path from "path";

export function trayInit() {
  const tray = new Tray(path.join(__dirname, '../public/images/logo_16.png'))
}
