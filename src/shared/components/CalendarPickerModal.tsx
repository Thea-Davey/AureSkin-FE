import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from 'lucide-react-native';
import { theme } from '../theme';
import { Button } from './Button';

export interface CalendarPickerModalProps {
  visible: boolean;
  selectedDate: string | null; // format: "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  onClose: () => void;
  title?: string;
  minYear?: number;
  maxYear?: number;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type PickerMode = 'days' | 'months' | 'years';

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = 'Select Date',
  minYear = 1920,
  maxYear = new Date().getFullYear(),
}: CalendarPickerModalProps) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });
  const [pickerMode, setPickerMode] = useState<PickerMode>('days');

  const yearsList = useMemo(() => {
    const start = Math.min(minYear, maxYear);
    const end = Math.max(minYear, maxYear);
    const list: number[] = [];
    for (let y = end; y >= start; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, maxYear]);

  useEffect(() => {
    if (visible) {
      setPickerMode('days');
      if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        const [y, m] = selectedDate.split('-').map(Number);
        setViewDate(new Date(y, m - 1, 1));
      } else {
        setViewDate(new Date());
      }
    }
  }, [visible, selectedDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectMonth = (chosenMonth: number) => {
    setViewDate(new Date(year, chosenMonth, 1));
    setPickerMode('days');
  };

  const handleSelectYear = (chosenYear: number) => {
    setViewDate(new Date(chosenYear, month, 1));
    setPickerMode('days');
  };

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  })();

  const handleSelectDay = (day: number) => {
    const formatted = `${year}-${pad(month + 1)}-${pad(day)}`;
    onSelectDate(formatted);
    onClose();
  };

  const handleSelectToday = () => {
    onSelectDate(todayStr);
    onClose();
  };

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Backdrop */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close calendar backdrop"
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Dialog Card */}
        <View className="relative w-full max-w-[340px] rounded-card bg-card p-5 shadow-xl">
          {/* Header Row: Title & Close Button */}
          <View className="mb-4 flex-row items-center justify-between border-b border-border/40 pb-3">
            <Text className="text-body font-sans-bold text-text">{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close calendar"
              onPress={onClose}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-neutral-offwhite"
            >
              <X size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Month & Year Navigation Row */}
          <View className="mb-3 flex-row items-center justify-between gap-2 px-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              disabled={pickerMode !== 'days'}
              onPress={prevMonth}
              hitSlop={8}
              className={`h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-60 ${
                pickerMode !== 'days' ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <ChevronLeft size={18} color={theme.colors.text} />
            </Pressable>

            <View className="flex-row items-center gap-2">
              {/* Month Selector Pill */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={pickerMode === 'months' ? 'Close month selector' : 'Select month'}
                onPress={() => setPickerMode((prev) => (prev === 'months' ? 'days' : 'months'))}
                className={`flex-row items-center gap-1 rounded-badge border px-3 py-1.5 active:opacity-75 ${
                  pickerMode === 'months'
                    ? 'border-primary bg-primary/15'
                    : 'border-border bg-neutral-offwhite'
                }`}
              >
                <Text
                  className={`text-body-sm font-sans-bold ${
                    pickerMode === 'months' ? 'text-primary' : 'text-text'
                  }`}
                >
                  {MONTH_NAMES[month]}
                </Text>
                {pickerMode === 'months' ? (
                  <ChevronUp size={14} color={theme.colors.primary} />
                ) : (
                  <ChevronDown size={14} color={theme.colors.primary} />
                )}
              </Pressable>

              {/* Year Selector Pill */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={pickerMode === 'years' ? 'Close year selector' : 'Select year'}
                onPress={() => setPickerMode((prev) => (prev === 'years' ? 'days' : 'years'))}
                className={`flex-row items-center gap-1 rounded-badge border px-3 py-1.5 active:opacity-75 ${
                  pickerMode === 'years'
                    ? 'border-primary bg-primary/15'
                    : 'border-border bg-neutral-offwhite'
                }`}
              >
                <Text
                  className={`text-body-sm font-sans-bold ${
                    pickerMode === 'years' ? 'text-primary' : 'text-text'
                  }`}
                >
                  {year}
                </Text>
                {pickerMode === 'years' ? (
                  <ChevronUp size={14} color={theme.colors.primary} />
                ) : (
                  <ChevronDown size={14} color={theme.colors.primary} />
                )}
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              disabled={pickerMode !== 'days'}
              onPress={nextMonth}
              hitSlop={8}
              className={`h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-60 ${
                pickerMode !== 'days' ? 'opacity-30' : 'opacity-100'
              }`}
            >
              <ChevronRight size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {pickerMode === 'months' ? (
            /* 3x4 Month Selector Grid */
            <View className="h-64 justify-center">
              <Text className="mb-3 text-center text-caption font-sans-medium text-muted">
                Select Month
              </Text>
              <View className="flex-row flex-wrap">
                {MONTH_SHORT_NAMES.map((shortName, mIdx) => {
                  const isCurrentMonth = mIdx === month;
                  return (
                    <View key={shortName} style={{ width: '33.3333%' }} className="p-1.5">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${MONTH_NAMES[mIdx]}`}
                        accessibilityState={{ selected: isCurrentMonth }}
                        onPress={() => handleSelectMonth(mIdx)}
                        className={`items-center justify-center rounded-button py-3 ${
                          isCurrentMonth
                            ? 'bg-primary'
                            : 'bg-neutral-offwhite active:bg-primary/15'
                        }`}
                      >
                        <Text
                          className={`text-body-sm ${
                            isCurrentMonth
                              ? 'font-sans-bold text-neutral-white'
                              : 'font-sans-medium text-text'
                          }`}
                        >
                          {shortName}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : pickerMode === 'years' ? (
            /* Scrollable Year Selector Grid */
            <ScrollView
              className="h-64"
              showsVerticalScrollIndicator={true}
              contentContainerClassName="pb-2"
            >
              <Text className="mb-2 text-center text-caption font-sans-medium text-muted">
                Select Year
              </Text>
              <View className="flex-row flex-wrap">
                {yearsList.map((yr) => {
                  const isCurrentYear = yr === year;
                  return (
                    <View key={yr} style={{ width: '25%' }} className="p-1">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Select year ${yr}`}
                        accessibilityState={{ selected: isCurrentYear }}
                        onPress={() => handleSelectYear(yr)}
                        className={`items-center justify-center rounded-button py-2 ${
                          isCurrentYear
                            ? 'bg-primary'
                            : 'bg-neutral-offwhite active:bg-primary/15'
                        }`}
                      >
                        <Text
                          className={`text-body-sm ${
                            isCurrentYear
                              ? 'font-sans-bold text-neutral-white'
                              : 'font-sans-medium text-text'
                          }`}
                        >
                          {yr}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <>
              {/* Days of week header */}
              <View className="mb-2 flex-row">
                {DAYS_OF_WEEK.map((dayName) => (
                  <View key={dayName} className="flex-1 items-center justify-center py-1">
                    <Text className="text-caption font-sans-semibold text-muted">{dayName}</Text>
                  </View>
                ))}
              </View>

              {/* Days grid */}
              <View className="flex-row flex-wrap">
                {daysArray.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={{ width: `${100 / 7}%` }} className="h-10" />;
                  }

                  const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
                  const isSelected = selectedDate === dateStr;
                  const isToday = todayStr === dateStr;

                  return (
                    <View
                      key={`day-${day}`}
                      style={{ width: `${100 / 7}%` }}
                      className="h-10 items-center justify-center"
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={dateStr}
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => handleSelectDay(day)}
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                          isSelected
                            ? 'bg-primary'
                            : isToday
                              ? 'border border-primary bg-primary/10'
                              : 'active:bg-neutral-offwhite'
                        }`}
                      >
                        <Text
                          className={`text-body-sm ${
                            isSelected
                              ? 'font-sans-bold text-neutral-white'
                              : isToday
                                ? 'font-sans-bold text-primary'
                                : 'font-sans text-text'
                          }`}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Footer Actions: Today & Clear */}
          <View className="mt-4 flex-row items-center justify-between border-t border-border/40 pt-3">
            <Button
              variant="ghost"
              size="sm"
              title="Clear"
              textClassName="text-caption font-sans-medium text-error"
              className="py-1 px-2"
              accessibilityLabel="Clear date selection"
              onPress={() => {
                onSelectDate('');
                onClose();
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              title="Today"
              textClassName="text-caption font-sans-bold text-primary"
              className="py-1 px-2"
              accessibilityLabel="Select today"
              onPress={handleSelectToday}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CalendarPickerModal;

