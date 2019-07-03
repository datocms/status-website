import glob from 'glob'
import fs from 'fs'

export default function readData() {
  const incidents = glob.sync('./data/@(incidents|maintenances)/*.json').map(path => ({
    path,
    ...JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
  }));

  return { incidents };
}
