import fs from 'fs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { toJson, toCsv } from './convert'
import { filterFilesByMode, getFileList } from './file-util'
import { inferMode, errorExit } from './util'

interface Arguments {
  o: string
  i: string
  d?: boolean
  m?: string
  f?: string
}

try {
  const argv = yargs(hideBin(process.argv))
    .options({
      o: {
        alias: 'output',
        type: 'string',
        default: './output',
        describe: 'Output directory',
      },
      i: {
        alias: 'input',
        type: 'string',
        describe: 'Input file or directory to convert (relative path)',
        required: true,
      },
      d: {
        alias: 'dedup',
        type: 'boolean',
        describe: 'Warn on duplicate values',
      },
      m: {
        alias: 'mode',
        type: 'string',
        describe:
          'Conversion from/input filetype. If a single input file is provided, the mode can be inferred.',
        choices: ['json', 'csv'],
        default: undefined,
      },
      f: {
        alias: 'fallback',
        type: 'string',
        describe:
          'Filename of fallback translation, which defines the list of keys. Required if input contains multiple translations. Example: en.json',
      },
    })
    .usage('Convert i18n files between JSON and CSV').argv as Arguments

  console.log('Running i18n converter')
  console.log(`Writing to ${argv.o}`)
  const unfilteredFiles = getFileList(argv.i)
  const mode = inferMode(unfilteredFiles, argv.m)

  if (unfilteredFiles.length === 0) {
    console.log('File or directory must be provided with -i or --input')
    errorExit()
  } else if (unfilteredFiles.length > 1 && !argv.f) {
    errorExit('Fallback must be provided with multiple translations')
  } else if (!mode) {
    console.log('Unable to infer mode, or files conflict with input mode')
    console.log('Mode:', mode)
    console.log('Files:', unfilteredFiles)
    errorExit()
  } else {
    const files = filterFilesByMode(unfilteredFiles, mode)
    const fallbackIndex = argv.f
      ? files.findIndex((file) => argv.f === path.parse(file).base)
      : 0
    if (fallbackIndex === -1) {
      console.log(`Fallback file ${argv.f} does not match any input files`)
      errorExit()
    }

    const converter = mode === 'json' ? toCsv : toJson
    const outputExt = mode === 'json' ? 'csv' : 'json'
    const outDir = path.join(process.cwd(), argv.o)
    fs.mkdirSync(outDir, { recursive: true })

    try {
      converter({
        fileNames: files,
        fallbackIndex,
        outDir,
        outputExt,
      })
    } catch (e) {
      console.log(e)
      console.log('Failed to convert', 'to', outputExt)
    }
  }
} catch (e: any) {
  errorExit(e.toString())
}
