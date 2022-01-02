import fs from 'fs'
import { parseCsv, stringifyCsv } from '../src/csv-util'

const TEST_CSV_ARRAY = [
  ['key', 'en', 'kr', 'fr', 'zh'],
  ['title', 'Title', 'title_kr', 'quoted, comma, s', '3000.00'],
  ['text', 'Text', 'kr "inside quotes"', '', '4900.00'],
  ['item', 'Item', 'inside "quotes with, a comma"', '', '5000.00'],
  ['1.2.3', 'one two three, loaded', '4799.00', ' 4', ' 5'],
  ['weird""quotes ', 'true', 'false', 't', 'f', '1.01'],
  ['.7', '8.', '9.1.2', 'null', 'undefined'],
  [
    'Null',
    'whitespace outside of quotes ok',
    'unquoted trailing',
    '   both   ',
    '   leading',
  ],
]

describe('Internal conversion commands', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('yargs')]
    jest.resetAllMocks()
  })

  it('converts csv to array', () => {
    const csvString = fs.readFileSync('./test/csv/test.csv', 'utf-8')

    const result = parseCsv(csvString)

    expect(result).toEqual(TEST_CSV_ARRAY)
  })

  it('stringifies array to csv format', () => {
    const result = stringifyCsv(TEST_CSV_ARRAY)

    expect(result).toEqual(`key,en,kr,fr,zh
title,Title,title_kr,"quoted, comma, s",3000.00
text,Text,kr "inside quotes",,4900.00
item,Item,"inside "quotes with, a comma"",,5000.00
1.2.3,"one two three, loaded",4799.00, 4, 5
weird""quotes ,true,false,t,f,1.01
.7,8.,9.1.2,null,undefined
Null,whitespace outside of quotes ok,unquoted trailing,   both   ,   leading`)
  })
})
