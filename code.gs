// Variables for you to assign so it matches your settings.

var API_KEY = ''; // Replace with your IP2Location API key
var DATE_RANGE = 2; // Number of months to look back for emails
var EMAIL_LABEL = 'susp login'; // Replace with the desired Gmail label
var SUS_SHEET = 'sus logins' // Name of the Sheet you want the Suspicious Logins to populate


// Edit anything under this line at your own risk







// Logic for the button to clear the sheet
function clearData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUS_SHEET);
  if (sheet) {
    sheet.getRange('A2:H').clearContent();
  } else {
    Logger.log("Sheet not found.");
  }
}

// Make the menu
function runScript() {
  processEmailAlerts();
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Sus logins app')
    .addItem('Check for new sus logins', 'runScript')
    .addToUi();
}


// Look for emails and output the data to Sheet
function processEmailAlerts() {
  // Calculate the date range from today
  var dateRangeAgo = new Date();
  dateRangeAgo.setMonth(dateRangeAgo.getMonth() - DATE_RANGE);

  // Format the date as YYYY/MM/DD for the Gmail search query
  var formattedDate = Utilities.formatDate(dateRangeAgo, 'GMT', 'yyyy/MM/dd');

  // Construct the Gmail search query to filter emails within the specified date range and label
  var searchQuery = 'is:unread label:"' + EMAIL_LABEL + '" after:' + formattedDate;

  // Access your Gmail inbox
  var threads = GmailApp.search(searchQuery);

  // Get the active sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUS_SHEET);


  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();

    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var body = message.getPlainBody();

      // Extract user, IP address, and timestamp from the email body
      var user = extractUser(body);
      var ipAddress = extractIPAddress(body);
      var timestamp = extractTimestamp(body);
      var userOU = lookupUserOU(user);

      // Retrieve location information for the IP address using IP2Location API
      var locationInfo = getLocationInfo(ipAddress);

      // Write the extracted information to your Google Sheet
      writeToSheet(sheet, user, ipAddress, timestamp, locationInfo, userOU);

      // Mark the email as read to avoid processing it again
      message.markRead();
    }
  }
}
// Get user email
function extractUser(body) {
  var userMatch = /User: (.+)$/m.exec(body);
  if (userMatch) {
    return userMatch[1].trim();
  } else {
    return "";
  }
}
// Get IP of the login 
function extractIPAddress(body) {
  var ipMatch = /Attempted Login IP: (.+)$/m.exec(body);
  if (ipMatch) {
    return ipMatch[1].trim();
  } else {
    return "";
  }
}
// Get the date and time of the login
function extractTimestamp(body) {
  var timestampMatch = /Activity Date: (.+)$/m.exec(body);
  if (timestampMatch) {
    return timestampMatch[1].trim();
  } else {
    return "";
  }
}

// Find user OU
function lookupUserOU(userEmail) {
  try {
    // Make a request to the Directory API to get the user's information
    var user = AdminDirectory.Users.get(userEmail);

    // Get the Organizational Unit (OU) path for the user
    var ouPath = user.orgUnitPath;
    return ouPath;
    
  } catch (e) {
    Logger.log('Error looking up user OU: ' + e);
    return 'Not Found';
  }
}


// IP geolocation
function getLocationInfo(ipAddress) {
  var apiUrl = 'https://api.ip2location.io/?key=' + API_KEY + '&ip=' + ipAddress;

  try {
    var response = UrlFetchApp.fetch(apiUrl);
    var data = JSON.parse(response.getContentText());

    if (data && data.ip) {
      var country = data.country_name;
      var city = data.city_name;
      var latitude = data.latitude;
      var longitude = data.longitude;

      return { country: country, city: city, latitude: latitude, longitude: longitude };
    }
  } catch (error) {
    Logger.log('Error retrieving location information: ' + error.toString());
  }

  return { country: '', city: '', latitude: '', longitude: '' };
}

function writeToSheet(sheet, user, ipAddress, timestamp, locationInfo, userOU) {
  // Find the first empty row in the sheet
  var lastRow = sheet.getLastRow() + 1;
  // Combining long, lat and google maps
  var mapsUrl = 'http://maps.google.com/maps?q=' + locationInfo.latitude + "," + locationInfo.longitude;
  var displayText = locationInfo.latitude + "," + locationInfo.longitude;

  // We need to make use of the hyperlink formula to make the google maps link clickable
  var mapsLink = '=HYPERLINK("' + mapsUrl + '"; "' + displayText + '")';

  // Write the data to the sheet, including location information
  sheet.getRange(lastRow, 1).setValue(user);
  sheet.getRange(lastRow, 2).setValue(userOU);
  sheet.getRange(lastRow, 3).setValue(ipAddress);
  sheet.getRange(lastRow, 4).setValue(timestamp);
  sheet.getRange(lastRow, 5).setValue(locationInfo.country);
  sheet.getRange(lastRow, 6).setValue(locationInfo.city);
  sheet.getRange(lastRow, 7).setFormula(mapsLink);
}


