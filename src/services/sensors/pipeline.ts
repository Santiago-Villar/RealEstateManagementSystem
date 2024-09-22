import { readFile } from '../fileWriter'
import { getTasks } from './Tasks/Task'

export async function runTasks(sensor, signal, property) {
  console.log('Pipeline started')

  const validationFile = readFile(property.path)
  const validation = JSON.parse(validationFile)

  const tasks = getTasks()
  var success = true
  try {
    tasks.forEach((task) => task.run(sensor, signal, property, validation))
  } catch (e) {
    console.log(e.message)
    success = false
  }

  console.log('Pipeline completed')
  return success
}
