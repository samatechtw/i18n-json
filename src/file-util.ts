import fs from 'fs'
import { join, extname } from 'path'
import fg from 'fast-glob'

export const getFileList = (path?: string): string[] => {
  if (path === undefined) {
    return []
  }
  let isDir
  try {
    var stat = fs.lstatSync(path)
    isDir = stat.isDirectory()
    if (isDir) {
      return fg.sync([`${path}/**/*.csv`, `${path}/**/*.json`])
    }
    return [join(process.cwd(), path)]
  } catch (e) {
    return []
  }
}

export const filterFilesByMode = (files: string[], mode: string): string[] => {
  return files.filter((file) => extname(file) === `.${mode}`)
}
