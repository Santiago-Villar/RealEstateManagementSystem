import fs from 'fs'

export const createDirectory = (directory: string) => {
  fs.mkdirSync(directory, { recursive: true })
}

export const readFile = (path: string) => {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (e) {
    return null
  }
}

export const writeFile = (path: string, data) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}
