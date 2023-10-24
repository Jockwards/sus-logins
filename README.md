# sus-logins
Google Sheet app that checks for suspicious logins 

Get the App Script code from the repo and create your own sheet or make a copy of this template:
https://docs.google.com/spreadsheets/d/1zsH_5Enaxj9VMJB9ihmvAImJ5rN1EnMM_j3aPBow3qw/copy

## Setup
Setup a filter for your alert emails with suspiscious logins and add a label to them.
Create an account at ip2location.io and get your API key.

Open up the script in Apps Script (Addons - Apps Script). Rows 3-6 have variables you can edit.

API_KEY - Replace with your IP2Location API key

DATE_RANGE - We don't want to look at every email ever, so specify in numbers of months how far back we should be looking.

EMAIL_LABEL - This is the label you set when you made the filter

SUS_SHEET - Name of the Sheet you want the Suspicious Logins to populate. If you copied my template then default is "sus logins".

## Premise	
If you have e-mail alerts setup whenever Google thinks there is a suspiscous login - then you know there are many false positives. 

There are of course situations when you'd want to investigate and perhaps take action. 

I made this script to help with this. It checks the user OU and also runs a geolocation on the IP. 

If for example you have a faculty member logging in from Russia - you'd probably want to take immediate action. While a student logging in from a neaby city can be ignored.				
					
## The Script
The script looks for emails with a user defined label, retrieves user email, IP and the date. Then checks what OU the user belongs to and then runs a geolocation on the IP. That e-mail is then marked as read to indicate that you've seen this and also so the script doesn't grab that e-mail again.

This data is then printed to the sheet along with the date. The coordinates is a clickable link to Google Maps.

Permissions needed for this are: Read your email, Write to Sheets, Connect to external site (Geolocation API) and Directory API (for OU lookup). 

I'm using ip2location.io for this since their free tier is very generous. It would not be too hard to modify the script to whatever geolocation API you want to use. 



