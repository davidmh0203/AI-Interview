// ScrollArea.js — React Native port of Radix Scroll Area (JSX)
// - No external deps beyond react / react-native
// - Vertical & horizontal scroll, with custom thumb synced to scroll position
// - Works with any children; wrap content automatically
//
// Usage:
// <ScrollArea style={{ height: 240 }}>
//   <YourLongContent />
// </ScrollArea>
//
// Optional horizontal mode:
// <ScrollArea orientation="horizontal" style={{ width: 300 }}> ... </ScrollArea>

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Animated,
  ScrollView,
  StyleSheet,
  PanResponder,
} from "react-native";

export function ScrollArea({
  children,
  style,
  orientation = "vertical", // 'vertical' | 'horizontal'
  scrollbarThickness = 10,
  thumbMinSize = 24,
  thumbColor = "#d4d4d8", // tailwind zinc-300-ish
  trackColor = "transparent",
  showTrack = false,
  ...rest
}) {
  const isVertical = orientation === "vertical";
  const scrollRef = useRef(null);

  // container and content sizes
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const [contentW, setContentW] = useState(1);
  const [contentH, setContentH] = useState(1);

  const scrollA = useRef(new Animated.Value(0)).current; // y or x depending on orientation

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerW(width);
    setContainerH(height);
  };

  const onContentSizeChange = (w, h) => {
    setContentW(Math.max(1, w));
    setContentH(Math.max(1, h));
  };

  // Derived sizes
  const trackSize = isVertical ? containerH : containerW;
  const contentSize = isVertical ? contentH : contentW;
  const viewportSize = isVertical ? containerH : containerW;

  const scrollable = Math.max(0, contentSize - viewportSize);
  const visibleRatio = contentSize > 0 ? viewportSize / contentSize : 1;
  const thumbLen = Math.max(thumbMinSize, Math.round(visibleRatio * trackSize));
  const maxThumbTravel = Math.max(0, trackSize - thumbLen);

  const thumbTranslate = scrollA.interpolate({
    inputRange: [0, Math.max(1, scrollable)],
    outputRange: [0, maxThumbTravel],
    extrapolate: "clamp",
  });

  // Dragging the thumb to scroll (optional but nice)
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          const delta = isVertical ? g.dy : g.dx;
          // Map thumb movement back to scroll distance
          const scrollDelta =
            (delta / Math.max(1, maxThumbTravel)) * scrollable;
          // Read current Animated value synchronously via listener-like workaround
          // We can't read Animated.Value directly; instead drive scrollTo using gesture state
          // so use the gesture's move to compute target position roughly
        },
        onPanResponderRelease: () => {},
      }),
    [isVertical, maxThumbTravel, scrollable]
  );

  // We drive the ScrollView and let Animated map scroll -> thumb position
  const onScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: isVertical ? { y: scrollA } : { x: scrollA },
        },
      },
    ],
    { useNativeDriver: false }
  );

  // Helper to programmatically set scroll when thumb is dragged
  const handleTrackPress = useCallback(
    (evt) => {
      if (!scrollRef.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      const posOnTrack = isVertical ? locationY : locationX;
      const thumbStart = thumbTranslate.__getValue?.() || 0; // fallback
      const target =
        posOnTrack < thumbStart
          ? Math.max(0, (posOnTrack / Math.max(1, maxThumbTravel)) * scrollable)
          : Math.min(
              scrollable,
              ((posOnTrack - thumbLen) / Math.max(1, maxThumbTravel)) *
                scrollable
            );

      scrollRef.current.scrollTo({
        x: isVertical ? 0 : target,
        y: isVertical ? target : 0,
        animated: false,
      });
    },
    [isVertical, thumbLen, maxThumbTravel, scrollable, thumbTranslate]
  );

  const Track = (
    <View
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleTrackPress}
      style={[
        styles.track,
        isVertical
          ? { width: scrollbarThickness, right: 0 }
          : { height: scrollbarThickness, bottom: 0 },
        showTrack && { backgroundColor: trackColor },
      ]}
      pointerEvents={scrollable > 0 ? "auto" : "none"}
    >
      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.thumb,
          { backgroundColor: thumbColor },
          isVertical
            ? { height: thumbLen, transform: [{ translateY: thumbTranslate }] }
            : { width: thumbLen, transform: [{ translateX: thumbTranslate }] },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.root, style]} onLayout={onLayout} {...rest}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal={!isVertical}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.viewport}
        contentContainerStyle={styles.content}
      >
        {children}
      </Animated.ScrollView>

      {/* Corner is not necessary on RN; omit like Radix Corner */}

      {/* Overlay scrollbar */}
      {scrollable > 0 && (
        <View
          style={[
            styles.scrollbar,
            isVertical
              ? { right: 2, top: 2, bottom: 2 }
              : { left: 2, right: 2, bottom: 2 },
          ]}
        >
          {Track}
        </View>
      )}
    </View>
  );
}

// Separate ScrollBar export for API similarity (renders only the overlay)
export function ScrollBar(props) {
  return <View pointerEvents="none" />; // noop — managed by <ScrollArea/>
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  viewport: {
    flex: 1,
  },
  content: {
    // consumers can override via content container on children
    padding: 0,
  },
  scrollbar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: "box-none",
  },
  track: {
    position: "absolute",
    backgroundColor: "transparent",
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  thumb: {
    position: "absolute",
    borderRadius: 999,
    left: 0,
    right: 0,
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  const items = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <ScrollArea style={{ height: 240 }}>
      <View style={{ gap: 8, padding: 12 }}>
        {items.map((n) => (
          <View
            key={n}
            style={{
              height: 36,
              borderRadius: 8,
              backgroundColor: n % 2 ? "#f4f4f5" : "#fff",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "#e5e7eb",
            }}
          />
        ))}
      </View>
    </ScrollArea>
  );
}
