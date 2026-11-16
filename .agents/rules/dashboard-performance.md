# Dashboard Performance Architecture Rule

The dashboard must be built with performance, scalability, and minimal data loading as core requirements.
Every section of the dashboard — including Orders, Bookings, Customers, Products, Content, Classified Ads, and other data-heavy sections — must follow the same performance principles.

1. **Never load unnecessary data**: Do not fetch or render the entire dataset when the user only needs a small portion of it. The dashboard should initially load only the most relevant and recent records.
2. **Separate active data from historical data**: Completed, shipped, cancelled, or old Orders should be moved to an Archive instead of remaining in the main dashboard. The same principle should be applied to old or completed Bookings, expired Ads, and other historical records. The main dashboard should therefore remain focused on current and actionable data.
3. **Use pagination / cursor-based loading**: Large datasets must never be loaded all at once. Initial load → 10 records. Then load additional records only when the user requests them or scrolls further. Use cursor-based pagination or efficient pagination at the database/API level rather than fetching thousands of records and filtering them on the client.
4. **Archive should be lazy-loaded**: The Archive should initially display only the first 10 records. Older records should be fetched progressively as the user scrolls or requests more.
5. **Apply this rule everywhere**: This is not only an Orders rule. Every dashboard section must follow the same principle: Load only what the user needs, when the user needs it. Avoid unnecessary database queries, API requests, rendering, and data transfer.
