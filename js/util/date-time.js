import moment from 'moment'

import type {CurrentQuery} from '../types/query'

export const dayOfWeekOptions: string[] = ['Mon-Fri', 'Saturday', 'Sunday']
export const endHourOptions: string[] = []
export const endHourValues: string[] = []
export const startHourOptions: string[] = ['Midnight']
export const startHourValues: string[] = ['0:00']

for (let i: number = 1; i < 12; i++) {
  const curHourOption: string = `${i}am`
  const curHourValue: string = `${i}:00`
  endHourOptions.push(curHourOption)
  endHourValues.push(curHourValue)
  startHourOptions.push(curHourOption)
  startHourValues.push(curHourValue)
}

endHourOptions.push('Noon')
endHourValues.push('12:00')
startHourOptions.push('Noon')
startHourValues.push('12:00')

for (let i: number = 1; i < 12; i++) {
  const curHourOption: string = `${i}pm`
  const curHourValue: string = `${i + 12}:00`
  endHourOptions.push(curHourOption)
  endHourValues.push(curHourValue)
  startHourOptions.push(curHourOption)
  startHourValues.push(curHourValue)
}

endHourOptions.push('Midnight')
endHourValues.push('23:59')

export function getDayType (date: string): string {
  const planDayOfWeek = moment(date).day()
  switch (planDayOfWeek) {
    case 0:
      return 'Sunday'
    case 6:
      return 'Saturday'
    default:
      return 'Mon-Fri'
  }
}

export function getTimeValue (
  type: 'start' | 'end',
  currentQuery: CurrentQuery
): string {
  const {time} = currentQuery
  if (type === 'start') {
    return startHourOptions[
      startHourValues.indexOf(
        time.start
      )
    ]
  } else {
    return endHourOptions[
      endHourValues.indexOf(
        time.end
      )
    ]
  }
}
