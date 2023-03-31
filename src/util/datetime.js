function DateFormat(seconds) {
  let date = new Date((seconds * 1000));
  return date.toLocaleDateString(
    'en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}
  ) + ' at ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

export {
  DateFormat
}