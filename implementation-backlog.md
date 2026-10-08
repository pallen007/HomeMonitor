# Home Monitor implementation backlog

## Goal
Build a usable home plant monitoring product from the current prototype, focusing on real user value before deeper auth/security work.

## Phase 1: Plant management workflow (current priority)

### 1.1 Core collection management
- [x] Add a user-scoped plant collection endpoint with create, read, update, delete support
- [x] Support storing plant details, nickname, room/location, and watering schedule
- [x] Allow users to add a plant discovered through lookup into their collection
- [x] Allow plant removal from the collection
- [x] Expose collection state in the UI and keep it synced via event system

### 1.2 Watering and care workflow
- [x] Record last watered and next watering date on each plant
- [x] Provide a "mark watered" action from the plant card or detail view
- [x] Trigger care-state flags based on moisture and due dates in summary endpoint
- [x] Surface a simple "needs attention" badge and live totals in summary dashboard

### 1.3 Plant lookup and selection flow
- [x] Add a clear path from plant search results into "add to my plants"
- [ ] Let the user edit nickname and room assignment before saving
- [x] Store a local plant profile that combines external botanical data with user-specific data

## Phase 2: Monitoring and alerts
- [ ] Add sensor health and stale reading detection
- [ ] Expand the sensor model to include humidity, light, and battery status
- [ ] Compute plant health state from moisture, temperature, and watering-due date
- [ ] Add alerting for dry soil, temperature risk, and sensor failure
- [ ] Show a summary dashboard based on live data instead of static placeholders

## Phase 3: History and insight
- [ ] Add historical sensor readings with timestamps and trend queries
- [ ] Create charts for moisture, temperature, and watering history
- [ ] Highlight daily/weekly patterns and anomaly events
- [ ] Let users review care actions over time

## Phase 4: Production-quality platform work
- [ ] Move config to environment variables
- [ ] Add validation, error handling, and health checks
- [ ] Add proper database setup (currently using MongoDB; setup documented)
- [ ] Support deployment to a real backend and DB
- [ ] Add test coverage for API and UI flows
- [ ] Add auth/session model once the feature set is stable

## Completed Infrastructure Work

### Build tooling migration
- [x] Migrated UI build from create-react-app/react-scripts to Vite
- [x] Migrated UI tests from Jest to Vitest
- [x] Added Vitest to API for consistent test runner across projects
- [x] Added TypeScript configuration for UI (React 19, JSX support)
- [x] Updated npm scripts: `start` (Vite dev), `build` (Vite), `test` (Vitest)

### Demo user and session setup
- [x] Implemented DEMO_USER_ID constant in UI service layer
- [x] API routes use userId parameter for scoping (ready for real auth)
- [x] All collection operations are user-scoped in the database
- [x] Collection update event system for real-time UI sync

### API and UI integration
- [x] Plant CRUD endpoints with user-scoped queries
- [x] Summary endpoint returns live stats (total, healthy, needs attention)
- [x] Sensor data model with plantId and userId tracking
- [x] Plant lookup from external Perenual API
- [x] Mark watered flow with update to wateringSchedule
- [x] Collection refresh event ('plant-collection-updated') dispatched on mutations

### UI components and flows
- [x] PlantLookup: search external API, add to collection
- [x] PlantContainer: display user collection, remove plants, mark watered
- [x] Summary: live dashboard with total/healthy/attention stats
- [x] Plant card: unified display for lookup results and owned plants

## Test coverage
- [x] API endpoint tests: 7 tests passing (plant CRUD, sensor, summary)
- [x] UI Vitest setup with jsdom environment
- [x] Plant collection update event test
- [x] Vite production build verified

## Recommended first implementation steps
1. ~~Fix the plant API so it is user-scoped and supports create/update/delete.~~ ✓ DONE
2. ~~Add a demo user flow in the UI so plant management can be tested without auth.~~ ✓ DONE
3. ~~Add "Add to my plants" and "Mark watered" interactions.~~ ✓ DONE
4. ~~Rebuild the summary/dashboard to read live collection stats.~~ ✓ DONE
5. Next: Expand to real sensor hardware integration, alerts, and multi-user auth.

## Notes
Phase 1 is now complete. The app has a fully functional plant collection system with live dashboard stats and real-time sync. The demo user flow allows testing without auth infrastructure.

Next priorities: sensor hardware integration, alerting logic, and real authentication/multi-user support.
