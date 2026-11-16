# Dashboard Performance Architecture Rule

## Core Principle
The dashboard must be built with performance, scalability, and minimal data loading as core requirements.
Every section of the dashboard — including Orders, Bookings, Customers, Products, Classified Ads, Content, and other data-heavy sections — must strictly follow these performance principles.

---

### 1. Never Load Unnecessary Data
* Do not fetch or render the entire dataset when the user only needs a small portion of it.
* The dashboard must initially load only the most relevant, recent, and actionable records.
* Avoid heavy wildcard queries (`SELECT *`) on large tables without strict limits.

### 2. Separate Active Data from Historical Data
* Completed, shipped, cancelled, expired, or old records must be separated into an **Archive** instead of cluttering the main operational dashboard.
* The main dashboard view remains dedicated exclusively to current, active, and actionable data.
* Historical audit trails and old records live in the dedicated Archive.

### 3. Use Pagination & Range / Cursor-Based Loading
* Large datasets must never be transferred or rendered all at once.
* **Standard Page Size:** Initial load = **10 records**.
* Load additional batches of 10 records progressively on user demand (Load More button or intersection scroll).
* Pagination must execute at the **database/API level** (e.g. Supabase `.range(from, to)` or cursor ID pagination), never by downloading thousands of rows and slicing them in JavaScript memory.

### 4. Lazy-Loaded Archive
* The Archive must not fetch any data on initial dashboard load.
* When the user opens the Archive view, it fetches only the first **10 records**.
* Older historical records are fetched progressively as the user scrolls or requests more.

### 5. Universal Enforcement Across All Sections
* This architecture is not limited to a single entity (such as Orders or Ads); it applies universally:
  - **Classified Ads & Listings**: Active live ads vs. Archived / expired listings.
  - **Orders & Transactions**: Pending / active transactions vs. Historical archive.
  - **Bookings & Reservations**: Upcoming / current bookings vs. Past completed bookings.
  - **Customers & Users**: Active users vs. Inactive / deleted accounts.
  - **Logs & Audit Trails**: Recent events vs. Cold storage.
* **Goal:** Keep the dashboard instantaneous, lightweight, responsive (<100ms UI transitions), and horizontally scalable even when the database holds millions of records. Performance must remain independent of total historical data volume.
