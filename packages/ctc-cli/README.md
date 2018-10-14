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
$ npm install -g ctc-cli
$ ctc COMMAND
running command...
$ ctc (-v|--version|version)
ctc-cli/0.0.0 darwin-x64 node-v10.12.0
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
* [`ctc start [PROJECT]`](#ctc-start-project)

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.0.5/src/commands/help.ts)_

## `ctc start [PROJECT]`

Start a CTC server

```
USAGE
  $ ctc start [PROJECT]

OPTIONS
  -d, --daemon         start as a server
  -f, --force          force CTC server to start
  -h, --help           show CLI help
  -p, --port=port      use networkable port for server control
  -s, --socket=socket  use local socket for server control

EXAMPLES
  $ ctc start
       Start a ctc server as a separate process and exit.
    
  $ ctc start --no-daemon
       Start a ctc server that runs until this command exits.
```

_See code: [src/commands/start.ts](https://github.com/rhwood/ctc-cli/blob/v0.0.0/src/commands/start.ts)_
<!-- commandsstop -->
