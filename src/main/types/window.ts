export interface CreateWindowOptions {
  module: string
  center?: boolean
  url?: string
  x?: number
  y?: number
  width?: number
  height?: number
  alwaysOnTop?: boolean
  maximizable?: boolean
}

export interface WinModule {
  id: number
  url: string
}

export interface PinTopParams {
  moduleName: string
  status?: boolean
}

export type ShowAppParams = PinTopParams
