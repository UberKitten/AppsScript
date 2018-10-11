var appSheet = SpreadsheetApp.openById("");
var cleanSheet = SpreadsheetApp.openById("-3KGWcFtY");

function processAppSheet() {
  var appData = appSheet.getDataRange().getValues();
  
  var cleanHeader = []
  var cleanData = [];
  
  var cleanDataIndex = 0;
  
  for (var i = 0; i < appData.length; i++) {
    // Header row
    if (appData[i][0] == "Id") {
      var headerRow = appData[i];
      var dataRow = appData[i+1];
      
      // Parse the columns and get the data we care about
      for (var k = 0; k < headerRow.length; k++) {
        
        // Not the weird date "2:20" or string "Event"
        if (typeof headerRow[k] == "string" && headerRow[k] != "Event") {
          
          var headerIndex = cleanHeader.indexOf(headerRow[k]);
          if (headerIndex == -1) {
            cleanHeader.push(headerRow[k]);
            headerIndex = cleanHeader.length - 1;
            cleanData[headerIndex] = [];
          }
          
          var obj = dataRow[k];
          
          if (cleanHeader[headerIndex] == 'From' || cleanHeader[headerIndex] == 'From' || cleanHeader[headerIndex] == 'Sched') {
            obj = parseDate(obj);
          }
          
          cleanData[headerIndex][cleanDataIndex] = obj;
        }
      }
      cleanDataIndex++;
      i++;
    }
  }
  
  // Transpose cleanData so columns are on top
  // http://stackoverflow.com/a/17428705
  var newArray = cleanData[0].map(function(col, i) { 
    return cleanData.map(function(row) { 
      return row[i];
    })
  });
  
  var sheet = cleanSheet.getSheetByName("Data");
  sheet.clear();
  
  var range = sheet.getRange(2, 1, newArray.length, cleanHeader.length);
  Logger.log(newArray);
  range.setValues(newArray);
  
  var range2 = sheet.getRange(1, 1, 1, cleanHeader.length);
  range2.setValues([cleanHeader]);
}

function parseDate(input) {
  if (input instanceof Date) {
    return input;
  }
  
  input = input.replace(/\. /g, "/");
  return new Date(input);
}
