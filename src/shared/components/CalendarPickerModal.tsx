import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { theme } from '../theme';

export interface CalendarPickerModalProps {
  visible: boolean;
  selectedDate: string | null; // format: "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  onClose: () => void;
  title?: string;
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

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function CalendarPickerModal({
  visible,
  selectedDate,
  onSelectDate,
  onClose,
  title = 'Select Date',
}: CalendarPickerModalProps) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  useEffect(() => {
    if (visible) {
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

          {/* Month Navigation Row */}
          <View className="mb-3 flex-row items-center justify-between px-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={prevMonth}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-60"
            >
              <ChevronLeft size={18} color={theme.colors.text} />
            </Pressable>

            <Text className="text-body-sm font-sans-bold text-text">
              {MONTH_NAMES[month]} {year}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={nextMonth}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full border border-border active:opacity-60"
            >
              <ChevronRight size={18} color={theme.colors.text} />
            </Pressable>
          </View>

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

          {/* Footer Actions: Today & Clear */}
          <View className="mt-4 flex-row items-center justify-between border-t border-border/40 pt-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear date selection"
              onPress={() => {
                onSelectDate('');
                onClose();
              }}
              className="py-1 px-2"
            >
              <Text className="text-caption font-sans-medium text-error">Clear</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select today"
              onPress={handleSelectToday}
              className="py-1 px-2"
            >
              <Text className="text-caption font-sans-bold text-primary">Today</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default CalendarPickerModal;

