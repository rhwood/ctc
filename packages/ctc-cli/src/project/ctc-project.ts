import * as fs from 'fs-extra'
import * as log from 'npmlog'
import * as Path from 'path'

import {version} from '../../package.json'

import {CtcProjectConfig} from './ctc-project-config'

export class CtcProject {
  static isProject(dir: string): boolean {
    return fs.existsSync(Path.join(dir, 'project.json'))
  }

  static isLocked(dir: string): boolean {
    const lock: string = Path.join(dir, 'lock')
    if (fs.existsSync(lock)) {
      const pid = Number(fs.readFileSync(lock))
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

  static createConfig(name: string, port: number, socket: string): CtcProjectConfig {
    const hostname = 'localhost'
    const config: CtcProjectConfig = {
      name,
      control: {hostname, port, socket},
      http: {hostname, port: 0, secure: false},
      ctc: {version},
    }
    return config
  }

  static readConfig(path: string): CtcProjectConfig {
    const json = Path.join(path, 'project.json')
    let config: CtcProjectConfig
    try {
      config = fs.readJsonSync(json)
    } catch {
      if (!fs.existsSync(json)) {
        throw new Error(`${path} is not a project.`)
      }
      throw new Error(`${path} has an invalid project.json file.`)
    }
    return config
  }

  readonly config: CtcProjectConfig

  readonly path: string

  constructor(path: string, config?: CtcProjectConfig | undefined) {
    this.path = Path.resolve(path)
    if (config === undefined) {
      config = CtcProject.readConfig(this.path)
    }
    this.config = config
  }

  public lock() {
    const lock: string = Path.join(this.path, 'lock')
    try {
      fs.writeFileSync(lock, process.pid.toString())
    } catch (error) {
      log.error('ERROR', 'Unable to lock project: %s', error)
    }
  }

  public unlock() {
    const lock: string = Path.join(this.path, 'lock')
    try {
      fs.removeSync(lock)
    } catch (error) {
      log.error('ERROR', 'Unable to unlock project: %s', error)
    }
  }

  public async save() {
    return fs.writeJson(Path.join(this.path, 'project.json'), this.config, {spaces: 2})
  }

  public saveSync() {
    return fs.writeJsonSync(Path.join(this.path, 'project.json'), this.config, {spaces: 2})
  }
}
