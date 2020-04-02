import fs from 'fs'
import { Readable } from 'stream'
import readline from 'readline'
import { dateGoggles } from './'
import chalk from 'chalk'

async function apply(stream: Readable): Promise<void> {
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  })
  const dateGogglesOptions = {
    formatDate: process.stdout.isTTY
      ? (date: Date): string => chalk.magenta(date.toLocaleString())
      : (date: Date): string => date.toLocaleString(),
  }
  await new Promise((resolve, reject) => {
    rl.on('error', reject)
    rl.on('close', resolve)
    rl.on('line', (line: string): void => {
      process.stderr.write(dateGoggles(line, dateGogglesOptions))
      process.stderr.write('\n')
    })
    rl.resume()
  })
}

async function go(): Promise<void> {
  const files = process.argv.slice(2).filter(a => !a.startsWith('-'))
  if (process.stdin.isTTY || files.length) {
    if (!files.length) {
      process.stderr.write(`Usage:
    
date-goggles file [files...]      processes the given files
command | date-goggles            processes stdin
`)
      process.exit(2)
    }
    for (const file of files) {
      await apply(fs.createReadStream(file))
    }
  } else {
    await apply(process.stdin)
  }
}

go().then(
  () => process.exit(0),
  (err: Error) => {
    console.error(err.stack) // eslint-disable-line no-console
    process.exit(1)
  }
)
