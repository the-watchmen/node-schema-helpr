# node-schema-helpr

miscellaneous schema helper functions

design goal is to support validation on server-side and expose via rest-api to client-side to allow coordination of ui form generation and validation.

* based on [joi](https://github.com/hapijs/joi) for server-side validation
* uses output of the joi [describe](https://github.com/hapijs/joi/issues/1129) feature to externalize to client-side

[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/the-watchmen/node-schema-helpr.svg?branch=master)](https://travis-ci.org/the-watchmen/node-schema-helpr)
[![npm (scoped)](https://img.shields.io/npm/v/@watchmen/schema-helpr.svg)](https://img.shields.io/npm/v/@watchmen/schema-helpr.svg)

> see [tests](test) for examples

## usage

1. `yarn install {package name}`
1. `import {...} from '{package name}'`

## development

1. `git clone {repo name}`
1. `cd {repo name}`
1. `yarn`
1. `yarn test`
