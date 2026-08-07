import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import { useHistory } from './hooks/useHistory';
import { MARKER_PRESETS } from './constants';
import './App.css';

const STORAGE_KEY = 'rpboard-state-v1';

function uid() {
  return crypto.randomUUID();
}

function loadInitialContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.freeNotes) && Array.isArray(parsed.events)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar o board salvo', err);
  }
  return { freeNotes: [], events: [] };
}

export default function App() {
  const { state, set, commit, snapshot, undo, redo, canUndo, canRedo } = useHistory(loadInitialContent);
  const [tool, setTool] = useState('select');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
      commit((prev) => ({ ...prev, freeNotes: prev.freeNotes.filter((n) => n.id !== id) }));
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
      commit((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));
      setSelected(null);
    },
    [commit]
  );

  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName;
      if (tag === 'TEXTAREA' || tag === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
        e.preventDefault();
        if (selected.type === 'freeNote') deleteFreeNote(selected.id);
        else if (selected.type === 'event') deleteEvent(selected.id);
        return;
      }
      if (e.key === 'Escape') {
        setSelected(null);
        setTool('select');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected, undo, redo, deleteFreeNote, deleteEvent]);

  return (
    <div className="app">
      <Sidebar tool={tool} onToolChange={setTool} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
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
      />
    </div>
  );
}
