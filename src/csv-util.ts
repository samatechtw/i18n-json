import { CsvParser } from './csv'

const parser = new CsvParser()

export const parseCsv = (data: string): string[][] => {
  return parser.parse(data)
}

const stringifyEntry = (entry: string): string => {
  if (entry.includes(',')) {
    return `"${entry}"`
  }
  return entry
}

export const stringifyCsv = (csv: string[][]): string => {
  return csv.map((line) => line.map(stringifyEntry).join(',')).join('\n')
}
