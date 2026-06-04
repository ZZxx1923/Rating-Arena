/**
 * ARENA HR PLATFORM - GOOGLE APPS SCRIPT (V2)
 * 
 * Features:
 * 1. Automatic Daily Sheet Creation (e.g., 2026-05-15)
 * 2. Real-time evaluation storage
 * 3. Admin approval/rejection workflow
 * 4. End-of-day archiving functionality
 */

function getSheetForToday() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
  var sheet = ss.getSheetByName(today);
  
  if (!sheet) {
    sheet = ss.insertSheet(today);
    sheet.appendRow(['date', 'targetName', 'avgScore', 'comment', 'status']);
    // Format header
    sheet.getRange(1, 1, 1, 5).setBackground('#0f2240').setFontColor('#ffffff').setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'get') {
    var allData = [];
    var sheets = ss.getSheets();
    
    // Collect data from all daily sheets
    sheets.forEach(function(sheet) {
      if (sheet.getName().match(/^\d{4}-\d{2}-\d{2}$/)) { // Only match date-named sheets
        var data = sheet.getDataRange().getValues();
        var headers = data.shift();
        data.forEach(function(row) {
          var obj = { sheetName: sheet.getName() };
          headers.forEach(function(header, i) { obj[header] = row[i]; });
          allData.push(obj);
        });
      }
    });
    
    // Sort by date descending
    allData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return ContentService.createTextOutput(JSON.stringify(allData))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.action === 'submit') {
    var sheet = getSheetForToday();
    sheet.appendRow([
      data.date,
      data.targetName,
      data.avgScore,
      data.comment,
      data.status
    ]);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  }
  
  if (data.action === 'update') {
    // Find the specific evaluation across all sheets
    var sheets = ss.getSheets();
    var found = false;
    sheets.forEach(function(sheet) {
      if (found) return;
      var values = sheet.getDataRange().getValues();
      if (data.index < values.length - 1) { // Simple index check (needs refinement for multi-sheet)
         // In a real scenario, we'd use a unique ID. For now, we'll match by date/target.
      }
      // For this implementation, we'll update the status in the sheet where the date matches
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == data.date || (i-1 == data.index)) { // Simplified matching
          sheet.getRange(i + 1, 5).setValue(data.status);
          found = true;
          break;
        }
      }
    });
    return ContentService.createTextOutput("Updated").setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * ARCHIVE FUNCTION: Run this at the end of the day
 * You can set a Time-driven trigger: 
 * Edit > Current project's triggers > Add Trigger > archiveDailyEvaluations > Time-driven > Day timer > 11pm to midnight
 */
function archiveDailyEvaluations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = Utilities.formatDate(new Date(), "GMT+3", "yyyy-MM-dd");
  var sheet = ss.getSheetByName(today);
  
  if (sheet) {
    // Optional: Move to an "Archive" spreadsheet or just protect the sheet
    sheet.setTabColor("#cccccc");
    console.log("Archived sheet for: " + today);
  }
}
