import { Modal, View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LANGUAGES } from '../i18n';

function IconClose({ color }) {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
      <Path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export default function Settings({ visible, language, translations, darkMode, onDarkModeChange, theme, onLanguageChange, onClose }) {
  // `Modal` renders outside the normal view tree (its own native window), so
  // it doesn't inherit the app-level SafeAreaView's padding — it needs its
  // own insets so the panel can't end up tight against a notch or the
  // system bars on devices where the centered layout leaves little margin.
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: 24 + insets.top,
            paddingBottom: 24 + insets.bottom,
            paddingLeft: 24 + insets.left,
            paddingRight: 24 + insets.right,
          },
        ]}
      >
        <View style={[styles.panel, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>{translations.settings}</Text>
              <Text style={[styles.subtitle, { color: theme.mutedText }]}>{translations.language}</Text>
            </View>
            <Pressable style={[styles.closeButton, { backgroundColor: theme.activeBackground }]} onPress={onClose} accessibilityLabel={translations.close}>
              <IconClose color={theme.icon} />
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.mutedText }]}>{translations.appearance}</Text>
          <View style={[styles.appearanceRow, { borderColor: theme.border }]}>
            <Text style={[styles.appearanceText, { color: theme.text }]}>{translations.darkMode}</Text>
            <Switch value={darkMode} onValueChange={onDarkModeChange} trackColor={{ false: '#c7c7cc', true: '#7287ff' }} thumbColor={darkMode ? '#4262ff' : '#f4f5f7'} />
          </View>

          <View style={styles.options}>
            {LANGUAGES.map((item) => {
              const isSelected = item.id === language;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.option, { borderColor: theme.border }, isSelected && { borderColor: '#4262ff', backgroundColor: theme.activeBackground }]}
                  onPress={() => onLanguageChange(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionText, { color: theme.icon }, isSelected && { color: theme.activeText }]}>{item.label}</Text>
                  {isSelected && <Text style={styles.check}>{'✓'}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 20, 28, 0.32)',
  },
  panel: {
    width: '100%',
    maxWidth: 380,
    padding: 22,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    color: '#202126',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#f3f3f5',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  appearanceRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 18,
  },
  appearanceText: {
    fontSize: 15,
  },
  options: {
    gap: 8,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 15,
  },
  check: {
    color: '#4262ff',
    fontSize: 18,
    fontWeight: '700',
  },
});
