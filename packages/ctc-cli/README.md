ctc-cli
=======

Command Line Interface for the Centralized Traffic Controller Daemon

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ctc-cli.svg)](https://npmjs.org/package/ctc-cli)

[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/rhwood/ctc-cli?branch=master&svg=true)](https://ci.appveyor.com/project/rhwood/ctc-cli/branch/master)
[![Codecov](https://codecov.io/gh/rhwood/ctc-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/rhwood/ctc-cli)
[![Downloads/week](https://img.shields.io/npm/dw/ctc-cli.svg)](https://npmjs.org/package/ctc-cli)
[![License](https://img.shields.io/npm/l/ctc-cli.svg)](https://github.com/rhwood/ctc-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ctc
$ ctc COMMAND
running command...
$ ctc (-v|--version|version)
ctc/0.0.0 darwin-x64 node-v11.10.0
$ ctc --help [COMMAND]
USAGE
  $ ctc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ctc autocomplete [SHELL]`](#ctc-autocomplete-shell)
* [`ctc help [COMMAND]`](#ctc-help-command)
* [`ctc init [PATH]`](#ctc-init-path)
* [`ctc start [PATH]`](#ctc-start-path)
* [`ctc stop [PATH]`](#ctc-stop-path)

## `ctc autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ ctc autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ ctc autocomplete
  $ ctc autocomplete bash
  $ ctc autocomplete zsh
  $ ctc autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.1.0/src/commands/autocomplete/index.ts)_

## `ctc help [COMMAND]`

display help for ctc

```
USAGE
  $ ctc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

## `ctc init [PATH]`

Create a CTC project

```
USAGE
  $ ctc init [PATH]

OPTIONS
  -n, --name=name      project name
  -p, --port=port      use networkable port for process control
  -s, --socket=socket  use local socket for process control
  -u, --overwrite      overwrite existing project if one exists

EXAMPLE
  $ ctc init myProject
       Create a CTC project in the directory 'myProject'
```

_See code: [src/commands/init.ts](https://github.com/rhwood/ctc/blob/v0.0.0/src/commands/init.ts)_

## `ctc start [PATH]`

Start a CTC server

```
USAGE
  $ ctc start [PATH]

OPTIONS
  -d, --[no-]daemon    start a background process
  -h, --help           show CLI help
  -p, --port=port      use networkable port for process control
  -s, --socket=socket  use local socket for process control

EXAMPLES
  $ ctc start
       Start a CTC process in the background and exit
    
  $ ctc start --no-dameon
       Start a CTC process in the foreground
```

_See code: [src/commands/start.ts](https://github.com/rhwood/ctc/blob/v0.0.0/src/commands/start.ts)_

## `ctc stop [PATH]`

Stop a running CTC process

```
USAGE
  $ ctc stop [PATH]

OPTIONS
  -P, --pid=pid        stop CTC running at process id
  -h, --help           show CLI help
  -p, --port=port      stop CTC running at port
  -s, --server=server  stop CTC running on server

EXAMPLES
  $ ctc stop
       Stop the CTC process running the project in the current directory
       (presuming the current directory is a CTC project)
    
  $ ctc stop --pid=4242
       Stop the CTC process with process ID 4242
    
  $ ctc stop --server=192.168.4.4 --port=4242
       Stop the CTC process on port 4242 at IP address 192.168.4.4
```

_See code: [src/commands/stop.ts](https://github.com/rhwood/ctc/blob/v0.0.0/src/commands/stop.ts)_
<!-- commandsstop -->
