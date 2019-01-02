import { loadJsonFileSync } from 'datafile'
export const defaultState = loadJsonFileSync(__dirname + '/stateDefault.yml')
