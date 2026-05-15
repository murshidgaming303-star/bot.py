import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import WireGuardService, { VPNState } from '../services/WireGuardService';
import { getLastServer, saveLastServer, getUserPlan } from '../services/ApiService';

const VPNContext = createContext(null);

export const VPNProvider = ({ children }) => {
  const [vpnState, setVpnState]         = useState(VPNState.DISCONNECTED);
  const [selectedServer, setSelectedServer] = useState(null);
  const [userPlan, setUserPlan]         = useState({ plan: 'free', expiry: null });
  const [connectedAt, setConnectedAt]   = useState(null);
  const [bytesIn, setBytesIn]           = useState(0);
  const [bytesOut, setBytesOut]         = useState(0);
  const [error, setError]               = useState(null);

  const statsTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const server = await getLastServer();
      const plan   = await getUserPlan();
      setSelectedServer(server);
      setUserPlan(plan);
    })();
  }, []);

  // Simulate traffic stats while connected
  useEffect(() => {
    if (vpnState === VPNState.CONNECTED) {
      setConnectedAt(Date.now());
      statsTimer.current = setInterval(() => {
        setBytesIn(prev  => prev + Math.floor(Math.random() * 150000 + 50000));
        setBytesOut(prev => prev + Math.floor(Math.random() * 40000  + 10000));
      }, 1000);
    } else {
      clearInterval(statsTimer.current);
      if (vpnState === VPNState.DISCONNECTED) {
        setConnectedAt(null);
        setBytesIn(0);
        setBytesOut(0);
      }
    }
    return () => clearInterval(statsTimer.current);
  }, [vpnState]);

  const connect = useCallback(async (server = selectedServer) => {
    if (!server) return;
    setError(null);
    setVpnState(VPNState.CONNECTING);
    try {
      await WireGuardService.connect(server);
      setVpnState(VPNState.CONNECTED);
      saveLastServer(server);
    } catch (err) {
      setError(err.message);
      setVpnState(VPNState.ERROR);
      setTimeout(() => setVpnState(VPNState.DISCONNECTED), 2000);
    }
  }, [selectedServer]);

  const disconnect = useCallback(async () => {
    setVpnState(VPNState.DISCONNECTING);
    try {
      await WireGuardService.disconnect();
    } finally {
      setVpnState(VPNState.DISCONNECTED);
    }
  }, []);

  const selectServer = useCallback(server => {
    if (vpnState === VPNState.CONNECTED || vpnState === VPNState.CONNECTING) {
      disconnect().then(() => {
        setSelectedServer(server);
        saveLastServer(server);
      });
    } else {
      setSelectedServer(server);
      saveLastServer(server);
    }
  }, [vpnState, disconnect]);

  const isConnected    = vpnState === VPNState.CONNECTED;
  const isConnecting   = vpnState === VPNState.CONNECTING || vpnState === VPNState.DISCONNECTING;
  const isPremium      = userPlan.plan === 'premium';

  return (
    <VPNContext.Provider value={{
      vpnState, selectedServer, userPlan, isPremium,
      connectedAt, bytesIn, bytesOut, error,
      isConnected, isConnecting,
      connect, disconnect, selectServer, setUserPlan,
    }}>
      {children}
    </VPNContext.Provider>
  );
};

export const useVPN = () => {
  const ctx = useContext(VPNContext);
  if (!ctx) throw new Error('useVPN must be inside VPNProvider');
  return ctx;
};
