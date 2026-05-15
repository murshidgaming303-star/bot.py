/**
 * WireGuard VPN Service
 *
 * Wraps react-native-wireguard to manage VPN tunnel.
 * Replace DEMO_PRIVATE_KEY with a real key generated per-user
 * from your backend (POST /api/config?server_id=X).
 */

import { NativeModules, Platform } from 'react-native';

// Tunnel name shown in Android VPN notification
const TUNNEL_NAME = 'TurboVPN';

let WireGuard;
try {
  WireGuard = require('react-native-wireguard').default;
} catch {
  // Module not linked yet — use mock so UI still works in dev
  WireGuard = null;
}

// Build a WireGuard .conf string from server + per-user keys
export const buildConfig = (server, privateKey, clientIp = '10.8.0.2/32') => `
[Interface]
PrivateKey = ${privateKey}
Address = ${clientIp}
DNS = ${server.dns}

[Peer]
PublicKey = ${server.publicKey}
Endpoint = ${server.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`.trim();

// Request a per-user config from your backend
// Returns { privateKey, clientIp }
const fetchUserConfig = async server => {
  // TODO: replace with real API call
  // const res = await axios.post(`${BASE_URL}/config`, { server_id: server.id, token: userToken });
  // return res.data;

  // Demo fallback — NOT a real WireGuard key
  return {
    privateKey: 'DEMO_PRIVATE_KEY_REPLACE_WITH_REAL_ONE=',
    clientIp: '10.8.0.2/32',
  };
};

export const VPNState = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING:   'CONNECTING',
  CONNECTED:    'CONNECTED',
  DISCONNECTING:'DISCONNECTING',
  ERROR:        'ERROR',
};

class WireGuardService {
  async connect(server) {
    if (!WireGuard) {
      // Dev mock: simulate connection after 2 s
      await new Promise(r => setTimeout(r, 2000));
      return { success: true, mock: true };
    }

    const { privateKey, clientIp } = await fetchUserConfig(server);
    const config = buildConfig(server, privateKey, clientIp);

    try {
      await WireGuard.addTunnel(config, TUNNEL_NAME);
      await WireGuard.startTunnel(TUNNEL_NAME);
      return { success: true };
    } catch (err) {
      throw new Error(`VPN connect failed: ${err.message}`);
    }
  }

  async disconnect() {
    if (!WireGuard) {
      await new Promise(r => setTimeout(r, 1000));
      return;
    }
    try {
      await WireGuard.stopTunnel(TUNNEL_NAME);
    } catch (err) {
      throw new Error(`VPN disconnect failed: ${err.message}`);
    }
  }

  async getState() {
    if (!WireGuard) return VPNState.DISCONNECTED;
    try {
      const state = await WireGuard.state(TUNNEL_NAME);
      return state ?? VPNState.DISCONNECTED;
    } catch {
      return VPNState.DISCONNECTED;
    }
  }
}

export default new WireGuardService();
