import {CtcProjectConfig} from './CtcProjectConfig'
import * as fs from 'fs-extra'
import * as Path from 'path'

export class CtcProject {

  readonly config: CtcProjectConfig
  readonly path: string

  static isProject(dir: string): boolean {
    return fs.existsSync(Path.join(dir, 'project.json'))
  }

  static isLocked(dir: string): boolean {
    let lock: string = Path.join(dir, 'lock')
    if (fs.existsSync(lock)) {
      let pid = Number(fs.readFileSync(lock))
      try {
        process.kill(pid, 0)
        return true
      } catch {
        // remove lock because its invalid
        fs.removeSync(lock)
        return false
      }
    }
    return false
  }

  constructor(path: string, config: CtcProjectConfig | undefined) {
    this.path = Path.resolve(path)
    if (typeof config === 'undefined') {
      let json = Path.join(this.path, 'project.json')
      if (fs.existsSync(json)) {
        this.config = fs.readJsonSync(json)
      } else {
        throw new Error(`Path "${path}" is not a project.`)
      }
    } else {
      this.config = config
    }
  }

  public lock() {
    let lock: string = Path.join(this.path, 'lock')
    fs.writeFile(lock, process.pid)
  }

  public unlock() {
    let lock: string = Path.join(this.path, 'lock')
    fs.remove(lock)
  }
}