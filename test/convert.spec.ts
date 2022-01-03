import path from 'path'
import fs from 'fs'

describe('Converts JSON i18n to CSV', () => {
  beforeAll(() => {
    if (fs.existsSync('./test/output')) {
      fs.rmSync('./test/output', { recursive: true })
    }
    expect(fs.existsSync('./test/output')).toBe(false)
  })

  beforeEach(() => {
    jest.resetModules()
    jest.resetAllMocks()
  })

  it('fails if no input files provided', async () => {
    jest.mock('../src/util', () => ({
      ...jest.requireActual('../src/util'),
      errorExit: jest.fn(),
    }))
    const { errorExit } = require('../src/util')

    const TEST_ERROR = '__TEST_ERROR__'
    const exit = jest.spyOn(process, 'exit').mockImplementation((number) => {
      expect(number).toEqual(1)
      throw TEST_ERROR
    })
    await require('../src/cli')
    expect(errorExit).toHaveBeenCalledWith(TEST_ERROR)
    expect(exit).toHaveBeenCalledTimes(1)
  })

  it('converts json to csv', async () => {
    const p = path.resolve(__dirname, '..', 'src', 'cli.ts')
    process.argv = [
      'node',
      p,
      '-i',
      './test/json/translations/en.json',
      '-o',
      './test/output',
    ]
    await require('../src/cli')

    const expected = fs.readFileSync('./test/csv/translations/en.csv', 'utf-8')
    const result = fs.readFileSync('./test/output/en.csv', 'utf-8')
    expect(result).toEqual(expected)
  })

  it('converts multiple translations to csv', async () => {
    const p = path.resolve(__dirname, '..', 'src', 'cli.ts')
    process.argv = [
      'node',
      p,
      '-i',
      './test/json/translations',
      '-o',
      './test/output',
      '-f',
      'en.json',
    ]
    await require('../src/cli')

    const expected = fs.readFileSync('./test/csv/translations/en_kr.csv', 'utf-8')
    const result = fs.readFileSync('./test/output/en_kr.csv', 'utf-8')
    expect(result).toEqual(expected)
  })

  it('converts csv to json', async () => {
    const p = path.resolve(__dirname, '..', 'src', 'cli.ts')
    process.argv = [
      'node',
      p,
      '-i',
      './test/csv/translations/en.csv',
      '-o',
      './test/output',
    ]
    await require('../src/cli')

    const expected = fs.readFileSync('./test/json/translations/en.json', 'utf-8').trim()
    const result = fs.readFileSync('./test/output/en.json', 'utf-8').trim()
    expect(result).toEqual(expected)
  })
})
