import { app, globalShortcut } from "electron"

export function shortcutsInit() {
  // Register a 'CommandOrControl+X' shortcut listener.
  const ret = globalShortcut.register('Alt+X', () => {
    global.win?.show()
    global.win?.moveTop
    global.win?.focus()
    console.log('Alt+X is pressed')
  })

  if (!ret) {
    console.log('registration failed')
  }

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'))
}

export function unregister() {
    // Unregister a shortcut.
    globalShortcut.unregister('CommandOrControl+X')

    // Unregister all shortcuts.
    globalShortcut.unregisterAll()
}