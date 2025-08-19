import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Pressable,
  useWindowDimensions,
} from "react-native";

// --------------------------------------
// Exports (public API)
// --------------------------------------
export function ResizablePanelGroup({
  children,
  direction = "horizontal", // 'horizontal' | 'vertical'
  initialSizes, // number[] sum ~= 1
  minSizes, // number[] same length as panels, default 0.1
  onSizesChange,
  handleThickness = 8, // px
  style,
  handleStyle,
  handleActiveStyle,
  withHandlesDefault = false,
}) {
  // Split children into panels and handles keeping order
  const items = React.Children.toArray(children);
  const panelIndices = [];
  const parts = [];
  items.forEach((child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === ResizablePanel) {
      panelIndices.push(parts.length);
      parts.push({ type: "panel", element: child });
    } else if (child.type === ResizableHandle) {
      parts.push({ type: "handle", element: child });
    } else {
      // treat as panel by default
      panelIndices.push(parts.length);
      parts.push({ type: "panel", element: child });
    }
  });

  // Count panels & set default sizes
  const panelsOnly = parts.filter((p) => p.type === "panel");
  const panelCount = panelsOnly.length;
  const defaultSizes = useMemo(() => {
    if (initialSizes && initialSizes.length === panelCount)
      return normalize(initialSizes);
    return Array(panelCount).fill(1 / Math.max(1, panelCount));
  }, [initialSizes, panelCount]);

  const mins = useMemo(() => {
    if (minSizes && minSizes.length === panelCount) return minSizes;
    return Array(panelCount).fill(0.1);
  }, [minSizes, panelCount]);

  const [sizes, setSizes] = useState(defaultSizes);
  const containerMainSize = useRef(0); // width for horizontal, height for vertical
  const activeHandleRef = useRef(null); // {leftIdx, rightIdx, startMainPos, startSizes}

  const isHorizontal = direction === "horizontal";

  const onLayout = useCallback(
    (e) => {
      const { width, height } = e.nativeEvent.layout;
      containerMainSize.current = isHorizontal ? width : height;
    },
    [isHorizontal]
  );

  const updateSizes = useCallback(
    (next) => {
      const normalized = clampToMinsAndNormalize(next, mins);
      setSizes(normalized);
      onSizesChange?.(normalized);
    },
    [mins, onSizesChange]
  );

  // Build PanResponders for each handle between adjacent panels
  const buildHandle = useCallback(
    (leftPanelIdx) => {
      const responder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
          activeHandleRef.current = {
            leftIdx: leftPanelIdx,
            rightIdx: leftPanelIdx + 1,
            startMainPos: isHorizontal ? gesture.x0 : gesture.y0,
            startSizes: sizes.slice(),
          };
        },
        onPanResponderMove: (_, gesture) => {
          if (!activeHandleRef.current) return;
          const { leftIdx, rightIdx, startMainPos, startSizes } =
            activeHandleRef.current;
          const deltaPx =
            (isHorizontal ? gesture.moveX : gesture.moveY) - startMainPos;
          const main = Math.max(1, containerMainSize.current);
          const deltaFrac = deltaPx / main;
          const next = startSizes.slice();
          next[leftIdx] = startSizes[leftIdx] + deltaFrac;
          next[rightIdx] = startSizes[rightIdx] - deltaFrac;
          updateSizes(next);
        },
        onPanResponderRelease: () => {
          activeHandleRef.current = null;
        },
        onPanResponderTerminate: () => {
          activeHandleRef.current = null;
        },
      });
      return responder;
    },
    [isHorizontal, sizes, updateSizes]
  );

  // Render: iterate parts, enhancing handles with PanResponder and visuals
  let panelRenderIndex = -1;
  const childrenOut = parts.map((part, i) => {
    if (part.type === "panel") {
      panelRenderIndex += 1;
      const panelSize = sizes[panelRenderIndex] ?? 0;
      return (
        <View
          key={`panel-${i}`}
          style={[
            styles.panel,
            isHorizontal
              ? { width: `${panelSize * 100}%` }
              : { height: `${panelSize * 100}%` },
          ]}
        >
          {cloneWith(styleProp(part.element, styles.fill))}
        </View>
      );
    }

    // Handle: index applies to the previous panel
    const leftIdx = Math.max(0, panelRenderIndex);
    const res = buildHandle(leftIdx);
    return (
      <HandleView
        key={`handle-${i}`}
        panRes={res}
        isHorizontal={isHorizontal}
        thickness={handleThickness}
        style={handleStyle}
        activeStyle={handleActiveStyle}
        withHandle={part.element.props?.withHandle ?? withHandlesDefault}
      />
    );
  });

  return (
    <View
      onLayout={onLayout}
      style={[styles.group, isHorizontal ? styles.row : styles.col, style]}
    >
      {childrenOut}
    </View>
  );
}

export function ResizablePanel({ children, style }) {
  // Marker component (rendered by group)
  return <View style={style}>{children}</View>;
}

export function ResizableHandle(_props) {
  // Marker component (rendered by group)
  return <View />;
}

// --------------------------------------
// Internal handle view with PanResponder attached
// --------------------------------------
function HandleView({
  panRes,
  isHorizontal,
  thickness,
  style,
  activeStyle,
  withHandle,
}) {
  const [active, setActive] = useState(false);
  const { width } = useWindowDimensions();

  const gestureHandlers = useMemo(
    () => ({
      ...panRes.panHandlers,
      onStartShouldSetResponder: () => true,
      onResponderGrant: () => setActive(true),
      onResponderRelease: () => setActive(false),
      onResponderTerminate: () => setActive(false),
    }),
    [panRes]
  );

  const base = [
    styles.handle,
    isHorizontal
      ? { width: thickness, cursor: "col-resize" }
      : { height: thickness, cursor: "row-resize" },
    style,
    active && (activeStyle || styles.handleActive),
  ];

  return (
    <Pressable {...gestureHandlers} style={base}>
      {withHandle && (
        <View
          style={[
            styles.gripBox,
            isHorizontal ? {} : { transform: [{ rotate: "90deg" }] },
          ]}
        >
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      )}
    </Pressable>
  );
}

// --------------------------------------
// Helpers
// --------------------------------------
function normalize(arr) {
  const s = arr.reduce((a, b) => a + b, 0) || 1;
  return arr.map((v) => v / s);
}

function clampToMinsAndNormalize(arr, mins) {
  const n = arr.slice();
  for (let i = 0; i < n.length; i++) {
    n[i] = Math.max(mins[i] ?? 0, n[i]);
  }
  const s = n.reduce((a, b) => a + b, 0) || 1;
  return n.map((v) => v / s);
}

function styleProp(element, extraStyle) {
  if (!React.isValidElement(element)) return element;
  const prevStyle = element.props?.style;
  return React.cloneElement(element, { style: [prevStyle, extraStyle] });
}

function cloneWith(element) {
  return React.isValidElement(element) ? React.cloneElement(element) : element;
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  group: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flexDirection: "column",
  },
  panel: {
    overflow: "hidden",
  },
  fill: { flex: 1 },
  handle: {
    backgroundColor: "#e6e6e6",
    alignItems: "center",
    justifyContent: "center",
  },
  handleActive: {
    backgroundColor: "#d0d0d0",
  },
  gripBox: {
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cfcfcf",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    gap: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#9aa0a6",
  },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  return (
    <View
      style={{
        height: 240,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 8,
      }}
    >
      <ResizablePanelGroup
        direction="horizontal"
        initialSizes={[0.25, 0.5, 0.25]}
        minSizes={[0.1, 0.2, 0.1]}
        withHandlesDefault
      >
        <ResizablePanel>
          <View style={{ flex: 1, backgroundColor: "#fafafa" }} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <View style={{ flex: 1, backgroundColor: "#fff" }} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <View style={{ flex: 1, backgroundColor: "#fafafa" }} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </View>
  );
}
