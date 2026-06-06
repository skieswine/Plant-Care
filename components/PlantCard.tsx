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
  const snapPoints = useMemo(() => ['64%', '94%'], []);
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

  const s = makeStyles(colors);

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
    const sum = parseInt(editSummer, 10);
    const win = editWinter.trim() ? parseInt(editWinter, 10) : undefined;
    if (!sum || sum < 1) return;
    updatePlantSeasonIntervals(plant.id, sum, win && win >= 1 ? win : undefined);
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
        <View style={s.modalOverlay}>
          <View style={s.intervalModal}>
            <Text style={s.intervalModalTitle}>{t('plant.intervalModalTitle')}</Text>

            <Text style={s.intervalFieldLabel}>{t('plant.summerIntervalLabel')}</Text>
            <View style={s.intervalPresets}>
              {[3, 7, 14, 30].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[s.intervalPreset, editSummer === String(d) && s.intervalPresetActive]}
                  onPress={() => setEditSummer(String(d))}
                >
                  <Text style={[s.intervalPresetText, editSummer === String(d) && s.intervalPresetTextActive]}>
                    {d} {t('plant.daysUnit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.intervalInput}
              value={editSummer}
              onChangeText={setEditSummer}
              keyboardType="numeric"
              maxLength={3}
              placeholder="..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[s.intervalFieldLabel, { marginTop: 16 }]}>{t('plant.winterIntervalLabel')}</Text>
            <View style={s.intervalPresets}>
              {[7, 14, 21, 30].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[s.intervalPreset, editWinter === String(d) && s.intervalPresetWinterActive]}
                  onPress={() => setEditWinter(String(d))}
                >
                  <Text style={[s.intervalPresetText, editWinter === String(d) && s.intervalPresetTextActive]}>
                    {d} {t('plant.daysUnit')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={s.intervalInput}
              value={editWinter}
              onChangeText={setEditWinter}
              keyboardType="numeric"
              maxLength={3}
              placeholder={t('plant.winterNotSet')}
              placeholderTextColor={colors.textMuted}
            />
            <Text style={s.intervalHint}>{t('plant.winterIntervalHint')}</Text>

            <View style={s.intervalModalBtns}>
              <TouchableOpacity style={s.intervalCancelBtn} onPress={() => setShowIntervalModal(false)}>
                <Text style={s.intervalCancelBtnText}>{t('plant.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.intervalSaveBtn} onPress={saveIntervals}>
                <Text style={s.intervalSaveBtnText}>{t('plant.saveIntervals')}</Text>
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
        backgroundStyle={s.sheetBackground}
        handleIndicatorStyle={s.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            {plant.photoUri ? (
              <Image source={{ uri: plant.photoUri }} style={s.photo} />
            ) : (
              <View style={s.photoPlaceholder}>
                <Text style={{ fontSize: 40 }}>🪴</Text>
              </View>
            )}
            <View style={s.headerInfo}>
              <Text style={s.plantName}>{getPlantDisplayName(plant)}</Text>
              {plant.species && plant.name && (
                <Text style={s.speciesLabel}>🌿 {translateSpecies(plant.species, language)}</Text>
              )}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 }}>
                <LightLevelIcon level={plant.lightLevel} showLabel />
                <CountdownBadge nextWateringDate={plant.nextWateringDate} />
              </View>
            </View>
            <View style={s.headerActions}>
              <TouchableOpacity
                onPress={() => { onClose(); setTimeout(() => router.push(`/plant/${plant.id}`), 300); }}
                style={s.editBtn}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={s.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.urgent} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Кнопки дій */}
          <View style={s.actionsRow}>
            <TouchableOpacity style={[s.waterBtn, { backgroundColor: colors.primary }]} onPress={onWater} activeOpacity={0.8}>
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={s.waterBtnText}>{t('plant.water')}</Text>
            </TouchableOpacity>
            <View style={s.postponeGroup}>
              <TouchableOpacity style={s.postponeBtn} onPress={() => onPostpone(1)} activeOpacity={0.8}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={s.postponeBtnText}>{t('plant.postpone1')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.postponeBtn} onPress={() => onPostpone(2)} activeOpacity={0.8}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={s.postponeBtnText}>{t('plant.postpone2')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Вкладки */}
          <View style={s.tabs}>
            {(['info', 'history', 'notes'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'info' ? t('plant.tabInfo') : tab === 'history' ? t('plant.tabHistory') : t('plant.tabNotes')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Вкладка: Інфо */}
          {activeTab === 'info' && (
            <View style={s.tabContent}>
              {plant.species && <InfoRow icon="leaf" label={t('plant.species_info')} value={translateSpecies(plant.species, language)} colors={colors} s={s} />}

              {/* Season section */}
              <View style={s.seasonSection}>
                <View style={s.seasonHeaderRow}>
                  <Ionicons name="partly-sunny-outline" size={18} color={colors.primaryLight} style={{ width: 26 }} />
                  <Text style={[s.seasonSectionLabel, { color: colors.text }]}>{t('plant.seasonLabel')}</Text>
                  <TouchableOpacity onPress={openIntervalModal} style={s.editIntervalsBtn}>
                    <Ionicons name="create-outline" size={16} color={colors.primaryLight} />
                    <Text style={[s.editIntervalsBtnText, { color: colors.primaryLight }]}>{t('plant.editIntervals')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.seasonToggleRow}>
                  <TouchableOpacity
                    style={[s.seasonChip, effectiveSeason === 'summer' && s.seasonChipSummerActive]}
                    onPress={() => setPlantSeasonOverride(plant.id, 'summer')}
                  >
                    <Text style={[s.seasonChipText, effectiveSeason === 'summer' && s.seasonChipTextActive]}>
                      🌞 {t('plant.summerInterval').replace('🌞 ', '')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.seasonChip, effectiveSeason === 'winter' && s.seasonChipWinterActive]}
                    onPress={() => setPlantSeasonOverride(plant.id, 'winter')}
                  >
                    <Text style={[s.seasonChipText, effectiveSeason === 'winter' && s.seasonChipTextActive]}>
                      ❄️ {t('plant.winterInterval').replace('❄️ ', '')}
                    </Text>
                  </TouchableOpacity>
                  {plant.seasonOverride && (
                    <TouchableOpacity
                      style={[s.seasonChip, s.seasonChipGlobal]}
                      onPress={() => setPlantSeasonOverride(plant.id, null)}
                    >
                      <Text style={s.seasonChipGlobalText}>↺ {t('plant.globalSeason')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={s.intervalSummaryRow}>
                  <View style={s.intervalSummaryItem}>
                    <Text style={[s.intervalSummaryLabel, { color: colors.textMuted }]}>🌞</Text>
                    <Text style={[s.intervalSummaryValue, { color: colors.text }, effectiveSeason === 'summer' && s.intervalSummaryActive]}>
                      {summerDays} {t('plant.daysUnit')}
                    </Text>
                  </View>
                  <Text style={[s.intervalSummarySep, { color: colors.border }]}>·</Text>
                  <View style={s.intervalSummaryItem}>
                    <Text style={[s.intervalSummaryLabel, { color: colors.textMuted }]}>❄️</Text>
                    <Text style={[s.intervalSummaryValue, { color: winterDays ? colors.text : colors.textMuted }, (effectiveSeason === 'winter' && !!winterDays) ? s.intervalSummaryWinterActive : null]}>
                      {winterDays ? `${winterDays} ${t('plant.daysUnit')}` : t('plant.winterNotSet')}
                    </Text>
                  </View>
                </View>
              </View>

              <InfoRow icon="calendar-outline" label={t('plant.wateringIntervalLabel')} value={`${plant.wateringIntervalDays} ${t('plant.daysUnit')}`} colors={colors} s={s} />
              <InfoRow icon="water-outline" label={t('plant.lastWatered')} value={formatDate(plant.lastWateredDate, language)} colors={colors} s={s} />
              <InfoRow icon="alarm-outline" label={t('plant.nextWatering')} value={formatDate(plant.nextWateringDate, language)} colors={colors} s={s} />
              <InfoRow icon="leaf-outline" label={t('plant.addedDate')} value={formatDate(plant.createdAt, language)} colors={colors} s={s} />
            </View>
          )}

          {/* Вкладка: Журнал */}
          {activeTab === 'history' && (
            <View style={s.tabContent}>
              {plant.wateringHistory.length === 0 ? (
                <Text style={s.emptyText}>{t('plant.noHistory')}</Text>
              ) : (
                plant.wateringHistory.map((record) => (
                  <View key={record.id} style={s.historyItem}>
                    <Ionicons
                      name={record.postponed ? 'time-outline' : 'water'}
                      size={18}
                      color={record.postponed ? colors.warning : colors.primary}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={s.historyLabel}>
                        {record.postponed
                          ? t('plant.postponed', { days: record.postponedDays ?? '' })
                          : t('plant.watered')}
                      </Text>
                      <Text style={s.historyDate}>{formatRelativeDate(record.date, language)}</Text>
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
                      style={s.historyDeleteBtn}
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
            <View style={s.tabContent}>
              <View style={s.noteInputRow}>
                <TextInput
                  style={s.noteInput}
                  placeholder={t('plant.addNotePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                />
                <TouchableOpacity
                  style={[s.noteAddBtn, !noteText.trim() && s.noteAddBtnDisabled, { backgroundColor: colors.primary }]}
                  onPress={onAddNote}
                  disabled={!noteText.trim()}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {plant.notes.length === 0 ? (
                <Text style={s.emptyText}>{t('plant.noNotes')}</Text>
              ) : (
                plant.notes.map((note) => (
                  <View key={note.id} style={s.noteItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.noteText}>{note.text}</Text>
                      <Text style={s.noteDate}>{formatRelativeDate(note.date)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteNote(plant.id, note.id)}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
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
  icon, label, value, colors, s,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  s: any;
}) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={18} color={colors.primaryLight} style={{ width: 26 }} />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    sheetBackground: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
    },
    handleIndicator: {
      backgroundColor: colors.border,
      width: 44,
      height: 4,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingVertical: 20,
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.border,
    },
    photoPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      gap: 6,
    },
    speciesLabel: {
      fontSize: 12,
      color: colors.primaryLight,
      fontWeight: '700',
    },
    plantName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.4,
    },
    deleteBtn: {
      padding: 8,
    },
    editBtn: {
      padding: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
    },
    headerActions: {
      flexDirection: 'column',
      gap: 8,
      alignItems: 'center',
    },
    actionsRow: {
      gap: 12,
      marginBottom: 24,
    },
    waterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 18,
      gap: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    waterBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
    postponeGroup: {
      flexDirection: 'row',
      gap: 12,
    },
    postponeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSecondary,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    postponeBtnText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '700',
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 16,
      padding: 4,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: colors.surface,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    tabText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    tabTextActive: {
      color: colors.text,
      fontWeight: '800',
    },
    tabContent: {
      gap: 10,
    },
    seasonSection: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingBottom: 16,
      gap: 12,
    },
    seasonHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 14,
    },
    seasonSectionLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
    },
    editIntervalsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    editIntervalsBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },
    seasonToggleRow: {
      flexDirection: 'row',
      gap: 10,
    },
    seasonChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.chipBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    seasonChipSummerActive: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    seasonChipWinterActive: {
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
    seasonChipGlobal: {
      backgroundColor: 'transparent',
      borderColor: colors.primaryLight,
      borderStyle: 'dashed',
    },
    seasonChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    seasonChipTextActive: {
      color: '#fff',
    },
    seasonChipGlobalText: {
      fontSize: 12,
      color: colors.primaryLight,
      fontWeight: '700',
    },
    intervalSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surfaceSecondary,
      padding: 12,
      borderRadius: 14,
    },
    intervalSummaryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    intervalSummaryLabel: {
      fontSize: 14,
    },
    intervalSummaryValue: {
      fontSize: 13,
      fontWeight: '600',
    },
    intervalSummaryActive: {
      fontWeight: '800',
      color: colors.warning,
    },
    intervalSummaryWinterActive: {
      fontWeight: '800',
      color: '#3b82f6',
    },
    intervalSummarySep: {
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: 'center',
      padding: 24,
    },
    intervalModal: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    intervalModalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    intervalFieldLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    intervalPresets: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    intervalPreset: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.chipBg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    intervalPresetActive: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    intervalPresetWinterActive: {
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
    },
    intervalPresetText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    intervalPresetTextActive: {
      color: '#fff',
    },
    intervalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      marginTop: 4,
      backgroundColor: colors.inputBg,
    },
    intervalHint: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    intervalModalBtns: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    intervalCancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    intervalCancelBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    intervalSaveBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    intervalSaveBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#fff',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    historyDeleteBtn: {
      padding: 4,
      marginLeft: 8,
    },
    historyLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      paddingVertical: 24,
      fontWeight: '600',
    },
    noteInputRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
      alignItems: 'flex-end',
    },
    noteInput: {
      flex: 1,
      backgroundColor: colors.inputBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      maxHeight: 100,
    },
    noteAddBtn: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteAddBtnDisabled: {
      opacity: 0.5,
    },
    noteItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surfaceSecondary,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: 10,
    },
    noteText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontWeight: '500',
    },
    noteDate: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '600',
    },
  });
}
