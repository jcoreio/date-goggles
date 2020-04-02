# date-goggles

[![CircleCI](https://circleci.com/gh/jcoreio/date-goggles.svg?style=svg)](https://circleci.com/gh/jcoreio/date-goggles)
[![Coverage Status](https://codecov.io/gh/jcoreio/date-goggles/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/date-goggles)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/date-goggles.svg)](https://badge.fury.io/js/date-goggles)

Our work involves lots of numeric timestamps in JSON. This leads to a lot of log output like:

```
[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
{ t: [ 1585777672134, 1585778400000 ],
  v: [ 'Stuffing', null ],
  beginTime: 1585777672134,
```

Which can be tedious to debug because numeric timestamps are inscrutable. `date-goggles` helps by searching for numbers that
seem to be timestamps and converting them to `Dates`:

```
[2020-04-01 18:32:22 TrackedEntityActivityRecordAPI] INFO calling historian.putData:  { '_org/5/Employees/148':
{ t: [ 4/1/2020, 4:47:52 PM, 4/1/2020, 5:00:00 PM ],
  v: [ 'Stuffing', null ],
  beginTime: 4/1/2020, 4:47:52 PM,
```

# Table of Contents

<!-- toc -->

- [Node.js API](#nodejs-api)
  - [`dateGoggles(input, options)`](#dategogglesinput-options)
  - [`parse(input, options)`](#parseinput-options)
  - [`format(ast, options)`](#formatast-options)
- [CLI](#cli)

<!-- tocstop -->

# Node.js API

## `dateGoggles(input, options)`

Transforms the output with `format(parse(input, options), options)`.
See [`parse`](#parseinput-options) and [`format`](#formatast-options) for `options` documentation.

## `parse(input, options)`

Parses input text.

### Arguments

#### `input: string` (**required**)

The input to parse.

#### `options.unit` (`'milliseconds' | 'seconds'`, _optional_)

The timestamp unit. If omitted, tries to guess based upon the input or numeric `options.min`/`options.max`.

#### `options.min` (`number | Date | null | undefined`, _optional_)

Numbers found in the input less than this will not be considered timestamps.
If you pass `null`, no lower bound is used. If `undefined` or omitted, defaults to 10 years ago.

#### `options.max` (`number | Date | null | undefined`, _optional_)

Numbers found in the input greater than this will not be considered timestamps.
If you pass `null`, there's no upper bound. If `undefined` or omitted, defaults to 5 years into the future.

### Returns: `Array<string | Date>`

The input split up in to substrings in which no timestamps were found, and timestamps
converted to `Date`s.

## `format(ast, options)`

Formats a parsed AST.

### Arguments

#### `ast: Array<string | Date>` (**required**)

The AST output of `parse`.

#### `options.formatDate` (`(date: Date) => string`, _optional_)

Customizes how `Date`s are formatted.

### Returns: `string`

The formatted output.

# CLI

The CLI is pretty basic and doesn't have any options to customize output right now,
it just parses file arguments or stdin and outputs using `date.toLocaleString()`:

```
date-goggles app1.log app2.log
```

OR

```
some-command | date-goggles
```
