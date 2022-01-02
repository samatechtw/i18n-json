import { extname } from 'path'

// Infers the mode based in input files, and whether a required mode has been specified.
// If the required mode conflicts with the input files, return undefined
export const inferMode = (
  fileList: string[],
  requiredMode?: string,
): string | undefined => {
  if (fileList.length === 0) {
    return requiredMode
  }
  const fileExtensions = fileList.map((name) => extname(name).replace('.', ''))
  const mode = requiredMode ?? fileExtensions[0]
  if (fileExtensions.every((ext) => ext === mode)) {
    return mode
  }
  return undefined
}

const flattenRecurse = (
  object: Record<string, any>,
  prefix: string,
  result: string[][],
) => {
  for (const [key, value] of Object.entries(object)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(value)) {
      throw new Error(`Arrays are not supported, current prefix="${nextPrefix}"`)
    }
    if (typeof value === 'string') {
      result.push([nextPrefix, value])
    } else if (typeof value === 'object') {
      flattenRecurse(value, nextPrefix, result)
    } else {
      throw new Error(
        `Non-string primitives are not supported, current prefix="${nextPrefix}", value=${value}`,
      )
    }
  }
}

// Flatten a JSON object, e.g.
// flatten({ a: '1', b: { c: '3' } })
// = { 'a': '1', 'b.c': '3' }
export const flatten = (object: Record<string, any>, prefix?: string): string[][] => {
  const result: string[][] = []
  flattenRecurse(object, prefix ?? '', result)
  return result
}

export const errorExit = (error?: string) => {
  if (error) {
    console.error(error)
  }
  process.exitCode = 1
}

export const unpackDotEntry = (
  target: Record<string, any>,
  key: string,
  value: string,
) => {
  const keyArr = key.split('.')
  let entry = target
  for (let i = 0; i < keyArr.length - 1; i += 1) {
    const keyPart = keyArr[i]
    if (entry[keyPart] === undefined) {
      entry[keyPart] = {}
    }
    entry = entry[keyPart]
  }
  entry[keyArr[keyArr.length - 1]] = value
}
