# i18n JSON

CLI tool for converting i18n translation files between json and csv.

WARNING - this tool is not well tested yet, and not recommended for production use. It overrides files, so make sure you're using version control!

## Usage

We recommend [PNPM](https://github.com/pnpm/pnpm) for reducing disk usage and speeding up installation for Javascript/Typescript projects.
`npm` may be substituted with `pnpm` in the following commands:

**Install**
```
pnpm install
```

**Run example**
```
pnpm run example:json
pnpm run example:csv
```

**Build library**
```
pnpm run build
```

**Run on local project**

Convert JSON to CSV
```
node dist/i18n-json.js --to-csv example -o ./example
```

Convert CSV to JSON
```
node dist/i18n-json.js --to-json example -o ./output
```
