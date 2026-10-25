# Docker deployment

1. Configure the Perenual key in either the workspace-root `.env` as `PERENUAL_API_KEY=...`, or copy `home-monitor-api/credentials.example.json` to `home-monitor-api/credentials.json` and set `perenualAPIKey`. The credentials JSON is ignored by Git and mounted read-only into the API container. Perenual is only used for background care-data enrichment; plant search and adding plants from Wikipedia work without the key, but enrichment will remain queued until it is configured.
2. From the workspace root, run `docker compose up --build -d`.
3. Open `http://<server-lan-ip>:8080`. The UI's Nginx container forwards `/api` requests to the `home-monitor-api` service. MongoDB is reachable only on the private Compose network and persists in the `mongo_data` volume.
4. Check service state with `docker compose ps` and logs with `docker compose logs home-monitor-api home-monitor-ui`.

The API waits for MongoDB's TCP port before starting, then retries its database connection until MongoDB is ready. MongoDB does not need a Compose healthcheck.

Plant search uses the English Wikipedia Action API and, when an article image is available, the Wikimedia Commons API to obtain its license and attribution metadata. Requests to Wikimedia are queued and sent one at a time; an image is only displayed when its Commons license metadata is available. Set `WIKIPEDIA_CONTACT_EMAIL` in `.env` to include an operator contact in the API User-Agent.

The API runs at most one Perenual enrichment task per hour, limiting the worker to about 50 requests per day even when each task uses both a search and detail request. This leaves headroom under Perenual's free daily quota for occasional retries and other API usage. A confident fuzzy match is enriched automatically; uncertain or missing matches appear under **My Plants** for the user to choose a suggested species or correct the search term. A corrected choice is re-queued for the next hourly job. This project currently uses a shared demo user ID and does not yet have real login/session authentication.

Set `MONGODB_URI` to an authenticated MongoDB URI, for example `mongodb://admin:adminpassword@mongo:27017/home-monitor?authSource=admin`. Its username and password must match the credentials used when the persistent data volume was initialized. Percent-encode URI-reserved characters in the username or password.

The UI port is published on the host's interfaces, so it is available to devices on the LAN unless the host firewall restricts it. Do not configure router port forwarding for this setup: the app currently uses a shared demo user and has no authentication. The API key is read only by the API container and is not part of the UI build. Rotate the old key if it has ever been included in a browser build or otherwise exposed.