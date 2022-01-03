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

**Run tests**

```
pnpm run test
```

**Build library**

```
pnpm run build
```

**Run on local project**

Convert single JSON file to CSV

```
node ./bin/i18n-json.js -i ./test/json/translations/en.json -o ./test/output
```

Convert folder of JSON files to CSV, with `en.json` fallback

```
node ./bin/i18n-json.js -i ./test/json/translations -o ./test/output -f en.json
```

Convert CSV to JSON

```
node ./bin/i18n-json.js -i ./test/csv/translations/en.csv -o ./test/output
node ./bin/i18n-json.js -i ./test/csv/translations/en_kr.csv -o ./test/output
```
