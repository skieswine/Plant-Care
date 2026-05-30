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
  Modal,
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
import { useTheme } from '../hooks/useTheme';
import { useT } from '../hooks/useT';
import { translateSpecies } from '../constants/plantSpecies';

type Tab = 'info' | 'history' | 'notes';

interface Props {
  plantId: string | null;
  onClose: () => void;
}

export function PlantCard({ plantId, onClose }: Props) {
  const plant = useAppStore((s) => s.plants.find((p) => p.id === plantId) ?? null);
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%', '92%'], []);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [noteText, setNoteText] = useState('');
  const [showWateringAnim, setShowWateringAnim] = useState(false);
  const { colors } = useTheme();
  const { t, language } = useT();

  const globalSeason = useAppStore((s) => s.season);
  const addNote = useAppStore((s) => s.addNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const deleteWateringRecord = useAppStore((s) => s.deleteWateringRecord);
  const deletePlant = useAppStore((s) => s.deletePlant);
  const setPlantSeasonOverride = useAppStore((s) => s.setPlantSeasonOverride);
  const updatePlantSeasonIntervals = useAppStore((s) => s.updatePlantSeasonIntervals);
  const { handleWater, handlePostpone } = useWatering();

  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [editSummer, setEditSummer] = useState('');
  const [editWinter, setEditWinter] = useState('');

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
        t('plant.postponeTitle'),
        t('plant.postponeMessage', {
          name: displayName,
          days,
          unit: days === 1 ? t('plant.postponeUnit1') : t('plant.postponeUnit2'),
        }),
        [
          { text: t('plant.cancel'), style: 'cancel' },
          { text: t('plant.postponeTitle'), onPress: () => handlePostpone(plant.id, days) },
        ]
      );
    },
    [plant, handlePostpone, t]
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
      t('plant.deleteTitle'),
      t('plant.deleteMessage', { name: displayName }),
      [
        { text: t('plant.cancel'), style: 'cancel' },
        {
          text: t('plant.delete'),
          style: 'destructive',
          onPress: () => {
            deletePlant(plant.id);
            onClose();
          },
        },
      ]
    );
  }, [plant, deletePlant, onClose, t]);

  if (!plant) return null;

  const effectiveSeason = plant.seasonOverride ?? globalSeason;
  const summerDays = plant.summerWateringIntervalDays ?? plant.wateringIntervalDays;
  const winterDays = plant.winterWateringIntervalDays;

  const openIntervalModal = () => {
    setEditSummer(String(summerDays));
    setEditWinter(winterDays ? String(winterDays) : '');
    setShowIntervalModal(true);
  };

  const saveIntervals = () => {
    const s = parseInt(editSummer, 10);
    const w = editWinter.trim() ? parseInt(editWinter, 10) : undefined;
    if (!s || s < 1) return;
    updatePlantSeasonIntervals(plant.id, s, w && w >= 1 ? w : undefined);
    setShowIntervalModal(false);
  };

  return (
    <>
      {showWateringAnim && (
        <WateringAnimation
          visible={showWateringAnim}
          onComplete={() => setShowWateringAnim(false)}
        />
      )}

      <Modal visible={showIntervalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.intervalModal}>
            <Text style={styles.intervalModalTitle}>{t('plant.intervalModalTitle')}</Text>

            <Text style={styles.intervalFieldLabel}>{t('plant.summerIntervalLabel')}</Text>
            <View style={styles.intervalPresets}>
              {[3, 7, 14, 30].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.intervalPreset, editSummer === String(d) && styles.intervalPresetActive]}
                  onPress={() => setEditSummer(String(d))}
                >
                  <Text style={[styles.intervalPresetText, editSummer === String(d) && styles.intervalPresetTextActive]}>
                    {d} {t('plant.daysUnit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.intervalInput}
              value={editSummer}
              onChangeText={setEditSummer}
              keyboardType="numeric"
              maxLength={3}
              placeholder="..."
              placeholderTextColor="#aaa"
            />

            <Text style={[styles.intervalFieldLabel, { marginTop: 16 }]}>{t('plant.winterIntervalLabel')}</Text>
            <View style={styles.intervalPresets}>
              {[7, 14, 21, 30].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.intervalPreset, editWinter === String(d) && styles.intervalPresetWinterActive]}
                  onPress={() => setEditWinter(String(d))}
                >
                  <Text style={[styles.intervalPresetText, editWinter === String(d) && styles.intervalPresetTextActive]}>
                    {d} {t('plant.daysUnit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.intervalInput}
              value={editWinter}
              onChangeText={setEditWinter}
              keyboardType="numeric"
              maxLength={3}
              placeholder={t('plant.winterNotSet')}
              placeholderTextColor="#aaa"
            />
            <Text style={styles.intervalHint}>{t('plant.winterIntervalHint')}</Text>

            <View style={styles.intervalModalBtns}>
              <TouchableOpacity style={styles.intervalCancelBtn} onPress={() => setShowIntervalModal(false)}>
                <Text style={styles.intervalCancelBtnText}>{t('plant.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.intervalSaveBtn} onPress={saveIntervals}>
                <Text style={styles.intervalSaveBtnText}>{t('plant.saveIntervals')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.surface }]}
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
                <Text style={styles.speciesLabel}>🌿 {translateSpecies(plant.species, language)}</Text>
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
            <TouchableOpacity style={[styles.waterBtn, { backgroundColor: colors.primary }]} onPress={onWater} activeOpacity={0.8}>
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={styles.waterBtnText}>{t('plant.water')}</Text>
            </TouchableOpacity>
            <View style={styles.postponeGroup}>
              <TouchableOpacity style={styles.postponeBtn} onPress={() => onPostpone(1)} activeOpacity={0.8}>
                <Ionicons name="time-outline" size={16} color="#a07850" />
                <Text style={styles.postponeBtnText}>{t('plant.postpone1')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postponeBtn} onPress={() => onPostpone(2)} activeOpacity={0.8}>
                <Ionicons name="time-outline" size={16} color="#a07850" />
                <Text style={styles.postponeBtnText}>{t('plant.postpone2')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Вкладки */}
          <View style={[styles.tabs, { borderBottomColor: colors.borderLight }]}>
            {(['info', 'history', 'notes'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'info' ? t('plant.tabInfo') : tab === 'history' ? t('plant.tabHistory') : t('plant.tabNotes')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Вкладка: Інфо */}
          {activeTab === 'info' && (
            <View style={styles.tabContent}>
              {plant.species && <InfoRow icon="leaf" label={t('plant.species_info')} value={translateSpecies(plant.species, language)} colors={colors} />}

              {/* Season section */}
              <View style={[styles.seasonSection, { borderColor: colors.borderLight }]}>
                <View style={styles.seasonHeaderRow}>
                  <Ionicons name="partly-sunny-outline" size={18} color={colors.primaryLight} style={{ width: 26 }} />
                  <Text style={[styles.seasonSectionLabel, { color: colors.textSecondary }]}>{t('plant.seasonLabel')}</Text>
                  <TouchableOpacity onPress={openIntervalModal} style={styles.editIntervalsBtn}>
                    <Ionicons name="create-outline" size={16} color={colors.primaryLight} />
                    <Text style={[styles.editIntervalsBtnText, { color: colors.primaryLight }]}>{t('plant.editIntervals')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.seasonToggleRow}>
                  <TouchableOpacity
                    style={[styles.seasonChip, effectiveSeason === 'summer' && styles.seasonChipSummerActive]}
                    onPress={() => setPlantSeasonOverride(plant.id, 'summer')}
                  >
                    <Text style={[styles.seasonChipText, effectiveSeason === 'summer' && styles.seasonChipTextActive]}>
                      🌞 {t('plant.summerInterval').replace('🌞 ', '')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.seasonChip, effectiveSeason === 'winter' && styles.seasonChipWinterActive]}
                    onPress={() => setPlantSeasonOverride(plant.id, 'winter')}
                  >
                    <Text style={[styles.seasonChipText, effectiveSeason === 'winter' && styles.seasonChipTextActive]}>
                      ❄️ {t('plant.winterInterval').replace('❄️ ', '')}
                    </Text>
                  </TouchableOpacity>
                  {plant.seasonOverride && (
                    <TouchableOpacity
                      style={[styles.seasonChip, styles.seasonChipGlobal]}
                      onPress={() => setPlantSeasonOverride(plant.id, null)}
                    >
                      <Text style={styles.seasonChipGlobalText}>↺ {t('plant.globalSeason')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.intervalSummaryRow}>
                  <View style={styles.intervalSummaryItem}>
                    <Text style={[styles.intervalSummaryLabel, { color: colors.textMuted }]}>🌞</Text>
                    <Text style={[styles.intervalSummaryValue, { color: colors.text }, effectiveSeason === 'summer' && styles.intervalSummaryActive]}>
                      {summerDays} {t('plant.daysUnit')}
                    </Text>
                  </View>
                  <Text style={[styles.intervalSummarySep, { color: colors.border }]}>·</Text>
                  <View style={styles.intervalSummaryItem}>
                    <Text style={[styles.intervalSummaryLabel, { color: colors.textMuted }]}>❄️</Text>
                    <Text style={[styles.intervalSummaryValue, { color: winterDays ? colors.text : colors.textMuted }, (effectiveSeason === 'winter' && !!winterDays) ? styles.intervalSummaryWinterActive : null]}>
                      {winterDays ? `${winterDays} ${t('plant.daysUnit')}` : t('plant.winterNotSet')}
                    </Text>
                  </View>
                </View>
              </View>

              <InfoRow icon="calendar-outline" label={t('plant.wateringIntervalLabel')} value={`${plant.wateringIntervalDays} ${t('plant.daysUnit')}`} colors={colors} />
              <InfoRow icon="water-outline" label={t('plant.lastWatered')} value={formatDate(plant.lastWateredDate, language)} colors={colors} />
              <InfoRow icon="alarm-outline" label={t('plant.nextWatering')} value={formatDate(plant.nextWateringDate, language)} colors={colors} />
              <InfoRow icon="leaf-outline" label={t('plant.addedDate')} value={formatDate(plant.createdAt, language)} colors={colors} />
            </View>
          )}

          {/* Вкладка: Журнал */}
          {activeTab === 'history' && (
            <View style={styles.tabContent}>
              {plant.wateringHistory.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('plant.noHistory')}</Text>
              ) : (
                plant.wateringHistory.map((record) => (
                  <View key={record.id} style={[styles.historyItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <Ionicons
                      name={record.postponed ? 'time-outline' : 'water'}
                      size={18}
                      color={record.postponed ? colors.warning : colors.primary}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.historyLabel, { color: colors.text }]}>
                        {record.postponed
                          ? t('plant.postponed', { days: record.postponedDays ?? '' })
                          : t('plant.watered')}
                      </Text>
                      <Text style={[styles.historyDate, { color: colors.textMuted }]}>{formatRelativeDate(record.date, language)}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          t('plant.deleteRecord'),
                          t('plant.deleteRecordMsg'),
                          [
                            { text: t('plant.cancel'), style: 'cancel' },
                            {
                              text: t('plant.delete'),
                              style: 'destructive',
                              onPress: () => deleteWateringRecord(plant.id, record.id),
                            },
                          ]
                        )
                      }
                      style={styles.historyDeleteBtn}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
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
                  style={[styles.noteInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder={t('plant.addNotePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.noteAddBtn, !noteText.trim() && styles.noteAddBtnDisabled, { backgroundColor: colors.primary }]}
                  onPress={onAddNote}
                  disabled={!noteText.trim()}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {plant.notes.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('plant.noNotes')}</Text>
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
  icon, label, value, colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={[styles.infoRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <Ionicons name={icon} size={18} color={colors.primaryLight} style={{ width: 26 }} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
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

  // Season section
  seasonSection: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    gap: 10,
  },
  seasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  seasonSectionLabel: {
    flex: 1,
    fontSize: 14,
  },
  editIntervalsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editIntervalsBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  seasonToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  seasonChipSummerActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  seasonChipWinterActive: {
    backgroundColor: '#60a5fa',
    borderColor: '#60a5fa',
  },
  seasonChipGlobal: {
    backgroundColor: 'transparent',
    borderColor: '#c8e6d4',
    borderStyle: 'dashed',
  },
  seasonChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  seasonChipTextActive: {
    color: '#fff',
  },
  seasonChipGlobalText: {
    fontSize: 12,
    color: '#7dd1aa',
    fontWeight: '600',
  },
  intervalSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intervalSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  intervalSummaryLabel: {
    fontSize: 14,
  },
  intervalSummaryValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  intervalSummaryActive: {
    fontWeight: '700',
    color: '#f59e0b',
  },
  intervalSummaryWinterActive: {
    fontWeight: '700',
    color: '#60a5fa',
  },
  intervalSummarySep: {
    fontSize: 16,
  },

  // Interval modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  intervalModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  intervalModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d4a30',
    marginBottom: 8,
  },
  intervalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b8c6b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  intervalPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  intervalPreset: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#f0faf5',
    borderWidth: 1.5,
    borderColor: '#c8e6d4',
  },
  intervalPresetActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  intervalPresetWinterActive: {
    backgroundColor: '#60a5fa',
    borderColor: '#60a5fa',
  },
  intervalPresetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4db88a',
  },
  intervalPresetTextActive: {
    color: '#fff',
  },
  intervalInput: {
    borderWidth: 1,
    borderColor: '#c8e6d4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#2d4a30',
    marginTop: 4,
  },
  intervalHint: {
    fontSize: 11,
    color: '#9bada0',
    marginTop: 2,
  },
  intervalModalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  intervalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  intervalCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  intervalSaveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4db88a',
    alignItems: 'center',
  },
  intervalSaveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
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
  historyDeleteBtn: {
    padding: 4,
    marginLeft: 6,
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
