import { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Pressable, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Sidebar from './src/components/Sidebar';
import Board from './src/components/Board';
import TimelineManager from './src/components/TimelineManager';
import { useHistory } from './src/hooks/useHistory';
import { loadContent, loadPreferences, saveContent, savePreferences, loadTimelines, saveTimelines } from './src/storage';
import { uid } from './src/utils/uid';
import { MARKER_PRESETS, NOTE_WIDTH } from './src/constants';
import Settings from './src/components/Settings';
import { getTranslations, normalizeLanguage } from './src/i18n';
import { getTheme } from './src/theme';

const EMPTY_CONTENT = { freeNotes: [], events: [], connections: [] };

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('manager');
  const [timelines, setTimelines] = useState([]);
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);
  const { state, set, commit, snapshot, undo, redo, canUndo, canRedo } = useHistory(EMPTY_CONTENT);
  const [tool, setTool] = useState('select');
  const [selected, setSelected] = useState(null);
  const [language, setLanguage] = useState('pt-BR');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const hasLoaded = useRef(false);

  const { width } = useWindowDimensions();
  const compact = width < 360;
  const sidebarWidth = compact ? 56 : width < 420 ? 64 : 72;

  const activeTimeline = timelines.find((timeline) => timeline.id === selectedTimelineId) ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadInitialState() {
      const [loadedTimelines, preferences] = await Promise.all([loadTimelines(), loadPreferences()]);
      if (!isMounted) return;

      const fallbackTimeline = loadedTimelines[0] ?? {
        id: 'timeline-campanha-1',
        name: 'Timeline campanha 1',
        content: await loadContent(),
      };

      setTimelines(loadedTimelines.length ? loadedTimelines : [fallbackTimeline]);
      setSelectedTimelineId(fallbackTimeline.id);
      set(() => fallbackTimeline.content ?? EMPTY_CONTENT);
      setLanguage(normalizeLanguage(preferences.language));
      setDarkMode(preferences.darkMode);
      hasLoaded.current = true;
      setLoading(false);
    }

    loadInitialState();
    return () => {
      isMounted = false;
    };
  }, [set]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    saveContent(state);
  }, [state]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    savePreferences({ language, darkMode });
  }, [language, darkMode]);

  // Deliberately doesn't mirror `state` into the `timelines` array on every
  // change — during a drag this fires on every touch-move frame, and doing
  // a setState here as well as in useHistory's `set` was enough nested
  // React updates per frame to trip "Maximum update depth exceeded". The
  // per-timeline `content` in `timelines` is instead refreshed at discrete
  // checkpoints (see `goToManager`), and persisted straight to storage here
  // without touching React state.
  useEffect(() => {
    if (!hasLoaded.current || !selectedTimelineId || timelines.length === 0) return;
    saveTimelines(timelines.map((timeline) => (timeline.id === selectedTimelineId ? { ...timeline, content: state } : timeline)));
  }, [state]);

  useEffect(() => {
    if (!hasLoaded.current || timelines.length === 0) return;
    saveTimelines(timelines);
  }, [timelines]);

  const translations = getTranslations(language);
  const theme = getTheme(darkMode);

  const openTimeline = useCallback(
    (id) => {
      const timeline = timelines.find((item) => item.id === id);
      if (!timeline) return;

      setSelectedTimelineId(id);
      setSelected(null);
      setTool('select');
      set(() => timeline.content ?? EMPTY_CONTENT);
      setScreen('board');
    },
    [set, timelines]
  );

  const createTimeline = useCallback(() => {
    const nextNumber = timelines.length + 1;
    const id = uid();
    const newTimeline = {
      id,
      name: `Timeline campanha ${nextNumber}`,
      content: EMPTY_CONTENT,
    };

    setTimelines((prev) => [...prev, newTimeline]);
    setSelectedTimelineId(id);
    setSelected(null);
    setTool('select');
    set(() => EMPTY_CONTENT);
    setScreen('board');
  }, [set, timelines.length]);

  // Folds the board's live-edited `state` back into the open timeline's
  // `content` before leaving it — the checkpoint the manager's card stats
  // and the next `openTimeline` rely on being up to date.
  const goToManager = useCallback(() => {
    setTimelines((prev) =>
      prev.map((timeline) => (timeline.id === selectedTimelineId ? { ...timeline, content: state } : timeline))
    );
    setScreen('manager');
  }, [selectedTimelineId, state]);

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

  const addEventAfter = useCallback(
    (sourceId) => {
      const source = state.events.find((e) => e.id === sourceId);
      if (!source) return;
      const id = uid();
      const preset = MARKER_PRESETS[state.events.length % MARKER_PRESETS.length];
      const above = source.note.y < 0;
      const markerX = source.markerX + NOTE_WIDTH + 60;
      commit((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            id,
            markerX,
            shape: preset.shape,
            color: preset.color,
            dateLabel: 'Nova data',
            note: { x: markerX - 100, y: above ? -170 : 70, text: 'Novo evento', color: '#fff59d' },
          },
        ],
      }));
      setSelected({ type: 'event', id });
    },
    [commit, state.events]
  );

  const addFreeNoteAfter = useCallback(
    (sourceId) => {
      const source = state.freeNotes.find((n) => n.id === sourceId);
      if (!source) return;
      const id = uid();
      commit((prev) => ({
        ...prev,
        freeNotes: [...prev.freeNotes, { id, x: source.x + NOTE_WIDTH + 40, y: source.y, text: 'Nova nota', color: '#fff59d' }],
      }));
      setSelected({ type: 'freeNote', id });
    },
    [commit, state.freeNotes]
  );

  const createBlockFrom = useCallback(
    (ref) => {
      if (ref.type === 'event') addEventAfter(ref.id);
      else addFreeNoteAfter(ref.id);
    },
    [addEventAfter, addFreeNoteAfter]
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]} edges={['top', 'left', 'right']}>
      <GestureHandlerRootView style={styles.app}>
        <StatusBar style={darkMode ? 'light' : 'dark'} />

        {screen === 'manager' ? (
          <TimelineManager timelines={timelines} onSelect={openTimeline} onCreateTimeline={createTimeline} />
        ) : (
          <>
            <Sidebar
              tool={tool}
              compact={compact}
              sidebarWidth={sidebarWidth}
              onToolChange={setTool}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              translations={translations}
              theme={theme}
              onSettings={() => setSettingsVisible(true)}
            />

            <View style={styles.boardPane}>
              <View style={styles.boardHeader}>
                <Pressable
                  style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={goToManager}
                >
                  <Text style={[styles.backButtonText, { color: theme.text }]}>Gerenciar</Text>
                </Pressable>
                <Text style={[styles.boardTitle, { color: theme.text }]}>{activeTimeline?.name ?? 'Timeline'}</Text>
              </View>

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
                onCreateBlock={createBlockFrom}
                translations={translations}
                theme={theme}
              />
            </View>
          </>
        )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f7',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  boardPane: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  boardHeader: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: '#fffaf5',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ddd1',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backButtonText: {
    color: '#2d2724',
    fontWeight: '700',
    fontSize: 12,
  },
  boardTitle: {
    color: '#2d2724',
    fontWeight: '700',
    fontSize: 14,
    flexShrink: 1,
  },
});
