Logger = BetterLog.useSpreadsheet("")
var scriptProperties = PropertiesService.getScriptProperties();

function doPost(e) {
  Logger.log("Setting mode to " + e.parameter.mode);
  scriptProperties.setProperty("MODE", e.parameter.mode);
}

var mode = scriptProperties.getProperty("MODE");

function doGet(e) {
  Logger.log("Method: " + e.parameter.method + " Name: " + e.parameter.name);
  
  if (e.parameter.method == 'opened' || e.parameter.method == 'closed')
  {
    if (mode != 'Home') {
      if (e.parameter.method == 'opened')
      {
        pushover('Opened', e.parameter.name, 1);
      }
      else if (e.parameter.method == 'closed')
      {
        pushover('Closed', e.parameter.name, 0);
      }
    }
  }
  else if (e.parameter.method == 'pir')
  {
    if (mode != 'Home') {
      pushover('Motion detected', e.parameter.name, 0);
    }
  }
  else if (e.parameter.method == 'toohot')
  {
    if (mode == 'Home') {
      pushover('Too hot - ' + e.parameter.temperature + '°', e.parameter.name, 0);
    }      
  }
  else if (e.parameter.method == 'toocold')
  {
    if (mode == 'Home') {
      pushover('Too cold - ' + e.parameter.temperature + '°', e.parameter.name, 0);
    }      
  }
  else if (e.parameter.method == 'dryerfinished')
  {
    dryerBot("Dryer is done!");
  }
  else if (e.parameter.method == 'torrentfinished')
  {
    torrentBot('Torrent ' + e.parameter.name + ' is finished'); 
  }
}

function pushovertest() {
 pushover('Test', 'Test Title', 0); 
}

function dryerbottest()
{
  dryerBot("Test message please ignore"); 
}

function dryerBot(msg)
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
};

function torrentbottest()
{
  torrentBot("Test message please ignore"); 
}

function torrentBot(msg)
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
};
