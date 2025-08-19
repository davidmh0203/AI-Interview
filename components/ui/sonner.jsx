import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --------------------------------------
// Toast Store (Context)
// --------------------------------------
const ToastCtx = createContext(null);

let externalAdd = null;
let externalRemove = null;

export function Toaster({
  position = "top", // 'top' | 'bottom'
  max = 4,
  duration = 3000,
  offset = 16,
  swipeToDismiss = false, // placeholder; RN gesture libs omitted
  containerStyle,
  toastStyle,
  textStyle,
  theme, // for API compatibility
}) {
  const [toasts, setToasts] = useState([]); // {id, title, description, type, duration}

  const add = useCallback(
    (t) => {
      const id = t.id ?? String(Date.now() + Math.random());
      setToasts((prev) => {
        const next = [{ ...t, id }, ...prev];
        return next.slice(0, max);
      });
      return id;
    },
    [max]
  );

  const remove = useCallback(
    (id) => setToasts((prev) => prev.filter((x) => x.id !== id)),
    []
  );

  useEffect(() => {
    externalAdd = add;
    externalRemove = remove;
    return () => {
      if (externalAdd === add) externalAdd = null;
      if (externalRemove === remove) externalRemove = null;
    };
  }, [add, remove]);

  const value = useMemo(
    () => ({ add, remove, duration, position }),
    [add, remove, duration, position]
  );

  const isTop = position === "top";

  return (
    <ToastCtx.Provider value={value}>
      <Modal transparent visible animationType="none">
        <View pointerEvents="box-none" style={[styles.portal]}>
          <View
            pointerEvents="box-none"
            style={[
              styles.stack,
              isTop ? { top: offset } : { bottom: offset },
              containerStyle,
            ]}
          >
            {toasts.map((t) => (
              <ToastItem
                key={t.id}
                toast={t}
                remove={remove}
                isTop={isTop}
                toastStyle={toastStyle}
                textStyle={textStyle}
                defaultDuration={duration}
              />
            ))}
          </View>
        </View>
      </Modal>
    </ToastCtx.Provider>
  );
}

// --------------------------------------
// Imperative API: toast(text, opts)
// --------------------------------------
export function toast(title, opts = {}) {
  const payload = typeof title === "object" ? title : { title };
  const data = { ...payload, ...opts };
  if (externalAdd) return externalAdd(data);
  console.warn("<Toaster/> is not mounted. Place it once near root.");
  return null;
}

toast.success = (title, opts = {}) =>
  toast(title, { ...opts, type: "success" });
toast.error = (title, opts = {}) => toast(title, { ...opts, type: "error" });
toast.info = (title, opts = {}) => toast(title, { ...opts, type: "info" });

toast.dismiss = (id) => externalRemove?.(id);

// --------------------------------------
// Individual Toast Component
// --------------------------------------
function ToastItem({
  toast,
  remove,
  isTop,
  toastStyle,
  textStyle,
  defaultDuration,
}) {
  const { width } = Dimensions.get("window");
  const anim = useRef(new Animated.Value(0)).current; // 0 -> 1

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 80,
    }).start();
    const ms = toast.duration ?? defaultDuration;
    if (ms !== Infinity) {
      const timer = setTimeout(() => close(), ms);
      return () => clearTimeout(timer);
    }
  }, [anim, toast.duration, defaultDuration]);

  const close = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => finished && remove(toast.id));
  }, [anim, remove, toast.id]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [isTop ? -24 : 24, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });
  const opacity = anim;

  const palette =
    toast.type === "success"
      ? { bg: "#ecfdf5", border: "#34d399", text: "#065f46" }
      : toast.type === "error"
      ? { bg: "#fef2f2", border: "#f87171", text: "#7f1d1d" }
      : { bg: "#f5f5f5", border: "#d4d4d4", text: "#111827" };

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: palette.bg, borderColor: palette.border },
        { transform: [{ translateY }, { scale }], opacity },
        toastStyle,
      ]}
    >
      <Pressable
        onPress={toast.onPress}
        onLongPress={close}
        style={{ flex: 1 }}
      >
        <View style={{ gap: 4 }}>
          {toast.title ? (
            <Text style={[styles.title, { color: palette.text }, textStyle]}>
              {toast.title}
            </Text>
          ) : null}
          {toast.description ? (
            <Text style={[styles.desc, { color: palette.text }, textStyle]}>
              {toast.description}
            </Text>
          ) : null}
          {toast.action ? (
            <Pressable onPress={toast.action.onPress} style={styles.actionBtn}>
              <Text style={styles.actionText}>
                {toast.action.label ?? "Action"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// --------------------------------------
// Styles
// --------------------------------------
const styles = StyleSheet.create({
  portal: {
    flex: 1,
  },
  stack: {
    position: "absolute",
    left: 12,
    right: 12,
    gap: 8,
    pointerEvents: "box-none",
  },
  toast: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 13 },
  actionBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#111827",
  },
  actionText: { color: "#fff", fontWeight: "600" },
});

// --------------------------------------
// Example (remove in production)
// --------------------------------------
export function Example() {
  return (
    <>
      <Toaster position="top" />
    </>
  );
}
