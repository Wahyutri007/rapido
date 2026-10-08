function getMonthName(month: number) {
  const date = new Date();
  date.setMonth(month);
  return date.toLocaleString("id-ID", { month: "long" });
}

function formatDatePeriod(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth();
  const startYear = startDate.getFullYear();

  const endDay = endDate.getDate();
  const endMonth = endDate.getMonth();
  const endYear = endDate.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${getMonthName(startMonth)}`;
    }
    return `${startDay} ${getMonthName(startMonth)} - ${endDay} ${getMonthName(endMonth)}`;
  }

  return `${startDay} ${getMonthName(startMonth)} ${startYear} - ${endDay} ${getMonthName(endMonth)} ${endYear}`;
}

export { getMonthName, formatDatePeriod };
