import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Equipment } from '../domain/types';
import { HISTORY_LIMIT } from '../data/localDb';
import { useHistoryViewModel } from '../viewmodel/useHistoryViewModel';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Formato local dd/mm/aaaa hh:mm:ss sin depender de Intl
function formatStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

type Props = {
  equipment: Equipment | null;   // null = cerrado
  onClose: () => void;
};

export function HistoryDialog({ equipment, onClose }: Props) {
  const state = useHistoryViewModel(equipment?.id ?? null);

  return (
    <Modal visible={equipment !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.overline}>HISTORIAL · ÚLTIMOS {HISTORY_LIMIT}</Text>
          <Text style={styles.title}>{equipment?.id} · {equipment?.name}</Text>

          <View style={styles.headerRow}>
            <Text style={[styles.colLabel, styles.colDate]}>FECHA / HORA</Text>
            <Text style={[styles.colLabel, styles.colTemp]}>TEMP.</Text>
            <Text style={[styles.colLabel, styles.colSource]}>ORIGEN</Text>
          </View>

          <ScrollView style={styles.list}>
            {state.status === 'loading' && <ActivityIndicator color="#2365C7" style={{ margin: 20 }} />}

            {state.status === 'error' && <Text style={styles.error}>{state.message}</Text>}

            {state.status === 'ready' && state.readings.length === 0 && (
              <Text style={styles.empty}>
                Todavía no hay lecturas registradas para este equipo.{'\n'}
                Usá “Simular ciclo” o “Sincronizar API” para generarlas.
              </Text>
            )}

            {state.status === 'ready' && state.readings.map((r) => (
              <View key={r.id} style={styles.row}>
                <Text style={[styles.cell, styles.colDate]}>{formatStamp(r.createdAt)}</Text>
                <Text style={[styles.cell, styles.colTemp, styles.temp]}>{r.temperature.toFixed(1)} °C</Text>
                <Text style={[styles.cell, styles.colSource]}>{r.source}</Text>
              </View>
            ))}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,35,62,0.45)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, gap: 10, maxHeight: '85%' },
  overline: { fontSize: 9, fontWeight: '800', color: '#2365C7', letterSpacing: 1.2 },
  title: { fontSize: 17, fontWeight: '800', color: '#14233E' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#DFE7F2', paddingBottom: 6 },
  colLabel: { fontSize: 9, fontWeight: '800', color: '#687990', letterSpacing: 0.7 },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#F0F4FA' },
  cell: { fontSize: 12, color: '#14233E' },
  colDate: { flex: 1.6 },
  colTemp: { flex: 0.9, textAlign: 'right', paddingRight: 10 },
  colSource: { flex: 1.1 },
  temp: { fontWeight: '800' },
  empty: { textAlign: 'center', color: '#687990', fontSize: 12, lineHeight: 18, marginVertical: 20 },
  error: { color: '#C45639', fontSize: 12, fontWeight: '600', marginVertical: 12 },
  close: { height: 44, borderRadius: 11, backgroundColor: '#2365C7', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  closeText: { color: '#FFF', fontWeight: '800' },
});