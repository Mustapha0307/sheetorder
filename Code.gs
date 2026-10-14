function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LandingPage");
  if (!sheet) {
    throw new Error('Sheet "LandingPage" was not found.');
  }

  const rows = sheet.getDataRange().getValues();
  const orders = rows.slice(1).map((row, index) => {
    const hasAddressColumn = row.length > 4;
    return {
      date: row[0],
      name: row[1],
      phone: row[2],
      address: hasAddressColumn ? String(row[3] || "") : "",
      status: hasAddressColumn ? (row[4] || "Pending") : (row[3] || "Pending"),
      _row: index + 2
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify(orders))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e && e.postData ? e.postData.contents : "");
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("The request body must be a JSON object.");
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LandingPage");
    if (!sheet) {
      throw new Error('Sheet "LandingPage" was not found.');
    }

    if (payload.row !== undefined) {
      const row = Number(payload.row);
      const status = payload.status;

      if (!Number.isInteger(row) || row < 2) {
        throw new Error("A valid order row is required.");
      }
      if (status !== "Confirmed" && status !== "Cancelled") {
        throw new Error('Status must be "Confirmed" or "Cancelled".');
      }
      if (row > sheet.getLastRow()) {
        throw new Error("The order row no longer exists. Refresh the orders and try again.");
      }

      const statusColumn = sheet.getLastColumn() >= 5 ? 5 : 4;
      sheet.getRange(row, statusColumn).setValue(status);
      return jsonResponse({
        ok: true,
        success: true,
        row: row,
        status: status,
        message: "Order status updated."
      });
    }

    if (!String(payload.name || "").trim() || !String(payload.phone || "").trim()) {
      throw new Error("Name and phone are required to create an order.");
    }

    const address = String(payload.address || "").trim();
    const hasAddressColumn = sheet.getLastColumn() >= 5;
    const rowValues = [
      new Date(),
      String(payload.name).trim(),
      String(payload.phone).trim()
    ];

    if (hasAddressColumn) {
      rowValues.push(address);
      rowValues.push("Pending");
    } else {
      rowValues.push("Pending");
    }

    sheet.appendRow(rowValues);
    return jsonResponse({
      ok: true,
      success: true,
      message: "Order has been sent."
    });
  } catch (error) {
    const message = error.message || String(error);
    return jsonResponse({
      ok: false,
      success: false,
      error: message,
      message: message
    });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
