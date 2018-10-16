export interface CtcProject {
  name: string
  control: {
    hostname: string
    port: number
    socket: string
  }
  http: {
    hostname: string
    port: number
    secure: boolean
  }
  ctc: {
    version: string
  }
}