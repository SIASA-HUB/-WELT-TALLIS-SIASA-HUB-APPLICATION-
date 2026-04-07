//media service
const API_BASE_URL = "http://localhost:8007";
cloudflared tunnel --url http://localhost:8007

//rally service
cloudflared tunnel --url http://localhost:8004

//leadersservice
cloudflared tunnel --url http://localhost:8006
