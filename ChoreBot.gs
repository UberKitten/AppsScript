Logger = BetterLog.useSpreadsheet("");

function annoySunday() {
};

function annoyWednesday() {
  var chores = getChores();
  groupmeChat("Chores due today: " + chores.dishwasher + " empty the drying rack, " + chores.counters + " clean the counters, " + chores.floors + " wipe the tables down, " + chores.trash + " is trash");
}

function annoySaturday() {
  var chores = getChores();
  groupmeChat("Last day for chores! Dishwasher: " + chores.dishwasher + " • Counters/Appliances: " + chores.counters + " • Floors/Tables: " + chores.floors + " • Trash: " + chores.trash);
};

function annoySaturdayNight() {
  var chores = getChores();
  groupmeChat(chores.counters + " cleans counters + stove + microwave + toaster oven, " + chores.floors + " vacuums carpet + Swiffers kitchen + wipes tables, " + chores.trash + " empties trash");
};

function groupmeListChores() {
  var schedule = getCurrentSchedule();
  for (var i = 1; i < schedule.chores.length - 1; i++) {
    groupmeChat(schedule.chores[i].chore.name + ": @" + schedule.chores[i].roomie.name);
    Utilities.sleep(1000);
  }
};

function doPost(e){
  var post = JSON.parse(e.postData.getDataAsString());
  if (post.sender_type == 'bot') { // Ignore
    return;
  }
  var text = post.text.toLowerCase();
  
  if (text.indexOf("@chorebot") != -1) {
    Logger.log("ChoreBot message: " + text);
    if (text.indexOf("help") != -1) {
      groupmeChat("Say @chorebot to get the list of chores for this week. Add on the name of a chore to get details for it.");
      return;
    }
    else  
    {
      var schedule = getCurrentSchedule();
      for (var i = 1; i < schedule.chores.length - 1; i++) {
        for (var k = 0; k < schedule.chores[i].chore.keywords.length; k++) {
          if (text.indexOf(schedule.chores[i].chore.keywords[k]) != -1) {
            groupmeChat(schedule.chores[i].chore.name + " (@" + schedule.chores[i].roomie.name + "): " + schedule.chores[i].chore.description);
            return;
          }
        }
      }
    }
    // No keywords found
    groupmeListChores();
  }
}

function groupmeChat(msg)
{
  var payload =
      {
        "text" : msg,
        "bot_id" : ""
      };
  
  var options =
      {
        "method" : "post",
        "payload" : payload
      };
  
  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", options);
  Logger.log("Sent chat: " + msg); 
};

function groupmeDM(recipient, msg)
{
  var myguid = guid();
  Logger.log(myguid);
  
  var payload =
      {
        "direct_message": {
          "source_guid": myguid,
          "recipient_id": recipient,
          "text": msg
        },
        "token": ""
      };
  
  var options =
      {
        "method" : "post",
        "payload" : payload
      };
  
  UrlFetchApp.fetch("https://api.groupme.com/v3/direct_messages", options);
  Logger.log("Sent DM (" + recipient + "): " + msg);
};

function getChores() {
  var wb = SpreadsheetApp.openById("");
  var sheet = wb.getSheetByName("Chores");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  var chores = [];
  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    chores[row[0]] = {
      id: row[0],
      name: row[1],
      keywords: row[2].split(','),
      description: row[3]
    };
  }
  return chores;
};

function getRoomies() {
  var wb = SpreadsheetApp.openById("");
  var sheet = wb.getSheetByName("Roomies");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  var roomies = [];
  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    roomies[row[0]] = {
      id: row[0],
      name: row[1],
      groupmeId: row[2]
    };
  }
  return roomies;
}

function getCurrentSchedule() {
  var wb = SpreadsheetApp.openById("");
  var sheet = wb.getSheetByName("Schedule");
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();
  
  var today = new Date();

  for (var i = 1; i < numRows; i++) {
    var row = values[i];
    var nextrow = values[i + 1];
    
    if (today <= nextrow[0] && today >= row[0]) {
      var schedule = {
        week: row[0],
        chores: []
      };
      var chores = getChores();
      var roomies = getRoomies();
      
      for (var k = 1; k <= chores.length; k++) {
        schedule.chores[k] = {
          chore: chores[k],
          roomie: roomies[row[1 + (k-1)*2]]
        };
      }
      return schedule;
    }
  }
};
