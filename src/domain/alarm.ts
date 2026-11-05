import type { Equipment } from './types';

export const MAX_LIMIT = 150;
export function isInAlarm(e: Pick<Equipment, 'enabled' | 'temperature' | 'maxTemp'>) {
  return e.enabled === 1 && e.temperature >= e.maxTemp;
}
export function parseThreshold(raw: string): { ok: true; value: number } | { ok: false; error: string } {
  const value = Number(raw.trim().replace(',', '.'));
  if (raw.trim() === '' || !Number.isFinite(value)) return { ok: false, error: 'Ingresá un número válido.' };
  if (value <= 0 || value > MAX_LIMIT) return { ok: false, error: 'El límite debe ser > 0 y ≤ 150 °C.' };
  return { ok: true, value };
}