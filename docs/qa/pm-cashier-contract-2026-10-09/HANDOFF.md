# Cashier backend contract handoff (2026-10-09)

This is source inspection only. No server/API request, database, mutation, runtime, or Git action was performed. Backend repository: `C:/Users/Wahyu/Downloads/rapido-backend-dev/rapido-backend-dev`; no root `AGENTS.md` was found. The Laravel root route file loads `routes/api/stores.php` and `routes/api/domains/orders.php` (`routes/api/root.php:7-17`), so Laravel's API route prefix applies.

The usable-looking first slice is read-only `GET /api/stores/cart` with bearer auth and store scope. Owner requests need `store_id`; staff resolves assigned store. The route also requires an open store/shift. The response source exposes nested groups/details/orderable/extras plus server pricing including tax and rounding (`routes/api/stores.php:10-39`, `CartController.php:18-36`, `CartResource.php:12-22`). This was not smoke-tested.

Checkout is not ready for frontend success handling. `POST /api/stores/transactions` exists, but `TransactionRequest` declares no rules; migration/model/service disagree on shift foreign key and `payment_status`. The separate payment route lacks store middleware, has placeholder request rules, and calls a nonexistent `TransactionService::createPayment`. Its payment schema and model/service also disagree (`payment_amount` vs `amount`). Do not connect either mutation or show success until backend owner resolves these and provides an explicit payload/response contract.

Prices/tax are not a fixed 10% client rule: cart pricing uses configured order-type taxes and optional store rounding. Amount columns mix DECIMAL(…,2) catalog values with DOUBLE transaction/payment values; API precision/rounding behavior needs an explicit decision. No expense route appears in `routes/api`.

Exact paths/lines and the endpoint inventory are in `contract.json`.
