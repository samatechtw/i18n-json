import fs from 'fs'
import path from 'path'
import { errorExit, flatten, unpackDotEntry } from './util'
import { parseCsv, stringifyCsv } from './csv-util'

export interface ConversionData {
  fileNames: string[]
  fallbackIndex: number
  outDir: string
  outputExt: string
}

export function toCsv(data: ConversionData) {
  const { fileNames, outDir, fallbackIndex, outputExt } = data
  const filesData = fileNames.map((file) => fs.readFileSync(file).toString())

  const fallbackJson = JSON.parse(filesData[fallbackIndex])
  const flattened: [string, string[]][] = flatten(fallbackJson).map(([k, t]) => [k, [t]])
  const fallbackReference = Object.fromEntries(flattened)

  for (let i = 0; i < filesData.length; i += 1) {
    if (i === fallbackIndex) {
      continue
    }
    const translation = flatten(JSON.parse(filesData[i]))
    // Append translations to existing entries
    for (const [key, value] of translation) {
      const entry = fallbackReference[key]
      if (entry) {
        entry.push(value)
      } else {
        console.warn(`Key ${key} not present in fallback`)
      }
    }
    // Fill blank entries with empty string
    for (const [_key, entry] of flattened) {
      if (entry.length !== i + 2) {
        entry.push('')
      }
    }
  }

  const header = `key,${fileNames.map((file) => path.parse(file).name).join(',')}\n`
  const result = header + stringifyCsv(flattened.map((entry) => [entry[0], ...entry[1]]))

  const name = `${fileNames.map((file) => path.parse(file).name).join('_')}.${outputExt}`
  const outputFile = path.join(outDir, name)
  console.log('Writing', outputFile)
  fs.writeFileSync(outputFile, result)
}

export function toJson(data: ConversionData) {
  const { fileNames, outDir, outputExt } = data
  // TODO -- implement multiple files support?
  if (fileNames.length > 1) {
    errorExit('CSV -> JSON conversion only supports a single file')
  }
  const filesData = fs.readFileSync(fileNames[0]).toString()

  const entries = parseCsv(filesData)
  const header = entries[0]
  console.log(filesData)
  if (!header.length || header[0].toLowerCase() !== 'key') {
    errorExit('Missing or corrupted header')
  }
  for (let i = 1; i < header.length; i += 1) {
    const json = {}
    for (const entry of entries.slice(1)) {
      if (entry[i]) {
        unpackDotEntry(json, entry[0], entry[i])
      }
    }
    const result = JSON.stringify(json, null, 2)

    const name = `${header[i]}.${outputExt}`
    const outputFile = path.join(outDir, name)
    console.log('Writing', outputFile)
    fs.writeFileSync(outputFile, result)
  }
}
