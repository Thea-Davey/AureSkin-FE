import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Text,
  View,
} from 'react-native';

const ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z', '#',
];

const LETTER_HEIGHT = 12;
const SCRUBBER_HEIGHT = ALPHABET.length * LETTER_HEIGHT; // 27 * 12 = 324px

export interface AlphabetScrubberProps {
  /** Array of section letters available in the current catalog (e.g. ['A', 'B', 'C', ...]) */
  availableSections: string[];
  /** Optional active section letter to highlight */
  activeLetter?: string | null;
  /** Callback fired whenever the user taps or drags onto a letter */
  onSelectLetter: (letter: string) => void;
  /** Optional container style class */
  className?: string;
}

export function AlphabetScrubber({
  availableSections,
  activeLetter,
  onSelectLetter,
  className = '',
}: AlphabetScrubberProps) {
  const stripRef = useRef<React.ElementRef<typeof View>>(null);
  const [stripLayout, setStripLayout] = useState<{ pageY: number; height: number } | null>(null);
  const [activeTouch, setActiveTouch] = useState<{ letter: string; relativeY: number } | null>(null);
  const lastSelectedRef = useRef<string | null>(null);

  const availableSet = useMemo(
    () => new Set(availableSections.map((l) => l.toUpperCase())),
    [availableSections]
  );

  const processTouch = useCallback(
    (touchPageY: number, stripPageY: number, stripHeight: number) => {
      const relativeY = touchPageY - stripPageY;
      const clampedY = Math.max(0, Math.min(relativeY, stripHeight - 1));
      const index = Math.min(
        ALPHABET.length - 1,
        Math.max(0, Math.floor((clampedY / stripHeight) * ALPHABET.length))
      );
      const letter = ALPHABET[index];

      if (letter) {
        setActiveTouch({ letter, relativeY: clampedY });
        if (lastSelectedRef.current !== letter) {
          lastSelectedRef.current = letter;
          onSelectLetter(letter);
        }
      }
    },
    [onSelectLetter]
  );

  const handleTouchAtPageY = useCallback(
    (pageY: number) => {
      if (!stripLayout || stripLayout.height <= 0) {
        stripRef.current?.measureInWindow((_x: number, y: number, _width: number, height: number) => {
          if (height > 0) {
            setStripLayout({ pageY: y, height });
            processTouch(pageY, y, height);
          }
        });
        return;
      }
      processTouch(pageY, stripLayout.pageY, stripLayout.height);
    },
    [stripLayout, processTouch]
  );

  const handleLayout = useCallback(() => {
    stripRef.current?.measureInWindow((_x: number, y: number, _width: number, height: number) => {
      if (height > 0) {
        setStripLayout({ pageY: y, height });
      }
    });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          handleTouchAtPageY(evt.nativeEvent.pageY);
        },
        onPanResponderMove: (evt) => {
          handleTouchAtPageY(evt.nativeEvent.pageY);
        },
        onPanResponderRelease: () => {
          setActiveTouch(null);
          lastSelectedRef.current = null;
        },
        onPanResponderTerminate: () => {
          setActiveTouch(null);
          lastSelectedRef.current = null;
        },
      }),
    [handleTouchAtPageY]
  );

  return (
    <View
      pointerEvents="box-none"
      className={`absolute right-0 top-0 bottom-0 justify-center items-end z-30 ${className}`}
    >
      <View
        ref={stripRef}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
        style={{ height: SCRUBBER_HEIGHT }}
        className="w-7 items-center justify-center py-0.5 relative"
        accessibilityRole="adjustable"
        accessibilityLabel="Alphabet index scrubber"
      >
        {/* Floating Magnifier Bubble while dragging */}
        {activeTouch ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 36,
              top: Math.max(0, Math.min(SCRUBBER_HEIGHT - 44, activeTouch.relativeY - 22)),
              width: 44,
              height: 44,
            }}
            className="items-center justify-center rounded-full bg-primary shadow-lg"
          >
            <Text className="text-h2 font-sans-bold text-neutral-white">
              {activeTouch.letter}
            </Text>
          </View>
        ) : null}

        {/* Compact Vertical Alphabet Column (27 letters * 12px = 324px) */}
        {ALPHABET.map((letter) => {
          const isAvailable = availableSet.has(letter);
          const isSelected = activeTouch?.letter === letter || activeLetter === letter;

          return (
            <View
              key={letter}
              pointerEvents="none"
              style={{ height: LETTER_HEIGHT }}
              className="w-full items-center justify-center"
            >
              <Text
                style={{ fontSize: 10, lineHeight: LETTER_HEIGHT }}
                className={`font-sans-bold ${isSelected
                  ? 'text-primary'
                  : isAvailable
                    ? 'text-primary'
                    : 'text-primary/40'
                  }`}
              >
                {letter}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
