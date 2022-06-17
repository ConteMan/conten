export interface ShortcutConfig {
  shortcut_show_app: string
  [name: string]: string
}

export const configDefault: ShortcutConfig = {
  shortcut_show_app: 'Alt+X',
}
