# Order Desk Admin

This project is a small Google Apps Script + web dashboard for managing customer orders saved in a Google Sheet.

It is designed for a simple flow:

- A customer order is sent to the Apps Script web app.
- The order is stored in a sheet called `LandingPage`.
- An administrator opens the dashboard, connects to the deployed Apps Script URL, and updates order status.

## Project files

- `Code.gs` — backend logic for the Apps Script web app
- `index.html` — admin dashboard interface for viewing and updating orders

## How the project works

### 1) Backend (`Code.gs`)

The Apps Script file provides two main functions:

- `doGet()`
  - Reads all rows from the `LandingPage` sheet
  - Returns the data as a JSON array
  - Used by the admin dashboard to load orders

- `doPost(e)`
  - Accepts JSON data in the request body
  - If the payload contains `name` and `phone`, it creates a new order row with status `Pending`
  - If the payload contains `row` and `status`, it updates an existing row in the sheet

The current app expects these values:

- Column A: Date
- Column B: Name
- Column C: Phone
- Column D: Status

If your sheet also includes an address column, it can be stored alongside the other order details, for example:

- Column A: Date
- Column B: Name
- Column C: Phone
- Column D: Address (optional)
- Column E: Status

The app as shipped only reads the name, phone, and status fields for the order flow. If address data exists, it can be added to the sheet and displayed/processed by extending the dashboard logic.

Valid status values are:

- `Pending`
- `Confirmed`
- `Cancelled`

### 2) Frontend (`index.html`)

The dashboard is a browser-based admin panel that:

- accepts a deployed Google Apps Script web app URL
- loads all orders from the sheet
- shows totals for pending, confirmed, and attention-needed orders
- searches and filters orders
- confirms or cancels an order with one click

## How to set up the project

1. Open Google Sheets and create a sheet named `LandingPage`.
2. Add a header row if needed, such as:
   - Date
   - Name
   - Phone
   - Status
3. Open Google Apps Script and paste the contents of `Code.gs` into the script editor.
4. Create a new HTML file in Apps Script and paste the contents of `index.html`.
5. Deploy the script as a Web App:
   - In Apps Script, click Deploy > New deployment
   - Choose Web app
   - Set "Execute as" to your Google account
   - Set "Who has access" to "Anyone"
   - Deploy and copy the generated URL
6. Open the dashboard in a browser and paste the Apps Script URL into the connection field.
7. Click Connect.

## How another person can use it

To hand this project to another teammate or user:

1. Share the Google Sheet used by the project.
2. Share the Apps Script project or at least the deployed web app URL.
3. Make sure the sheet is named exactly `LandingPage`.
4. Tell them to open the dashboard and paste the URL into the connection field.
5. Explain that the system shows orders and allows them to update each order to `Confirmed` or `Cancelled`.

## Typical workflow

1. A new order is submitted through the Apps Script endpoint.
2. The order is saved to the `LandingPage` sheet with status `Pending`.
3. The admin opens the dashboard.
4. The dashboard loads the order list.
5. The admin confirms or cancels each order.
6. The change is written back to the Google Sheet.

## Important notes

- The deployed web app must use HTTPS.
- The Apps Script project must be deployed before the dashboard can connect to it.
- If the `LandingPage` sheet does not exist, the script will return an error.
- The admin interface depends on the deployed Apps Script URL being valid and accessible.

## Example request payloads

Create a new order:

```json
{
  "name": "John Smith",
  "phone": "+1234567890"
}
```

Update order status:

```json
{
  "row": 2,
  "status": "Confirmed"
}
```

## Summary

This project is a lightweight order management system built with Google Apps Script and a browser dashboard. It is useful for small businesses or internal teams that want to collect order requests in Google Sheets and manage them from a simple admin interface.
