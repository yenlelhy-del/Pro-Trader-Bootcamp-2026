---
name: pro-trader-bootcamp-theming-and-leads-sync
description: >-
  Rules and guidelines for maintaining the multi-brand layout configuration (Lion Invest vs. Tiger Invest) and Google Sheets webhook sync for the Pro Trader Bootcamp website.
---

# Pro Trader Bootcamp: Multi-Brand & Google Sheets Webhook Sync

## Overview
This local workspace skill documents the architecture for managing two separate brand themes (**Lion Finpeace** and **Tiger Invest**) in a single codebase, and how they synchronize registration leads to separate Google Sheets.

---

## 1. Multi-Brand Configuration System

### Core Structure
The active brand config is resolved dynamically at runtime based on the hostname or a URL query parameter (`?brand=lion` or `?brand=tiger`) inside [brandConfig.ts](file:///Users/yenle/Downloads/pro-trader-bootcamp%20ver02%2007062026/src/brandConfig.ts):

* **Tiger Invest**: Activated for hostnames containing `tigerinvest` or `tiger`.
* **Lion Finpeace**: Default fallback, activated for hostnames containing `lion.finpeace.cloud` or `lion`.

### Dynamic Brand Variables
All components must reference properties from the dynamic `brand` config object (passed as props) instead of using hardcoded values:
* `brand.name` & `brand.subName` (Header title and meta documents).
* `brand.hotline` (Phone support links).
* `brand.discordLink` (Community links).
* `brand.webhookUrl` (The Google Sheets Apps Script API endpoint).

---

## 2. Dynamic Theming System

### Tailoring Colors (index.css)
CSS brand tokens are defined globally in [index.css](file:///Users/yenle/Downloads/pro-trader-bootcamp%20ver02%2007062026/src/index.css):
* **Default colors** (Mint Green / Dark Grey) are applied directly to `:root` (active for Tiger Invest).
* **Lion overrides** (Yellow / Gold) are wrapped inside the `.theme-lion` class.
* **Glow-effects**: To dynamically shift shadow/glow colors (e.g. green glow vs. yellow glow), components must use `rgba(var(--brand-glow), ...)` where `--brand-glow` is set to `0, 225, 161` for Tiger, and `255, 208, 44` for Lion.

---

## 3. Dynamic Broker Routing

### Mappings
Each brand has its own specific partner securities firm and brokers displayed on the registration page:

1. **Tiger Invest**: 
   * Partner: **KIS Vietnam (CTCK KIS VIỆT NAM)**.
   * Broker: **Đặng Minh Đức** (ID: `BK07206`, Hotline: `0398 992 555`).
   * eKYC Link: Directly opens the KIS registration web app with prefilled broker ID.
2. **Lion Finpeace**: 
   * Partner: **KB Securities (KBSV)**.
   * Brokers: **Trịnh Thị Anh Thư** (`0011000306`), **Lê Vũ Tú Trinh** (`0011000776`), and **Nguyễn Minh Quang** (`0011000297`).
   * eKYC Link: Renders a carousel with QR codes to scan inside the KB Buddy app.

---

## 4. Google Sheets Leads Sync (Webhook Web App)

Leads are submitted directly to the hardcoded `brand.webhookUrl` endpoint. The online CRM panel has been deleted to maximize privacy and simplicity.

### Google Apps Script Webhook Template
For any new brand sheets, paste and deploy this script inside Extensions -> Apps Script:

```javascript
function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append rows (Name, Phone, Broker Name, Broker Code, Timestamp, Campaign)
    sheet.appendRow([
      json.name || "",
      "" + (json.phone || ""), 
      json.brokerName || "",
      json.brokerId || "Khác",
      json.timestamp || new Date().toLocaleString("vi-VN"),
      json.campaign || "tiger"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Common Mistakes to Avoid
1. **Hardcoding Colors**: Do NOT write `#00e1a1` (mint) or `#ffd02c` (yellow) directly in components. Always use `--color-brand-mint` or dynamic Tailwind utilities.
2. **Local Storage Webhooks**: Do NOT read webhook URLs from local storage. Always retrieve them directly from `brand.webhookUrl` inside `brandConfig.ts`.
3. **Modifying Hostname Logic**: Avoid changing the `getActiveBrand` check in `brandConfig.ts` without ensuring query parameter testing (`?brand=...`) remains intact.
