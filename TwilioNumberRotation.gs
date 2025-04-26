Logger = BetterLog.useSpreadsheet('1QZFibgt-nNkDbx4yThLG7lSBzZLnRTixYUuIhfDka-U')

Tamotsu.initialize()
const PhoneNumbers = Tamotsu.Table.define({sheetName: 'Phone Numbers'})

const scriptProperties = PropertiesService.getScriptProperties()
const twilioAccountSid = scriptProperties.getProperty('twilioAccountSid')
const authHeader = "Basic " + Utilities.base64Encode(twilioAccountSid + ":" + scriptProperties.getProperty('twilioAuthToken'))
const defaultOptions = {
  "headers": {
    "Authorization": authHeader
  }
}

function getNumbers() {
  const response = UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/IncomingPhoneNumbers.json?PageSize=1000", defaultOptions)
  const resultText = response.getContentText()
  Logger.log(resultText)
  const result = JSON.parse(resultText)
  return result["incoming_phone_numbers"]
}

function getNewNumber() {
  const voiceApplicationSid = scriptProperties.getProperty('voiceApplicationSid')
  const messagingServiceSid = scriptProperties.getProperty('messagingServiceSid')

  const searchResponse = UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/AvailablePhoneNumbers/US/Local.json?SmsEnabled=true&VoiceEnabled=true&MmsEnabled=true&Beta=false&InRegion=CA&PageSize=20", defaultOptions)
  const searchResult = JSON.parse(searchResponse.getContentText())
  const availablePhoneNumbers = searchResult["available_phone_numbers"]

  if (availablePhoneNumbers.length <= 0) {
    throw 'Search returned no available phone numbers'
  }

  for (const availablePhoneNumber of availablePhoneNumbers) {
    const existingNumbers = PhoneNumbers.where({'phone_number': availablePhoneNumber["phone_number"]}).all()
    if (existingNumbers.length >= 1) {
      Logger.log("Skipping previously used number " + availablePhoneNumber["phone_number"])
    } else {
      Logger.log("Provisioning new number " + availablePhoneNumber["phone_number"])
      
      const provisionOptions = {
        "headers": {
          "Authorization": authHeader
        },
        "method": "post",
        "payload": {
          "PhoneNumber": availablePhoneNumber["phone_number"],
          "VoiceApplicationSid": voiceApplicationSid,
        }
      }
      const provisionResponse = UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/IncomingPhoneNumbers.json", provisionOptions)
      const provisionResult = JSON.parse(provisionResponse.getContentText())
      
      const newNumber = PhoneNumbers.create({
        "phone_number": provisionResult["phone_number"],
        "friendly_name": provisionResult["friendly_name"],
        "date_created": provisionResult["date_created"],
        "status": provisionResult["status"],
        "sid": provisionResult["sid"],
        "active": true,
      })
      
      const messagingOptions = {
        "headers": {
          "Authorization": authHeader
        },
        "method": "post",
        "payload": {
          "PhoneNumberSid": newNumber["sid"],
        }
      }
      const messagingResponse = UrlFetchApp.fetch("https://messaging.twilio.com/v1/Services/" + messagingServiceSid + "/PhoneNumbers", messagingOptions)
      const messagingResult = JSON.parse(messagingResponse.getContentText())

      return newNumber
    }
  }
}

function releaseNumber(number) {
  const options = {
        "headers": {
          "Authorization": authHeader
        },
        "method": "delete",
      }
  const response = UrlFetchApp.fetch("https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/IncomingPhoneNumbers/" + number["sid"] + ".json", options)

  number.updateAttributes({"status": "released"})
}

function testReleaseNumber() {
  const number = PhoneNumbers.where({
    'status': 'in-use',
    'active': 'false'
    }).first()
  releaseNumber(number)
}

function checkNumbers() {
  const stopUsingAfterXDays = scriptProperties.getProperty('stopUsingAfterXDays')
  const releaseAfterXDays = scriptProperties.getProperty('releaseAfterXDays')

  let activeNumbers = 0

  const numbers = PhoneNumbers.where({'status': 'in-use'}).all()
  for (const number of numbers) {
    const dateCreated = Date.parse(number["date_created"])
    const daysOld = Math.floor((Date.now() - dateCreated) / (1000 * 3600 * 24))

    if (number["active"] === "true") {
      if (daysOld > stopUsingAfterXDays) {
        Logger.log(number["phone_number"] + " is " + daysOld.toString() + " days old, marking inactive")
        number.updateAttributes({"active": false})
      } else {
        activeNumbers++
      }
    } else {
      if (daysOld > releaseAfterXDays) {
        Logger.log(number["phone_number"] + " is " + daysOld.toString() + " days old, releasing number")
        releaseNumber(number)
      } 
    }
  }

  if (activeNumbers <= 0) {
    Logger.log("No active phone numbers, acquiring new number")
    getNewNumber()
  }
}


// Twilio CRM callback API
function doGet(e) {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(params);
}
