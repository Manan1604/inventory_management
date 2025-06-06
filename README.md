# Inventory Management System

A web-based inventory management system built with HTML, CSS, JavaScript, and Google Apps Script that allows you to track tools and equipment with real-time Google Sheets integration.

## Features

- **Add New Tools**: Register new tools with comprehensive details
- **Update Existing Tools**: Modify tool information and add stock
- **Process Tool Transactions**: Track when tools are given out or returned
- **Real-time Data**: Direct integration with Google Sheets for live data sync
- **Low Stock Alerts**: Visual indicators when tool quantities fall below minimum levels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Confirmation Dialogs**: Safety prompts for critical operations like tool removal


## Installation & Setup

### 1. Google Sheets Setup

1. Create a new Google Sheet with the following headers in row 1:
   ```
   Tool No. | Tool Name | POS No | TE Part No. | TFR No. | Description | Min Qty | Qty Bal | Type | Received | In-Date | Qty In | Given To | Out-Date | Qty Out
   ```

2. Note your Google Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 2. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with the contents of `Code.gs` from this repository
4. Update the `SPREADSHEET_ID` constant with your sheet ID:
   ```javascript
   const SPREADSHEET_ID = 'your-spreadsheet-id-here';
   ```
5. Add the HTML file:
   - Click the "+" next to "Files"
   - Choose "HTML"
   - Name it `index`
   - Replace the content with `index.html` from this repository

### 3. Deploy the Web App

1. In Google Apps Script, click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access: "Anyone with Google account" (or your preferred setting)
5. Click "Deploy"
6. Copy the web app URL provided

## Usage

### Adding New Tools

1. Fill in the tool details in the "Add New Tool" form
2. **Tool No.** is required for all operations
3. **Tool Name** is required for new tools
4. Set **Min Qty** to get low stock alerts
5. Enter **Qty In** to add initial stock
6. Click "Process Tool" to save

### Updating Existing Tools

1. Enter the existing **Tool No.**
2. Fill in any fields you want to update
3. Use **Qty In** to add more stock to existing tools
4. Click "Process Tool" to update

### Processing Tool Out/Removal

1. Enter the **Tool No.** in the "Process Tool Out" section
2. Fill in **Given To** and **Out-Date** for tracking
3. Enter **Qty Out** for partial removal, or leave blank for complete removal
4. Click "Process Out/Remove Tool"
5. Confirm the action in the popup dialog

## Data Fields

| Field | Description | Required |
|-------|-------------|----------|
| Tool No. | Unique identifier for each tool | Yes |
| Tool Name | Name/description of the tool | Yes (for new tools) |
| POS No | Point of Sale number | No |
| TE Part No. | Technical part number | No |
| TFR No. | Transfer number | No |
| Description | Detailed description | No |
| Min Qty | Minimum quantity threshold | No |
| Qty Bal | Current balance (auto-calculated) | Auto |
| Type | Tool category/type | No |
| Received | Person who received the tool | No |
| In-Date | Date tool was added | No |
| Qty In | Quantity added to stock | No |
| Given To | Person tool was given to | No |
| Out-Date | Date tool was taken out | No |
| Qty Out | Quantity removed from stock | No |

## Features in Detail

### Low Stock Alerts
- Tools with quantities below the minimum threshold are highlighted in red
- Helps maintain adequate inventory levels

### Data Validation
- Prevents taking out more tools than available
- Validates required fields before processing
- Confirms destructive operations

### Real-time Sync
- All changes are immediately reflected in Google Sheets
- Multiple users can access the same inventory data
- Changes are visible across all connected devices

## Technical Architecture

### Frontend (HTML/CSS/JavaScript)
- Modern CSS with Tailwind-inspired styling
- Vanilla JavaScript for interactivity
- Responsive design with mobile-first approach
- Loading states and user feedback

### Backend (Google Apps Script)
- Server-side processing in Google's cloud
- Direct integration with Google Sheets API
- Error handling and data validation
- RESTful-style function organization

### Data Storage (Google Sheets)
- Structured data storage
- Easy backup and export capabilities
- Collaborative access controls
- Version history and change tracking

## Troubleshooting

### Common Issues

**"Google Apps Script environment not detected"**
- This message appears when running locally or outside Google Apps Script
- The system requires Google Apps Script environment to function

**"Tool not found" errors**
- Verify the Tool No. matches exactly (case-sensitive)
- Check for leading/trailing spaces
- Ensure the tool exists in the inventory

**Data not loading**
- Check Google Apps Script permissions
- Verify the SPREADSHEET_ID is correct
- Ensure the Google Sheet is accessible

**Form submissions not working**
- Check browser console for errors
- Verify Google Apps Script deployment is active
- Check internet connection


## Security Considerations

- The system requires Google Account authentication
- Spreadsheet access is controlled by Google Sheets permissions
- Deploy with appropriate access restrictions ("Anyone with Google account" vs. organization-only)
- Consider data sensitivity when setting sharing permissions



---

**Note**: This system requires Google Apps Script and Google Sheets. It cannot function as a standalone HTML file due to the backend integration requirements.
