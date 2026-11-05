import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Equipment } from '../domain/types';
import { MAX_LIMIT } from '../domain/alarm';
import type { ThresholdResult } from '../viewmodel/usePlantViewModel';

type Props = {
  equipment: Equipment | null;                       // null = cerrado
  onCancel: () => void;
  onSave: (id: string, raw: string) => Promise<ThresholdResult>;
};

export function ThresholdDialog({ equipment, onCancel, onSave }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Cada vez que se abre para un equipo, precarga su límite actual y limpia errores
  useEffect(() => {
    if (equipment) {
      setValue(String(equipment.maxTemp));
      setError(null);
    }
  }, [equipment]);

  const handleSave = async () => {
    if (!equipment || saving) return;
    setSaving(true);
    const result = await onSave(equipment.id, value);
    setSaving(false);
    if (result.ok) onCancel();          // éxito → cerrar
    else setError(result.error);        // inválido → informar, no cerrar
  };

  return (
    <Modal visible={equipment !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.overline}>UMBRAL DE ALARMA</Text>
          <Text style={styles.title}>{equipment?.id} · {equipment?.name}</Text>
          <Text style={styles.hint}>Temperatura actual: {equipment?.temperature.toFixed(1)} °C</Text>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={value}
            onChangeText={(text) => { setValue(text); setError(null); }}
            keyboardType="decimal-pad"
            placeholder={`Entre 0 y ${MAX_LIMIT}`}
            autoFocus
            selectTextOnFocus
          />
          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.cancel} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={() => void handleSave()} style={styles.save} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveText}>Guardar</Text>}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,35,62,0.45)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, gap: 10 },
  overline: { fontSize: 9, fontWeight: '800', color: '#2365C7', letterSpacing: 1.2 },
  title: { fontSize: 17, fontWeight: '800', color: '#14233E' },
  hint: { fontSize: 12, color: '#687990' },
  input: { borderWidth: 1, borderColor: '#CCD9E9', borderRadius: 11, height: 46, paddingHorizontal: 14, fontSize: 16, color: '#14233E' },
  inputError: { borderColor: '#C45639' },
  error: { color: '#C45639', fontSize: 12, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 9, marginTop: 6 },
  cancel: { flex: 1, height: 44, borderRadius: 11, backgroundColor: '#EAF1FB', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#162D50', fontWeight: '800' },
  save: { flex: 1, height: 44, borderRadius: 11, backgroundColor: '#2365C7', alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFF', fontWeight: '800' },
});