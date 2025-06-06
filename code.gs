const SPREADSHEET_ID = '1ksKtP55E-bttSuge5O3chhBhABRwE3mUwfnUIVNo9D4';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Inventory Management System');
}

function readInventoryData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow <= 1) {
      return { status: 'success', message: 'No data found', data: [] };
    }
    
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = allData[0];
    
    const headerMap = {};
    headers.forEach((header, index) => {
      if (header && header.toString().trim() !== '') {
        headerMap[header.toString().trim()] = index;
      }
    });
    
    const inventoryItems = [];
    
    for (let i = 1; i < allData.length; i++) {
      const row = allData[i];
      
      if (row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }
      
      const item = {
        toolno: getValueFromRow(row, headerMap, 'Tool No.') || '',
        toolname: getValueFromRow(row, headerMap, 'Tool Name') || '',
        posno: getValueFromRow(row, headerMap, 'POS No') || '',
        tepartno: getValueFromRow(row, headerMap, 'TE Part No.') || '',
        tfrno: getValueFromRow(row, headerMap, 'TFR No.') || '',
        description: getValueFromRow(row, headerMap, 'Description') || '',
        minqty: parseNumberValue(getValueFromRow(row, headerMap, 'Min Qty')),
        qtybal: parseNumberValue(getValueFromRow(row, headerMap, 'Qty Bal')),
        type: getValueFromRow(row, headerMap, 'Type') || '',
        received: getValueFromRow(row, headerMap, 'Received') || '',
        indate: formatDateValue(getValueFromRow(row, headerMap, 'In-Date')) || '',
        qtyin: parseNumberValue(getValueFromRow(row, headerMap, 'Qty In')),
        givento: getValueFromRow(row, headerMap, 'Given To') || '',
        outdate: formatDateValue(getValueFromRow(row, headerMap, 'Out-Date')) || '',
        qtyout: parseNumberValue(getValueFromRow(row, headerMap, 'Qty Out'))
      };
      
      inventoryItems.push(item);
    }
    
    return { 
      status: 'success', 
      message: 'Data loaded successfully', 
      data: inventoryItems 
    };
    
  } catch (error) {
    return { 
      status: 'error', 
      message: 'Error reading inventory data: ' + error.message,
      data: [] 
    };
  }
}

function processToolWrapper(itemData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    return addOrUpdateToolDetails(sheet, itemData);
  } catch (error) {
    return { status: 'error', message: 'Failed to process tool: ' + error.message };
  }
}

function processOutWrapper(transactionData) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheets()[0];
    return processOutTransaction(sheet, transactionData);
  } catch (error) {
    return { status: 'error', message: 'Failed to process tool out: ' + error.message };
  }
}

function getValueFromRow(row, headerMap, headerName) {
  const index = headerMap[headerName];
  if (index !== undefined && index < row.length) {
    const value = row[index];
    if (typeof value === 'number' || typeof value === 'boolean' || value instanceof Date) {
      return value;
    }
    return value !== null && value !== undefined ? String(value).trim() : '';
  }
  return '';
}

function calculateQtyBalance(qtyIn, qtyOut) {
  const numQtyIn = parseNumberValue(qtyIn);
  const numQtyOut = parseNumberValue(qtyOut);
  const qtyBalance = numQtyIn - numQtyOut;
  return isNaN(qtyBalance) ? 0 : qtyBalance;
}

function parseNumberValue(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

function formatDateValue(value) {
  if (!value) return '';
  
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
  } catch (e) {
  }
  
  return String(value);
}

function addOrUpdateToolDetails(sheet, toolData) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const toolNoColumnIndex = headers.indexOf('Tool No.');

  if (toolNoColumnIndex === -1) {
    return { status: 'error', message: 'Spreadsheet missing "Tool No." header.' };
  }

  const lastRow = sheet.getLastRow();
  let existingRowIndex = -1;
  
  if (lastRow > 1) {
    const toolNoRange = sheet.getRange(2, toolNoColumnIndex + 1, lastRow - 1, 1);
    const allToolNos = toolNoRange.getValues();
    
    for (let i = 0; i < allToolNos.length; i++) {
      const cellValue = allToolNos[i][0];
      const toolNoInSheet = cellValue ? cellValue.toString().trim() : '';
      
      if (toolNoInSheet === toolData.toolNo.trim()) {
        existingRowIndex = i + 2;
        break;
      }
    }
  }

  let message = '';

  if (existingRowIndex === -1) {
    // New tool
    const newRow = Array(headers.length).fill('');
    newRow[toolNoColumnIndex] = toolData.toolNo;

    headers.forEach((header, index) => {
      if (header === 'Tool Name') newRow[index] = toolData.toolName || '';
      else if (header === 'POS No') newRow[index] = toolData.posNo || '';
      else if (header === 'TE Part No.') newRow[index] = toolData.tePartNo || '';
      else if (header === 'TFR No.') newRow[index] = toolData.tfrNo || '';
      else if (header === 'Description') newRow[index] = toolData.description || '';
      else if (header === 'Min Qty') newRow[index] = parseNumberValue(toolData.minQty);
      else if (header === 'Type') newRow[index] = toolData.type || '';
      else if (header === 'Received') newRow[index] = toolData.received || '';
      else if (header === 'In-Date') newRow[index] = toolData.inDate || '';
    });

    const qtyIn = parseNumberValue(toolData.qtyIn);
    const qtyOut = 0; 
    const qtyBal = calculateQtyBalance(qtyIn, qtyOut);
    
    const qtyInIndex = headers.indexOf('Qty In');
    const qtyOutIndex = headers.indexOf('Qty Out');
    const qtyBalIndex = headers.indexOf('Qty Bal');
    
    if (qtyInIndex !== -1) newRow[qtyInIndex] = qtyIn;
    if (qtyOutIndex !== -1) newRow[qtyOutIndex] = qtyOut;
    if (qtyBalIndex !== -1) newRow[qtyBalIndex] = qtyBal;

    sheet.appendRow(newRow);
    SpreadsheetApp.flush();
    message = `New tool "${toolData.toolNo}" added successfully. Qty In: ${qtyIn}, Qty Bal: ${qtyBal}.`;
    
  } else {
    // Existing tool
    const existingRowData = sheet.getRange(existingRowIndex, 1, 1, headers.length).getValues()[0];
    
    let currentQtyIn = parseNumberValue(existingRowData[headers.indexOf('Qty In')]);
    let currentQtyOut = parseNumberValue(existingRowData[headers.indexOf('Qty Out')]);
    const newQtyIn = parseNumberValue(toolData.qtyIn);

    headers.forEach((header, index) => {
      if (header === 'Tool Name' && toolData.toolName) existingRowData[index] = toolData.toolName;
      else if (header === 'POS No' && toolData.posNo) existingRowData[index] = toolData.posNo;
      else if (header === 'TE Part No.' && toolData.tePartNo) existingRowData[index] = toolData.tePartNo;
      else if (header === 'TFR No.' && toolData.tfrNo) existingRowData[index] = toolData.tfrNo;
      else if (header === 'Description' && toolData.description) existingRowData[index] = toolData.description;
      else if (header === 'Min Qty' && (toolData.minQty !== undefined && toolData.minQty !== '')) existingRowData[index] = parseNumberValue(toolData.minQty);
      else if (header === 'Type' && toolData.type) existingRowData[index] = toolData.type;
      else if (header === 'Received' && toolData.received) existingRowData[index] = toolData.received;
      else if (header === 'In-Date' && toolData.inDate) existingRowData[index] = toolData.inDate;
    });

    currentQtyIn += newQtyIn;
    const newQtyBal = calculateQtyBalance(currentQtyIn, currentQtyOut);
    
    if (headers.indexOf('Qty In') !== -1) {
      existingRowData[headers.indexOf('Qty In')] = currentQtyIn;
    }
    if (headers.indexOf('Qty Bal') !== -1) {
      existingRowData[headers.indexOf('Qty Bal')] = newQtyBal;
    }
    
    if (headers.indexOf('Given To') !== -1) existingRowData[headers.indexOf('Given To')] = '';
    if (headers.indexOf('Out-Date') !== -1) existingRowData[headers.indexOf('Out-Date')] = '';

    sheet.getRange(existingRowIndex, 1, 1, headers.length).setValues([existingRowData]);
    SpreadsheetApp.flush();
    
    message = `Tool "${toolData.toolNo}" updated. Added ${newQtyIn} to stock. Total Qty In: ${currentQtyIn}, Qty Out: ${currentQtyOut}, New Balance: ${newQtyBal}.`;
  }

  return { status: 'success', message: message };
}

function processOutTransaction(sheet, transactionData) {
  if (!transactionData || !transactionData.toolNo || transactionData.toolNo.trim() === '') {
    return { status: 'error', message: 'Tool number is required for out transaction.' };
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const toolNoColumnIndex = headers.indexOf('Tool No.');
  const qtyInColumnIndex = headers.indexOf('Qty In');
  const qtyOutColumnIndex = headers.indexOf('Qty Out');
  const qtyBalColumnIndex = headers.indexOf('Qty Bal');
  const givenToColumnIndex = headers.indexOf('Given To');
  const outDateColumnIndex = headers.indexOf('Out-Date');

  if (toolNoColumnIndex === -1 || qtyInColumnIndex === -1 || qtyOutColumnIndex === -1 || qtyBalColumnIndex === -1) {
    return { status: 'error', message: 'Spreadsheet missing required quantity headers (Tool No., Qty In, Qty Out, or Qty Bal).' };
  }

  const lastRow = sheet.getLastRow();
  let existingRowIndex = -1;
  
  // Use the same logic as addOrUpdateToolDetails for finding the tool
  if (lastRow > 1) {
    const toolNoRange = sheet.getRange(2, toolNoColumnIndex + 1, lastRow - 1, 1);
    const allToolNos = toolNoRange.getValues();
    
    const searchToolNo = transactionData.toolNo.trim();
    
    for (let i = 0; i < allToolNos.length; i++) {
      const cellValue = allToolNos[i][0];
      const toolNoInSheet = cellValue ? cellValue.toString().trim() : '';
      
      if (toolNoInSheet === searchToolNo) {
        existingRowIndex = i + 2; // +2 because we start from row 2 (after header)
        break;
      }
    }
  }

  if (existingRowIndex === -1) {
    return { status: 'error', message: `Tool "${transactionData.toolNo}" not found in inventory. Please check the tool number and try again.` };
  }

  const rowData = sheet.getRange(existingRowIndex, 1, 1, headers.length).getValues()[0];
  
  const currentQtyIn = parseNumberValue(rowData[qtyInColumnIndex]);
  const currentQtyOut = parseNumberValue(rowData[qtyOutColumnIndex]);
  const currentQtyBal = parseNumberValue(rowData[qtyBalColumnIndex]);
  
  let qtyToReduce = 0;
  let message = '';

  if (transactionData.isCompleteRemoval) {
    qtyToReduce = currentQtyBal;
    message = `Tool "${transactionData.toolNo}" removed completely.`;
  } else {
    qtyToReduce = parseNumberValue(transactionData.qtyOut);
    if (qtyToReduce <= 0) {
      return { status: 'error', message: 'Valid quantity out (greater than 0) is required for partial removal.' };
    }
    
    if (qtyToReduce > currentQtyBal) {
      return { 
        status: 'error', 
        message: `Cannot take out ${qtyToReduce} of "${transactionData.toolNo}". Only ${currentQtyBal} available in balance.` 
      };
    }
    message = `Tool "${transactionData.toolNo}" - took out ${qtyToReduce}.`;
  }
  
  const newQtyOut = currentQtyOut + qtyToReduce;
  const newQtyBal = calculateQtyBalance(currentQtyIn, newQtyOut);
  
  try {
    // Update the row data
    rowData[qtyOutColumnIndex] = newQtyOut;
    rowData[qtyBalColumnIndex] = newQtyBal;

    if (givenToColumnIndex !== -1) {
      rowData[givenToColumnIndex] = transactionData.givenTo ? transactionData.givenTo.toString().trim() : '';
    }
    
    if (outDateColumnIndex !== -1) {
      rowData[outDateColumnIndex] = transactionData.outDate ? transactionData.outDate.toString().trim() : '';
    }

    // Write the updated row back to the sheet
    sheet.getRange(existingRowIndex, 1, 1, headers.length).setValues([rowData]);
    SpreadsheetApp.flush(); 
    
    message += ` Given to: ${transactionData.givenTo || 'N/A'}. New balance: ${newQtyBal}.`;
    
    return { status: 'success', message: message };
    
  } catch (updateError) {
    return { status: 'error', message: 'Failed to update spreadsheet: ' + updateError.message };
  }
}

// Alternative version with enhanced debugging
function processOutTransactionDebug(sheet, transactionData) {
  if (!transactionData || !transactionData.toolNo || transactionData.toolNo.trim() === '') {
    return { status: 'error', message: 'Tool number is required for out transaction.' };
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const toolNoColumnIndex = headers.indexOf('Tool No.');
  const qtyInColumnIndex = headers.indexOf('Qty In');
  const qtyOutColumnIndex = headers.indexOf('Qty Out');
  const qtyBalColumnIndex = headers.indexOf('Qty Bal');
  const givenToColumnIndex = headers.indexOf('Given To');
  const outDateColumnIndex = headers.indexOf('Out-Date');

  if (toolNoColumnIndex === -1) {
    return { status: 'error', message: 'Spreadsheet missing "Tool No." header.' };
  }

  const lastRow = sheet.getLastRow();
  let existingRowIndex = -1;
  
  // Enhanced debugging version
  if (lastRow > 1) {
    const allData = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const searchToolNo = transactionData.toolNo.trim();
    
    console.log(`Searching for tool: "${searchToolNo}"`);
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const cellValue = row[toolNoColumnIndex];
      const toolNoInSheet = cellValue ? cellValue.toString().trim() : '';
      
      console.log(`Row ${i + 2}: Tool No = "${toolNoInSheet}"`);
      
      if (toolNoInSheet === searchToolNo) {
        existingRowIndex = i + 2;
        console.log(`Found match at row ${existingRowIndex}`);
        break;
      }
    }
  }

  if (existingRowIndex === -1) {
    // Get all tool numbers for debugging
    const allToolNos = [];
    if (lastRow > 1) {
      const toolNoRange = sheet.getRange(2, toolNoColumnIndex + 1, lastRow - 1, 1);
      const allToolNosValues = toolNoRange.getValues();
      allToolNosValues.forEach(row => {
        if (row[0]) allToolNos.push(row[0].toString().trim());
      });
    }
    
    return { 
      status: 'error', 
      message: `Tool "${transactionData.toolNo}" not found in inventory. Available tools: ${allToolNos.join(', ')}` 
    };
  }

  const rowData = sheet.getRange(existingRowIndex, 1, 1, headers.length).getValues()[0];
  
  const currentQtyIn = parseNumberValue(rowData[qtyInColumnIndex]);
  const currentQtyOut = parseNumberValue(rowData[qtyOutColumnIndex]);
  const currentQtyBal = parseNumberValue(rowData[qtyBalColumnIndex]);
  
  let qtyToReduce = 0;
  let message = '';

  if (transactionData.isCompleteRemoval) {
    qtyToReduce = currentQtyBal;
    message = `Tool "${transactionData.toolNo}" removed completely.`;
  } else {
    qtyToReduce = parseNumberValue(transactionData.qtyOut);
    if (qtyToReduce <= 0) {
      return { status: 'error', message: 'Valid quantity out (greater than 0) is required for partial removal.' };
    }
    
    if (qtyToReduce > currentQtyBal) {
      return { 
        status: 'error', 
        message: `Cannot take out ${qtyToReduce} of "${transactionData.toolNo}". Only ${currentQtyBal} available in balance.` 
      };
    }
    message = `Tool "${transactionData.toolNo}" - took out ${qtyToReduce}.`;
  }
  
  const newQtyOut = currentQtyOut + qtyToReduce;
  const newQtyBal = calculateQtyBalance(currentQtyIn, newQtyOut);
  
  try {
    // Update the row data
    rowData[qtyOutColumnIndex] = newQtyOut;
    rowData[qtyBalColumnIndex] = newQtyBal;

    if (givenToColumnIndex !== -1) {
      rowData[givenToColumnIndex] = transactionData.givenTo ? transactionData.givenTo.toString().trim() : '';
    }
    
    if (outDateColumnIndex !== -1) {
      rowData[outDateColumnIndex] = transactionData.outDate ? transactionData.outDate.toString().trim() : '';
    }

    // Write the updated row back to the sheet
    sheet.getRange(existingRowIndex, 1, 1, headers.length).setValues([rowData]);
    SpreadsheetApp.flush(); 
    
    message += ` Given to: ${transactionData.givenTo || 'N/A'}. New balance: ${newQtyBal}.`;
    
    return { status: 'success', message: message };
    
  } catch (updateError) {
    return { status: 'error', message: 'Failed to update spreadsheet: ' + updateError.message };
  }
}
