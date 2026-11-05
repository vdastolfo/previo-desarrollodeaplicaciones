import { useEffect, useState } from 'react';
import type { Reading } from '../domain/types';
import { findReadings } from '../data/localDb';

type HistoryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; readings: Reading[] }
  | { status: 'error'; message: string };

export function useHistoryViewModel(equipmentId: string | null) {
  const [state, setState] = useState<HistoryState>({ status: 'idle' });

  useEffect(() => {
    if (!equipmentId) {
      setState({ status: 'idle' });
      return;
    }
    let alive = true;
    setState({ status: 'loading' });
    findReadings(equipmentId)
      .then((readings) => {
        if (alive) setState({ status: 'ready', readings });
      })
      .catch((error: unknown) => {
        if (alive) setState({ status: 'error', message: `No se pudo leer el historial: ${String(error)}` });
      });
    return () => {
      alive = false;
    };
  }, [equipmentId]);

  return state;
}