import { getRedisClient } from '../../config/redis/redisClient'
import { createDirectory, readFile, writeFile } from '../fileWriter'
import { runTasks } from './pipeline'

export const handleObservablePropery = (sensor, property, index) => {
  const filePath = property.path
  const baseDirectory = 'sensors'
  createDirectory(baseDirectory)

  saveSignalPriority(baseDirectory, property)

  const directory = `${baseDirectory}/${sensor.sensorId}`
  createDirectory(directory)

  writeFile(`${directory}/${filePath}`, {
    name: property.name,
    unit: property.unitOfMeasure,
    alertRegex: property.alertRegex,
    maxValue: property.maxValue,
    minValue: property.minValue,
    notify: property.notify,
  })

  sensor.observableProperties[index].path = `${directory}/${filePath}`
}

const saveSignalPriority = (baseDirectory, property) => {
  const prioFile = `${baseDirectory}/priorities.json`
  const rawPriorities = readFile(prioFile)
  const priorities = JSON.parse(rawPriorities)

  writeFile(prioFile, {
    ...priorities,
    [property.name]: property.priority,
  })
}

export const getSensorSignal = async (id, propName) => {
  const redis = getRedisClient()
  return await redis.get(`${id}/${propName}`)
}

const setSignal = (sensor, property, signal) => {
  const redis = getRedisClient()
  redis.set(`${sensor.sensorId}/${property.name}`, signal)
}

export const handleSignal = (sensor, signal, property) => {
  if (signal == null) {
    return
  }

  if (runTasks(sensor, signal, property)) {
    setSignal(sensor, property, signal)
  }
}
