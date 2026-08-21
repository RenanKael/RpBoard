import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Line, Circle } from 'react-native-svg';

function IconSelect({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 3l6.5 16 2-6.5L20 10.5z" />
    </Svg>
  );
}

function IconNote({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={4} y={4} width={16} height={16} rx={1.5} />
      <Path d="M8 9.5h8M8 13.5h5" />
    </Svg>
  );
}

function IconEvent({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Line x1={4} y1={12} x2={20} y2={12} />
      <Path d="M12 4.5l3 7.5-3 7.5-3-7.5z" />
    </Svg>
  );
}

function IconUndo({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 7H4V4" />
      <Path d="M4 7c2-2.5 5-4 8.5-4A9 9 0 1 1 4.5 17" />
    </Svg>
  );
}

function IconRedo({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 7h3V4" />
      <Path d="M20 7c-2-2.5-5-4-8.5-4A9 9 0 1 0 19.5 17" />
    </Svg>
  );
}

function IconSettings({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15 1.7 1.7 0 0 0 6.9 14H6.7v-2.4h.2a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 5.8V5.6h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.96 11h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15z" />
    </Svg>
  );
}

const TOOLS = [
  { id: 'select', Icon: IconSelect },
  { id: 'note', Icon: IconNote },
  { id: 'event', Icon: IconEvent },
];

const ACTIVE_COLOR = '#4262ff';
const IDLE_COLOR = '#45464c';
const DISABLED_COLOR = '#c7c7cc';

export default function Sidebar({ tool, onToolChange, onUndo, onRedo, canUndo, canRedo, translations, theme, onSettings }) {
  return (
    <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.border }]}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>RP</Text>
      </View>

      <View style={styles.tools}>
        {TOOLS.map(({ id, Icon }) => (
          <Pressable key={id} style={[styles.btn, tool === id && { backgroundColor: theme.activeBackground }]} onPress={() => onToolChange(id)} accessibilityLabel={translations[id === 'select' ? 'selectTool' : `${id}Tool`]}>
            <Icon color={tool === id ? theme.activeText : theme.icon} />
          </Pressable>
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.tools}>
        <Pressable style={styles.btn} onPress={onUndo} disabled={!canUndo}>
          <IconUndo color={canUndo ? theme.icon : theme.disabled} />
        </Pressable>
        <Pressable style={styles.btn} onPress={onRedo} disabled={!canRedo}>
          <IconRedo color={canRedo ? theme.icon : theme.disabled} />
        </Pressable>
        <Pressable style={styles.btn} onPress={onSettings} accessibilityLabel={translations.openSettings}>
          <IconSettings color={theme.icon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 64,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e4e7',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4262ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  tools: {
    gap: 6,
  },
  spacer: {
    flex: 1,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnActive: {
    backgroundColor: '#ebefff',
  },
});
