function DateFormat(seconds) {
  let date = new Date((seconds * 1000));
  let dminutes = (parseInt(date.getMinutes()) < 10) ? '0' + date.getMinutes() : date.getMinutes();
  // let dseconds =  (parseInt(date.getSeconds()) < 10) ? '0' + date.getSeconds() : date.getSeconds();
  let dateString = date.toLocaleDateString(
    'en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}
  ) + ' at ' + date.getHours() + ':' + dminutes;

  if (new Date().getTime() > date.getTime()) return "Expired on " + dateString;
  else return dateString;
}

export {
  DateFormat
}