function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LandingPage");
  if (!sheet) {
    throw new Error('Sheet "LandingPage" was not found.');
  }

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? value.trim() : value;
  };

  const rows = sheet.getDataRange().getValues();
  const orders = rows.slice(1)
    .filter((row) => row.some((cell) => cell !== "" && cell !== null && cell !== undefined))
    .map((row, index) => ({
      date: normalizeValue(row[0]),
      name: normalizeValue(row[1]),
      qnt: normalizeValue(row[2]),
      price: normalizeValue(row[3]),
      priceD: normalizeValue(row[4]),
      sum: normalizeValue(row[5]),
      phone: normalizeValue(row[6]),
      address: normalizeValue(row[7]),
      status: normalizeValue(row[8]),
      _row: index + 2
    }));

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

      // Status column in the sheet is the 9th column: [date, name, qnt, price, priceD, sum, phone, address, status]
      sheet.getRange(row, 9).setValue(status);
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

    sheet.appendRow([
      new Date(),
      String(payload.name).trim(),
      Number(payload.qnt).toFixed(2),
      Number(payload.price).toFixed(2),
      Number(payload.priceD).toFixed(2),
      Number(payload.sum).toFixed(2) +  Number(payload.priceD).toFixed(2),
      String(payload.phone).trim(),
      String(payload.address).trim(),
      "Pending"
    ]);
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
