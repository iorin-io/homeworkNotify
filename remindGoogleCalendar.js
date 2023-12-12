// Googleカレンダ関連
var calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID'); // カレンダーID (基本的にメールアドレス)

// Discord関連 (Incoming WEB hook を1つ用意してください)
var mention = PropertiesService.getScriptProperties().getProperty('DISCORD_USER_ID'); // メンション宛先
var username = '課題通知';  // 通知時に表示されるユーザー名
var incomingHookUrl = PropertiesService.getScriptProperties().getProperty('WEBHOOK'); // Incoming WEB Hook URL

// 関数定義 //////////////////////////////////////////////////////////////////////////////////////////////////////////////

function remindGoogleCalendar() {
  let messageArray = getUpcomingEvents();

  if (messageArray.length > 0) {
    let joinedMessage = messageArray.join("\n");
    redirectToDiscord(joinedMessage);
  } else {
    redirectToDiscord("36時間以内に課題はありません");
  }
}

function getUpcomingEvents() {
  let eventsArray = [];
  var now = new Date();
  var endTime = new Date();
  endTime.setDate(now.getDate() + 7);

  var cal = CalendarApp.getCalendarById(calendarId);
  var events = cal.getEvents(now, endTime);

  for (var i = 0; i < events.length; i++) {
    var eventStartTime = events[i].getStartTime();
    var eventName = events[i].getTitle();

    if (isWithin36Hours(eventStartTime, now)) {
      var startTimeJST = Utilities.formatDate(eventStartTime, "JST", "MM/dd (E) HH:mm");
      var message = "課題通知: " + startTimeJST + " " + eventName + mention + "\n";
      eventsArray.push(message);
    }
  }

  return eventsArray;
}

function isWithin36Hours(eventTime, now) {
  var thirtySixHoursBefore = new Date(now.getTime() + 36 * 60 * 60 * 1000);
  return eventTime > now && eventTime < thirtySixHoursBefore;
}

// Discord通知関数

function redirectToDiscord(message) {
  var jsonData = {
    "username": username,
    "text": message
  };
  var payload = JSON.stringify(jsonData);

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": payload
  };

  UrlFetchApp.fetch(incomingHookUrl, options);
}

// End
