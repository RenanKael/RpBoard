import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Sidebar from './src/components/Sidebar';
import Board from './src/components/Board';
import { useHistory } from './src/hooks/useHistory';
import { loadContent, loadPreferences, saveContent, savePreferences } from './src/storage';
import { uid } from './src/utils/uid';
import { MARKER_PRESETS } from './src/constants';
import Settings from './src/components/Settings';
import { getTranslations } from './src/i18n';
import { getTheme } from './src/theme';

const EMPTY_CONTENT = { freeNotes: [], events: [], connections: [] };

export default function App() {
  const [loading, setLoading] = useState(true);
  const { state, set, commit, snapshot, undo, redo, canUndo, canRedo } = useHistory(EMPTY_CONTENT);
  const [tool, setTool] = useState('select');
  const [selected, setSelected] = useState(null);
  const [language, setLanguage] = useState('pt-BR');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    Promise.all([loadContent(), loadPreferences()]).then(([loadedContent, preferences]) => {
      set(() => loadedContent);
      setLanguage(preferences.language);
      setDarkMode(preferences.darkMode);
      hasLoaded.current = true;
      setLoading(false);
    });
  }, [set]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    saveContent(state);
  }, [state]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    savePreferences({ language, darkMode });
  }, [language, darkMode]);

  const translations = getTranslations(language);
  const theme = getTheme(darkMode);

  const addFreeNote = useCallback(
    (pos) => {
      const id = uid();
      commit((prev) => ({
        ...prev,
        freeNotes: [...prev.freeNotes, { id, x: pos.x - 100, y: pos.y - 55, text: 'Nova nota', color: '#fff59d' }],
      }));
      setSelected({ type: 'freeNote', id });
    },
    [commit]
  );

  const addEvent = useCallback(
    (pos) => {
      const id = uid();
      const preset = MARKER_PRESETS[state.events.length % MARKER_PRESETS.length];
      const above = state.events.length % 2 === 0;
      commit((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            id,
            markerX: pos.x,
            shape: preset.shape,
            color: preset.color,
            dateLabel: 'Nova data',
            note: { x: pos.x - 100, y: above ? -170 : 70, text: 'Novo evento', color: '#fff59d' },
          },
        ],
      }));
      setSelected({ type: 'event', id });
    },
    [commit, state.events.length]
  );

  const moveFreeNote = useCallback(
    (id, x, y) => {
      set((prev) => ({ ...prev, freeNotes: prev.freeNotes.map((n) => (n.id === id ? { ...n, x, y } : n)) }));
    },
    [set]
  );

  const moveEventMarker = useCallback(
    (id, markerX) => {
      set((prev) => ({ ...prev, events: prev.events.map((e) => (e.id === id ? { ...e, markerX } : e)) }));
    },
    [set]
  );

  const moveEventNote = useCallback(
    (id, x, y) => {
      set((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, note: { ...e.note, x, y } } : e)),
      }));
    },
    [set]
  );

  const updateFreeNoteText = useCallback(
    (id, text) => {
      commit((prev) => ({ ...prev, freeNotes: prev.freeNotes.map((n) => (n.id === id ? { ...n, text } : n)) }));
    },
    [commit]
  );

  const updateFreeNoteColor = useCallback(
    (id, color) => {
      commit((prev) => ({ ...prev, freeNotes: prev.freeNotes.map((n) => (n.id === id ? { ...n, color } : n)) }));
    },
    [commit]
  );

  const deleteFreeNote = useCallback(
    (id) => {
      commit((prev) => ({
        ...prev,
        freeNotes: prev.freeNotes.filter((n) => n.id !== id),
        connections: prev.connections.filter(
          (c) => !(c.from.type === 'freeNote' && c.from.id === id) && !(c.to.type === 'freeNote' && c.to.id === id)
        ),
      }));
      setSelected(null);
    },
    [commit]
  );

  const updateEventText = useCallback(
    (id, text) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, note: { ...e.note, text } } : e)),
      }));
    },
    [commit]
  );

  const updateEventDateLabel = useCallback(
    (id, dateLabel) => {
      commit((prev) => ({ ...prev, events: prev.events.map((e) => (e.id === id ? { ...e, dateLabel } : e)) }));
    },
    [commit]
  );

  const updateEventNoteColor = useCallback(
    (id, color) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, note: { ...e.note, color } } : e)),
      }));
    },
    [commit]
  );

  const updateEventMarkerStyle = useCallback(
    (id, { shape, color }) => {
      commit((prev) => ({ ...prev, events: prev.events.map((e) => (e.id === id ? { ...e, shape, color } : e)) }));
    },
    [commit]
  );

  const deleteEvent = useCallback(
    (id) => {
      commit((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== id),
        connections: prev.connections.filter(
          (c) => !(c.from.type === 'event' && c.from.id === id) && !(c.to.type === 'event' && c.to.id === id)
        ),
      }));
      setSelected(null);
    },
    [commit]
  );

  const addConnection = useCallback(
    (from, to) => {
      if (from.type === to.type && from.id === to.id) return;
      commit((prev) => {
        const exists = prev.connections.some(
          (c) =>
            (c.from.type === from.type && c.from.id === from.id && c.to.type === to.type && c.to.id === to.id) ||
            (c.from.type === to.type && c.from.id === to.id && c.to.type === from.type && c.to.id === from.id)
        );
        if (exists) return prev;
        return { ...prev, connections: [...prev.connections, { id: uid(), from, to }] };
      });
    },
    [commit]
  );

  const deleteConnection = useCallback(
    (id) => {
      commit((prev) => ({ ...prev, connections: prev.connections.filter((c) => c.id !== id) }));
      setSelected(null);
    },
    [commit]
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.app}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Sidebar
        tool={tool}
        onToolChange={setTool}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        translations={translations}
        theme={theme}
        onSettings={() => setSettingsVisible(true)}
      />
      <Board
        content={state}
        tool={tool}
        setTool={setTool}
        selected={selected}
        onSelect={setSelected}
        onAddFreeNote={addFreeNote}
        onAddEvent={addEvent}
        onMoveFreeNote={moveFreeNote}
        onMoveEventMarker={moveEventMarker}
        onMoveEventNote={moveEventNote}
        onSnapshot={snapshot}
        onUpdateFreeNoteText={updateFreeNoteText}
        onUpdateFreeNoteColor={updateFreeNoteColor}
        onDeleteFreeNote={deleteFreeNote}
        onUpdateEventText={updateEventText}
        onUpdateEventDateLabel={updateEventDateLabel}
        onUpdateEventNoteColor={updateEventNoteColor}
        onUpdateEventMarkerStyle={updateEventMarkerStyle}
        onDeleteEvent={deleteEvent}
        onAddConnection={addConnection}
        onDeleteConnection={deleteConnection}
        translations={translations}
        theme={theme}
      />
      <Settings
        visible={settingsVisible}
        language={language}
        translations={translations}
        onLanguageChange={setLanguage}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        theme={theme}
        onClose={() => setSettingsVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    flexDirection: 'row',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
