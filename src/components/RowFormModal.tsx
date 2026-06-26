import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export type FieldDef = { key: string; label: string; keyboardType?: 'default' | 'numeric' };

export default function RowFormModal({
  visible,
  title,
  fields,
  initialValues,
  onCancel,
  onSave,
  onDelete,
}: {
  visible: boolean;
  title: string;
  fields: FieldDef[];
  initialValues: Record<string, string>;
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
  onDelete?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {fields.map((f) => (
            <View key={f.key} style={{ marginBottom: 10 }}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={values[f.key] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                keyboardType={f.keyboardType === 'numeric' ? 'numeric' : 'default'}
              />
            </View>
          ))}
          <View style={styles.actionsRow}>
            {onDelete ? (
              <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={onDelete}>
                <Text style={styles.deleteText}>Supprimer</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.btn} onPress={onCancel}>
                <Text style={styles.btnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={() => onSave(values)}>
                <Text style={styles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.card, borderRadius: 14, padding: 18 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 14, fontFamily: fonts.bold },
  label: { fontSize: 11, color: colors.textSecondary, marginBottom: 4, fontFamily: fonts.regular },
  input: { borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, fontFamily: fonts.regular },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  btn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.cardBorder },
  btnText: { fontSize: 12, fontWeight: '600' },
  saveBtn: { backgroundColor: colors.headerTo, borderColor: colors.headerTo },
  saveText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  deleteBtn: { borderColor: colors.redBorder, backgroundColor: colors.redBg },
  deleteText: { fontSize: 12, fontWeight: '600', color: colors.redText },
});
