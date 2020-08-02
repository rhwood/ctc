# CTC

Centralized Traffic Control for Model Railroads

[![Build Status](https://travis-ci.com/rhwood/ctc.svg?branch=master)](https://travis-ci.com/rhwood/ctc)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=rhwood_ctc&metric=alert_status)](https://sonarcloud.io/dashboard?id=rhwood_ctc)
[![Known Vulnerabilities](https://snyk.io/test/github/rhwood/ctc/badge.svg)](https://snyk.io/test/github/rhwood/ctc)
[![Maintainability](https://api.codeclimate.com/v1/badges/aee03e1f6f30309cc7a1/maintainability)](https://codeclimate.com/github/rhwood/ctc/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/aee03e1f6f30309cc7a1/test_coverage)](https://codeclimate.com/github/rhwood/ctc/test_coverage)

# About

The CTC application is intended to become a lightweight control panel for model railroads that can join in a grid with other CTC instances to provide multiple panels to a user or other application.

## License

CTC is released under the [Apache 2.0 license](LICENSE)

# Requirements

Only [Active LTS Node versions](https://nodejs.org/en/about/releases/) are supported.

# Install

CTC is not yet published on npm, so see _Develop_ below to install CTC.

# Develop

1. Fork this repo on GitHub.
2. Clone your copy of this repo.
3. Open a shell in your working copy of this repo.
3. Run `npm install` to install all dependencies

## Notes

This code is CI checked against [tslint](https://palantir.github.io/tslint/) rules (currently the [@oclif/tslint](https://github.com/oclif/tslint/blob/master/tslint.json) rules), so using a tslint plugin in your editor is recommended.
