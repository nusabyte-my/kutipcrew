import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

export interface WhatsAppConnection {
  connected: boolean;
  qr: string | null;
  error: string | null;
  loading: boolean;
}

export function useWhatsApp(autoStart = true): WhatsAppConnection & { refresh: () => void; logout: () => Promise<void> } {
  const [state, setState] = useState<WhatsAppConnection>({
    connected: false,
    qr: null,
    error: null,
    loading: false,
  });
  const mountedRef = useRef(true);

  const refresh = async () => {
    if (!mountedRef.current) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const status = await api.getWhatsAppStatus();
      if (!mountedRef.current) return;
      if (status.connected) {
        setState({ connected: true, qr: null, error: null, loading: false });
        return;
      }
      const qr = await api.getWhatsAppQR();
      if (!mountedRef.current) return;
      if ('qr' in qr && qr.qr) {
        setState({ connected: false, qr: qr.qr, error: null, loading: false });
      } else {
        setState((s) => ({ ...s, connected: false, qr: null, error: 'error' in qr ? qr.error : null, loading: false }));
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setState({ connected: false, qr: null, error: err.message, loading: false });
    }
  };

  const logout = async () => {
    try {
      await api.logoutWhatsApp();
      setState({ connected: false, qr: null, error: null, loading: false });
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    if (autoStart) {
      refresh();
    }
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { ...state, refresh, logout };
}

export function useWhatsAppPolling(active: boolean, intervalMs = 2500) {
  const state = useWhatsApp(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      await state.refresh();
      if (cancelled) return;
      if (!state.connected) {
        timer = setTimeout(tick, intervalMs);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, intervalMs]);

  return state;
}
