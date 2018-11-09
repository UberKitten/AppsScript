Logger = BetterLog.useSpreadsheet(SpreadsheetApp.getActiveSpreadsheet().getId())

function doGet(e) {
  var params = JSON.stringify(e)
  Logger.log(params)
}

function doPost(e) {
  Logger.log(JSON.stringify(e))
  
  var to = e.parameter.to
  Logger.log("To: " + to)
  
  if (to == "test@auto.ub3rk1tten.com") {
    Logger.log("Test flow")
  } else if (to == "chase@auto.ub3rk1tten.com") {
    Logger.log("Chase notification")
    
    var pushovertoken = "mytoken"
    var pushoveruser = "myusertoken"
    
    var cardregex = /account ending in ([0-9]*)\./i
    var cardmatch = cardregex.exec(e.parameter.text)
    var chargeregex = /A charge of \(\$([A-Z]*)\) ([0-9\.]*) at (.*) has been authorized on (.*)\./i
    var chargematch = chargeregex.exec(e.parameter.text)
    
    if (cardmatch && chargematch) {
      var row = [cardmatch[1], chargematch[1], chargematch[2], chargematch[3], chargematch[4]]
      Logger.log("New row: " + JSON.stringify(row))
      var sheet = SpreadsheetApp.openById("your-spreadsheet-id-here").getSheets()[0].appendRow(row)
      
      var title = ""
      if (chargematch[1] == "USD") {
        title = "$" + chargematch[2] + " - " + chargematch[3]
      } else {
        title = chargematch[2] + " " + chargematch[1] + " - " + chargematch[3]
      }
      var message = chargematch[4] + " (" + cardmatch[1] + ")"
      
      pushover(pushovertoken, pushoveruser, title, message)
    } else {
      pushover(pushovertoken, pushoveruser, e.parameter.text)  
    }
  } else if (to == "whatever@auto.ub3rk1tten.com") {
    
  }
}
