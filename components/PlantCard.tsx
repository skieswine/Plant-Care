// components/PlantCard.tsx
import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet, {
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Plant } from '../store/types';
import { useAppStore, getPlantDisplayName } from '../store/useAppStore';
import { useWatering } from '../hooks/useWatering';
import { WateringAnimation } from './WateringAnimation';
import { CountdownBadge } from './CountdownBadge';
import { LightLevelIcon } from './LightLevelIcon';
import { formatDate, formatRelativeDate } from '../utils/dateUtils';

type Tab = 'info' | 'history' | 'notes';

interface Props {
  plant: Plant | null;
  onClose: () => void;
}

export function PlantCard({ plant, onClose }: Props) {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '92%'], []);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [noteText, setNoteText] = useState('');
  const [showWateringAnim, setShowWateringAnim] = useState(false);

  const addNote = useAppStore((s) => s.addNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const deletePlant = useAppStore((s) => s.deletePlant);
  const { handleWater, handlePostpone } = useWatering();

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose]
  );

  const onWater = useCallback(async () => {
    if (!plant) return;
    setShowWateringAnim(true);
    await handleWater(plant.id);
  }, [plant, handleWater]);

  const onPostpone = useCallback(
    (days: number) => {
      if (!plant) return;
      const displayName = getPlantDisplayName(plant);
      Alert.alert(
        'Відкласти полив',
        `Відкласти полив ${displayName} на ${days} ${days === 1 ? 'день' : 'дні'}?`,
        [
          { text: 'Скасувати', style: 'cancel' },
          { text: 'Відкласти', onPress: () => handlePostpone(plant.id, days) },
        ]
      );
    },
    [plant, handlePostpone]
  );

  const onAddNote = useCallback(() => {
    if (!plant || !noteText.trim()) return;
    addNote(plant.id, noteText.trim());
    setNoteText('');
  }, [plant, noteText, addNote]);

  const onDelete = useCallback(() => {
    if (!plant) return;
    const displayName = getPlantDisplayName(plant);
    Alert.alert(
      'Видалити рослину',
      `Видалити "${displayName}"? Цю дію неможливо скасувати.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            deletePlant(plant.id);
            onClose();
          },
        },
      ]
    );
  }, [plant, deletePlant, onClose]);

  if (!plant) return null;

  return (
    <>
      {showWateringAnim && (
        <WateringAnimation
          visible={showWateringAnim}
          onComplete={() => setShowWateringAnim(false)}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {plant.photoUri ? (
              <Image source={{ uri: plant.photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={{ fontSize: 40 }}>🪴</Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.plantName}>{getPlantDisplayName(plant)}</Text>
              {plant.species && plant.name && (
                <Text style={styles.speciesLabel}>🌿 {plant.species}</Text>
              )}
              <LightLevelIcon level={plant.lightLevel} showLabel />
              <CountdownBadge nextWateringDate={plant.nextWateringDate} />
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => { onClose(); setTimeout(() => router.push(`/plant/${plant.id}`), 300); }}
                style={styles.editBtn}
              >
                <Ionicons name="create-outline" size={20} color="#4db88a" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Кнопки дій */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.waterBtn} onPress={onWater} activeOpacity={0.8}>
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={styles.waterBtnText}>Полити зараз 💧</Text>
            </TouchableOpacity>
            <View style={styles.postponeGroup}>
              <TouchableOpacity
                style={styles.postponeBtn}
                onPress={() => onPostpone(1)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={16} color="#a07850" />
                <Text style={styles.postponeBtnText}>+1 день</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postponeBtn}
                onPress={() => onPostpone(2)}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={16} color="#a07850" />
                <Text style={styles.postponeBtnText}>+2 дні</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Вкладки */}
          <View style={styles.tabs}>
            {(['info', 'history', 'notes'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'info' ? '🌿 Інфо' : tab === 'history' ? '📋 Журнал' : '📝 Нотатки'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Вкладка: Інфо */}
          {activeTab === 'info' && (
            <View style={styles.tabContent}>
              {plant.species && <InfoRow icon="leaf" label="Вид" value={plant.species} />}
              <InfoRow icon="calendar-outline" label="Інтервал поливу" value={`${plant.wateringIntervalDays} днів`} />
              <InfoRow icon="water-outline" label="Останній полив" value={formatDate(plant.lastWateredDate)} />
              <InfoRow icon="alarm-outline" label="Наступний полив" value={formatDate(plant.nextWateringDate)} />
              <InfoRow icon="leaf-outline" label="Додано" value={formatDate(plant.createdAt)} />
            </View>
          )}

          {/* Вкладка: Журнал */}
          {activeTab === 'history' && (
            <View style={styles.tabContent}>
              {plant.wateringHistory.length === 0 ? (
                <Text style={styles.emptyText}>Ще не поливали 🌵</Text>
              ) : (
                plant.wateringHistory.map((record) => (
                  <View key={record.id} style={styles.historyItem}>
                    <Ionicons
                      name={record.postponed ? 'time-outline' : 'water'}
                      size={18}
                      color={record.postponed ? '#f59e0b' : '#4db88a'}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.historyLabel}>
                        {record.postponed
                          ? `Відкладено на ${record.postponedDays} дн.`
                          : 'Полив 💧'}
                      </Text>
                      <Text style={styles.historyDate}>{formatRelativeDate(record.date)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Вкладка: Нотатки */}
          {activeTab === 'notes' && (
            <View style={styles.tabContent}>
              <View style={styles.noteInputRow}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Додати нотатку..."
                  placeholderTextColor="#a8b8a8"
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.noteAddBtn, !noteText.trim() && styles.noteAddBtnDisabled]}
                  onPress={onAddNote}
                  disabled={!noteText.trim()}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {plant.notes.length === 0 ? (
                <Text style={styles.emptyText}>Нотаток ще немає 📝</Text>
              ) : (
                plant.notes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noteText}>{note.text}</Text>
                      <Text style={styles.noteDate}>{formatRelativeDate(note.date)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteNote(plant.id, note.id)}>
                      <Ionicons name="close-circle-outline" size={20} color="#d1c4c4" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#7dd1aa" style={{ width: 26 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#faf8f3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#c4a882',
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#aee5c8',
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#d6f2e3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#aee5c8',
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  speciesLabel: {
    fontSize: 12,
    color: '#7dd1aa',
    fontWeight: '500',
  },
  plantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d4a30',
  },
  deleteBtn: {
    padding: 8,
  },
  editBtn: {
    padding: 8,
    backgroundColor: '#f0faf5',
    borderRadius: 10,
  },
  headerActions: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
  },
  actionsRow: {
    gap: 10,
    marginBottom: 20,
  },
  waterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4db88a',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2d9e6f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  waterBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  postponeGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  postponeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5ede3',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8d5bc',
    gap: 6,
  },
  postponeBtnText: {
    color: '#a07850',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f0faf5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#6b8c6b',
  },
  tabTextActive: {
    color: '#2d4a30',
    fontWeight: '600',
  },
  tabContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5ee',
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6b8c6b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d4a30',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f5ee',
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d4a30',
  },
  historyDate: {
    fontSize: 12,
    color: '#9bada0',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9bada0',
    fontSize: 14,
    paddingVertical: 24,
  },
  noteInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c8e6d4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2d4a30',
    maxHeight: 100,
  },
  noteAddBtn: {
    backgroundColor: '#4db88a',
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAddBtnDisabled: {
    backgroundColor: '#c8e6d4',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8f5ee',
    gap: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#2d4a30',
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 11,
    color: '#9bada0',
    marginTop: 4,
  },
});
