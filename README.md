Inventory Management System
This project provides a simple web-based inventory management system that allows you to add new tools, update existing tool details and quantities, and process tool "out" transactions (reducing stock or removing tools completely). All inventory data is stored and managed in a Google Sheet acting as the backend database.

✨ Features
Add New Tools: Easily input details for new tools, including Tool No., Tool Name, Min Qty, Qty In, and more.

Update Existing Tools: Increment the Qty In for existing tools to add more stock, or update other details like Tool Name, Description, etc.

Process Tool Out Transactions: Record when tools are taken out of inventory, updating the Qty Bal (Quantity Balance).

Full Tool Removal: Option to remove a tool completely from inventory, setting its Qty Bal to zero.

Real-time Inventory View: The table dynamically updates to show the current inventory data from your Google Sheet.

Quantity Balance Calculation: Qty Bal is automatically calculated based on Qty In and Qty Out.

Low Stock Alert: Qty Bal turns red in the table if it falls below the Min Qty.

User-Friendly Interface: Built with Tailwind CSS for a clean, responsive design.

Confirmation Modals: Custom confirmation prompts for critical actions like removing tools.

🛠️ Technologies Used
Frontend:

HTML: For the basic structure of the web page.

Tailwind CSS: A utility-first CSS framework for rapid and responsive styling.

JavaScript: For dynamic interactions, form handling, and communication with the Google Apps Script backend.

Backend:

Google Apps Script (GAS): A serverless platform that connects the frontend to Google Sheets, handling data reads, writes, and business logic.

Google Sheets: Serves as the database to store all inventory records.

🚀 Setup and Deployment
To get this inventory management system up and running, you need to set up both the Google Sheet and the Google Apps Script backend, and then deploy the frontend.

1. Google Sheet Setup
Create a New Google Sheet: Go to Google Sheets and create a new blank spreadsheet.

Name Your Sheet: Give it a descriptive name, e.g., "Inventory Database".

Set Up Headers: In the first row of the first sheet, enter the following headers exactly as they appear below (case-sensitive, including spaces and punctuation). These headers are crucial for the backend script to correctly identify columns:

Tool No. | Tool Name | POS No | TE Part No. | TFR No. | Description | Min Qty | Qty Bal | Type | Received | In-Date | Qty In | Given To | Out-Date | Qty Out

You can copy this row directly into your sheet's A1 cell:
Tool No.	Tool Name	POS No	TE Part No.	TFR No.	Description	Min Qty	Qty Bal	Type	Received	In-Date	Qty In	Given To	Out-Date	Qty Out

Get Spreadsheet ID:

The Spreadsheet ID is part of the URL of your Google Sheet. It's the long string of characters between /d/ and /edit in the URL.

Example URL: https://docs.google.com/spreadsheets/d/1ksKtP55E-bttSuge5O3chhBhABRwE3mUwfnUIVNo9D4/edit#gid=0

The ID would be: 1ksKtP55E-bttSuge5O3chhBhABRwE3mUwfnUIVNo9D4

Copy this ID; you'll need it for the backend script.

2. Google Apps Script (Backend) Deployment
Open Script Editor:

In your Google Sheet, go to Extensions > Apps Script. This will open a new browser tab with the Google Apps Script editor.

Paste Backend Code:

In the Apps Script editor, you'll see a file named Code.gs. Replace all the existing code in Code.gs with the backend code provided in the inventory-backend artifact.

Update Spreadsheet ID:

At the very top of the Code.gs script, locate the line:
const SPREADSHEET_ID = '1ksKtP55E-bttSuge5O3chhBhABRwE3mUwfnUIVNo9D4';

Replace '1ksKtP55E-bttSuge5O3chhBhABRwE3mUwfnUIVNo9D4' with the actual Spreadsheet ID you copied in step 1.4.

Save the Script: Click the floppy disk icon (Save project) or press Ctrl + S (Cmd + S).

Deploy as Web App:

Click the Deploy button (usually at the top right) and select New deployment.

Click Select type (the gear icon) and choose Web app.

Configure the deployment:

Description: (Optional) Add a brief description, e.g., "Inventory Management System".

Execute as: Me (your Google account). This ensures the script runs with your permissions to access the spreadsheet.

Who has access: Anyone. This makes the web app accessible to anyone with the URL. If you want to restrict it to only Google accounts, choose Anyone with Google account.

Click Deploy.

Authorization: The first time you deploy, Google will ask you to authorize the script.

Click Review permissions.

Select your Google account.

Review the permissions (e.g., "See, edit, create, and delete all your Google Sheets spreadsheets") and click Allow. This is necessary for the script to interact with your sheet.

After successful deployment, you will get a Web app URL. Copy this URL. This is the URL you'll open in your browser to use the application.

3. Frontend (HTML) Usage
Save Frontend File: Save the HTML code from the inventory-frontend artifact as an index.html file on your computer.

Open in Browser: Open this index.html file in your web browser.

Important Note: Because this HTML file interacts with Google Apps Script using google.script.run, it must be served from the Google Apps Script web app URL obtained in the deployment step (2.5). Opening the index.html file directly from your local file system (e.g., file:///C:/.../index.html) will not work for backend communication. You need to open the Web app URL that Google Apps Script provides after deployment.

👩‍💻 Usage
Access the Application: Open the Web app URL you obtained during the Google Apps Script deployment.

Current Inventory: The table at the bottom will automatically load and display your current inventory from the Google Sheet. Qty Bal will be highlighted in red if it falls below Min Qty.

Add/Update Tool:

Fill out the top form (Add New Tool / Update Existing Tool Details).

Enter a Tool No.. If it's a new tool, Tool Name is required.

Enter a Qty In to add stock.

Click Process Tool.

Process Tool Out / Remove Tool:

Fill out the middle form (Process Tool Out Transaction / Remove Tool).

Enter an existing Tool No..

To perform a partial removal, enter a Qty Out (e.g., 1 or 2).

To remove the tool completely, leave the Qty Out field blank.

Click Process Out / Remove Tool.

Confirm the action in the pop-up modal.

The Qty Bal in the table will update accordingly.

⚠️ Troubleshooting
If you encounter issues, here are some common troubleshooting steps:

"Tool Number Not Found" Error:

Check Sheet Headers: Ensure the column headers in your Google Sheet (especially "Tool No.") match the script exactly (case and spelling).

Check Data Entry: Ensure the Tool No. you are entering in the frontend matches what's in your sheet (case-insensitively). Avoid extra spaces.

Review Apps Script Logs: Go to your Apps Script project, click Executions in the left sidebar. Look for recent processOutTransaction executions. The logs will show the exact tool number being searched for and the values it's comparing against in your sheet. This is the most powerful debugging tool.

No Data Loading / Script Errors:

SPREADSHEET_ID: Double-check that the SPREADSHEET_ID in your Code.gs script is correct.

Deployment: Ensure you have deployed a new version of your web app after every code change in Apps Script.

Authorization: Confirm that the script was authorized properly during deployment. Re-deploying often prompts for re-authorization.

Browser Console: Open your browser's developer tools (F12), go to the Console tab, and look for any JavaScript errors.

Qty Bal Not Updating:

Check addOrUpdateToolDetails and processOutTransaction functions in your Apps Script logs to see if calculateQtyBalance is being called and if the new values are being written to the correct Qty Bal column index.
