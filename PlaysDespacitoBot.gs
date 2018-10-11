Spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
Logger = BetterLog.useSpreadsheet(Spreadsheet.getId())

function getDespacito(despacito)
{
  if (!despacito || despacito == "1")
  {
    despacito = ""
  }
  
  if (despacito == "" || despacito == "2")
  {
    return "ɴᴏᴡ ᴘʟᴀʏɪɴɢ: Despacito " + despacito + "\n" +
"\n" +
"───────⚪─────────────────\n" +
"\n" +
"◄◄⠀▐▐ ⠀►►⠀⠀1:17 / 3:48 ⠀───○ 🔊"
  } else {
    // HE COMES
    return "ɴᴏ͠ᴡ̡ ̷ᴘʟ͜ᴀʏɪɴ̸ɢ̵: ̷De͢s͘p͞a͜c҉i̸t͝o " + despacito + "\n" +
"\n" +
"̡─̸──͠──͢─͢─⚪̶─͝───̢──̛─͠─̵─────̡──̷──\n" +
"\n" +
"͞◄◄⠀▐̨▐̨ ̡⠀►̀►̵⠀⠀1:1͟7 ̛/͡ 3:̀4͠8̧ ⠀─̢─̢─̶○̡ 🔊"
  }
}

function doGet(e) {
  var params = JSON.stringify(e)
  Logger.log(params)
}

function doPost(e) {
  var params = JSON.parse(e.postData.contents)
  
  var regex = /Alexa .{0,10}play .{0,10}Despacito ?([0-9])?/i
  var match = regex.exec(params.text)

  if (match) {
    var botId = getBotId(params.group_id)
    Logger.log("Playing Despacito in response to: %s", params.text)
    botPost(botId, getDespacito(match[1]))
  }
}

function getBotId(groupId) {
  var sheet = Spreadsheet.getSheetByName("Bot IDs")
  var column = 1 // column Index   
  var columnValues = sheet.getRange(2, column, sheet.getLastRow()).getValues() // 1st is header row
  var searchResult = columnValues.findIndex(groupId)
  
  if (searchResult == -1) {
    Logger.log("Could not match group ID %s", groupId)
  } else {
    //searchResult + 2 is row index
    var botId = sheet.getRange(searchResult + 2, 2).getCell(1, 1).getValue()
    Logger.log("Matched group ID %s[...] with Bot ID %s[...]", groupId.substring(1,4), botId.substring(1,4))
    
    return botId
  }
}

function test() {
  var e = {
    "parameter": {},
    "contextPath": "",
    "contentLength": 334,
    "queryString": "",
    "parameters": {},
    "postData": {
        "type": "application/json",
        "length": 334,
        "contents": "{\"attachments\":[],\"avatar_url\":\"\",\"created_at\":1,\"group_id\":\"1\",\"id\":\"1\",\"name\":\"1\",\"sender_id\":\"1\",\"sender_type\":\"user\",\"source_guid\":\"1\",\"system\":false,\"text\":\"this is so sad alexa play despacito 4 bottom text\",\"user_id\":\"1\"}",
        "name": "postData"
    }
  }
  doPost(e)
}
