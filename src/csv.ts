/*
Adapted from https://github.com/gkindel/csv-js/blob/master/csv.js

 Built to rfc4180 standard, with options for adjusting strictness:
    - optional carriage returns for non-microsoft sources
    - relaxed mode which: ignores blank lines, garbage following quoted tokens, and does not enforce a consistent record length

 Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 Author Greg Kindel (twitter @gkindel), 2014

 Converted to Typescript by Sam Pullman 2021
 */

enum CsvStates {
  PRE_TOKEN = 0,
  MID_TOKEN = 1,
  POST_TOKEN = 2,
  POST_RECORD = 4,
}

const QUOTE = '"'
const CR = '\r'
const LF = '\n'
const SPACE = ' '
const TAB = '\t'

const ERROR_EOF = 'UNEXPECTED_END_OF_FILE'
const ERROR_CHAR = 'UNEXPECTED_CHARACTER'
const ERROR_EOL = 'UNEXPECTED_END_OF_RECORD'
const WARN_SPACE = 'UNEXPECTED_WHITESPACE' // not per spec, but helps debugging

export class CsvParser {
  relaxed = false
  ignoreQuotes = false
  ignoreRecordLength = true
  debugEnabled = false

  separator = ','

  result: string[][] = []
  token: string = ''
  offset: number = 0
  str: string = ''
  escaped: boolean = false
  record?: string[] = undefined
  state: CsvStates = CsvStates.PRE_TOKEN

  /**
   * @name parse
   * @function
   * @description rfc4180 standard csv parse with options for strictness
   * @example
   * // simple
   * const rows = parse("one,two,three\nfour,five,six")
   * // rows equals [["one","two","three"],["four","five","six"]]

   * @see http://www.ietf.org/rfc/rfc4180.txt
   */
  parse(str: string): string[][] {
    this.result = []
    this.offset = 0
    this.str = str
    this.record_begin()

    this.debug('parse()', str)

    let c
    while (1) {
      // pull char
      c = str[this.offset++]
      this.debug('c', c)

      // detect eof
      if (c === undefined) {
        if (this.escaped) this.error(ERROR_EOF)

        if (this.record) {
          this.token_end()
          this.record_end()
        }
        break
      }

      if (this.record == undefined) {
        // if relaxed mode, ignore blank lines
        if (this.relaxed && (c == LF || (c == CR && str[this.offset + 1] == LF))) {
          continue
        }
        this.record_begin()
      }

      // pre-token: look for start of escape sequence
      if (this.state == CsvStates.PRE_TOKEN) {
        if ((c === SPACE || c === TAB) && this.next_nonspace() == QUOTE) {
          continue
        }

        if (c == QUOTE && !this.ignoreQuotes) {
          this.debug('...escaped start', c)
          this.escaped = true
          this.state = CsvStates.MID_TOKEN
          continue
        }
        this.state = CsvStates.MID_TOKEN
      }

      // mid-token and escaped, look for sequences and end quote
      if (this.state == CsvStates.MID_TOKEN && this.escaped) {
        if (c == QUOTE) {
          if (str[this.offset] == QUOTE) {
            this.debug('...escaped quote', c)
            this.token += QUOTE
            this.offset++
          } else {
            this.debug('...escaped end', c)
            this.escaped = false
            this.state = CsvStates.POST_TOKEN
          }
        } else {
          this.token += c
          this.debug(`...escaped add ${c} ${this.token}`)
        }
        continue
      }

      // fall-through: mid-token or post-token, not escaped
      if (c == CR || c == LF) {
        this.token_end()
        this.record_end()
      } else if (c == this.separator) {
        this.token_end()
      } else if (this.state == CsvStates.MID_TOKEN) {
        this.token += c
        this.debug('...add', c, this.token)
      } else if (c === SPACE || c === TAB) {
        // Whitespace is ok
      } else if (!this.relaxed) {
        this.error(ERROR_CHAR)
      }
    }
    const result = this.result
    this.reset()
    return result
  }

  reset() {
    this.state = CsvStates.PRE_TOKEN
    this.token = ''
    this.escaped = false
    this.record = undefined
    this.offset = 0
    this.result = []
    this.str = ''
  }

  next_nonspace() {
    let i = this.offset
    let c
    while (i < this.str.length) {
      c = this.str[i++]
      if (!(c == SPACE || c === TAB)) {
        return c
      }
    }
    return null
  }

  record_begin() {
    this.escaped = false
    this.record = []
    this.token_begin()
    this.debug('record_begin')
  }

  record_end() {
    this.state = CsvStates.POST_RECORD
    if (
      !(this.ignoreRecordLength || this.relaxed) &&
      this.result.length > 0 &&
      this.record?.length != this.result[0].length
    ) {
      this.error(ERROR_EOL)
    }
    if (this.record) {
      this.result.push(this.record)
    }
    this.debug('record end', this.record)
    this.record = undefined
  }

  token_begin() {
    this.state = CsvStates.PRE_TOKEN
    // considered using array, but http://www.sitepen.com/blog/2008/05/09/string-performance-an-analysis/
    this.token = ''
  }

  token_end() {
    this.record?.push(this.token)
    this.debug('token end', this.token)
    this.token_begin()
  }

  debug(...args: unknown[]) {
    if (this.debugEnabled) {
      console.log(args)
    }
  }

  dump(msg: string) {
    return [
      msg,
      'at char',
      this.offset,
      ':',
      this.str
        .substr(this.offset - 50, 50)
        .replace(/\r/gm, '\\r')
        .replace(/\n/gm, '\\n')
        .replace(/\t/gm, '\\t'),
    ].join(' ')
  }

  error(err: string) {
    const msg = this.dump(err)
    this.reset()
    throw msg
  }

  warn(err: string) {
    const msg = this.dump(err)
    console.warn(msg)
  }
}
