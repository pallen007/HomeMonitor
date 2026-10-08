# Docker deployment

1. Configure the Perenual key in either the workspace-root `.env` as `PERENUAL_API_KEY=...`, or copy `home-monitor-api/credentials.example.json` to `home-monitor-api/credentials.json` and set `perenualAPIKey`. The credentials JSON is ignored by Git and mounted read-only into the API container.
2. From the workspace root, run `docker compose up --build -d`.
3. Open `http://<server-lan-ip>:8080`. The UI's Nginx container forwards `/api` requests to the `home-monitor-api` service. MongoDB is reachable only on the private Compose network and persists in the `mongo_data` volume.
4. Check service state with `docker compose ps` and logs with `docker compose logs home-monitor-api home-monitor-ui`.

The UI port is published on the host's interfaces, so it is available to devices on the LAN unless the host firewall restricts it. Do not configure router port forwarding for this setup: the app currently uses a shared demo user and has no authentication. The API key is read only by the API container and is not part of the UI build. Rotate the old key if it has ever been included in a browser build or otherwise exposed.