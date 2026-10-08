import id from 'dayjs/locale/id'
import dayjs from "dayjs"

export default function useDayJS() {
  dayjs.locale(id)
  
  return {
    dayjs,
    formatDate: (date: string | number | Date, format: string) => {
      return dayjs(date).locale("id").format(format)
    }
  }
}
