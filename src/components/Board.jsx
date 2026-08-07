import { useCallback, useEffect, useRef, useState } from 'react';
import StickyNote from './StickyNote';
import EventItem from './EventItem';
import { NOTE_WIDTH, DEFAULT_NOTE_HEIGHT } from '../constants';
import './Board.css';

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

export default function Board({
  content,
  tool,
  setTool,
  selected,
  onSelect,
  onAddFreeNote,
  onAddEvent,
  onMoveFreeNote,
  onMoveEventMarker,
  onMoveEventNote,
  onSnapshot,
  onUpdateFreeNoteText,
  onUpdateFreeNoteColor,
  onDeleteFreeNote,
  onUpdateEventText,
  onUpdateEventDateLabel,
  onUpdateEventNoteColor,
  onUpdateEventMarkerStyle,
  onDeleteEvent,
}) {
  const viewportRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [noteHeights, setNoteHeights] = useState({});
  const dragRef = useRef(null);
  const viewedOnce = useRef(false);

  useEffect(() => {
    if (viewedOnce.current) return;
    viewedOnce.current = true;
    const rect = viewportRef.current.getBoundingClientRect();
    setView((v) => ({ ...v, x: rect.width / 2, y: rect.height * 0.4 }));
  }, []);

  const screenToWorld = useCallback(
    (clientX, clientY) => {
      const rect = viewportRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - view.x) / view.scale,
        y: (clientY - rect.top - view.y) / view.scale,
      };
    },
    [view]
  );

  // The move/up handlers are attached to `window` for the lifetime of a
  // drag gesture. They must stay referentially stable, otherwise a state
  // update mid-drag (e.g. the history snapshot) would swap the listener
  // identity and an effect cleanup would tear it down before pointerup
  // fires. Callbacks that do change often are read through this ref.
  const callbacksRef = useRef(null);
  callbacksRef.current = { onSnapshot, onMoveFreeNote, onMoveEventMarker, onMoveEventNote };

  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === 'pan') {
      setView((v) => ({
        ...v,
        x: drag.startView.x + (e.clientX - drag.startClientX),
        y: drag.startView.y + (e.clientY - drag.startClientY),
      }));
      return;
    }
    const { onSnapshot, onMoveFreeNote, onMoveEventMarker, onMoveEventNote } = callbacksRef.current;
    if (!drag.snapshotted) {
      onSnapshot();
      drag.snapshotted = true;
    }
    const dx = (e.clientX - drag.startClientX) / drag.scale;
    const dy = (e.clientY - drag.startClientY) / drag.scale;
    if (drag.kind === 'freeNote') {
      onMoveFreeNote(drag.id, drag.startX + dx, drag.startY + dy);
    } else if (drag.kind === 'eventMarker') {
      onMoveEventMarker(drag.id, drag.startX + dx);
    } else if (drag.kind === 'eventNote') {
      onMoveEventNote(drag.id, drag.startX + dx, drag.startY + dy);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp]
  );

  const beginElementDrag = useCallback(
    (kind, id, startX, startY, clientX, clientY) => {
      dragRef.current = {
        kind,
        id,
        startX,
        startY,
        startClientX: clientX,
        startClientY: clientY,
        scale: view.scale,
        snapshotted: false,
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [view.scale, handlePointerMove, handlePointerUp]
  );

  // React attaches onWheel as a passive listener, so preventDefault()
  // inside it is silently ignored (and logs a warning). A native
  // listener with { passive: false } is required to actually stop the
  // page from scrolling while zooming the board.
  useEffect(() => {
    const el = viewportRef.current;
    function handleWheel(e) {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      setView((v) => {
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
        const worldX = (mouseX - v.x) / v.scale;
        const worldY = (mouseY - v.y) / v.scale;
        return {
          scale: newScale,
          x: mouseX - worldX * newScale,
          y: mouseY - worldY * newScale,
        };
      });
    }
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleBackgroundPointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      if (tool === 'note' || tool === 'event') {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        if (tool === 'note') onAddFreeNote(worldPos);
        else onAddEvent(worldPos);
        setTool('select');
        return;
      }
      onSelect(null);
      dragRef.current = {
        kind: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        startView: { x: view.x, y: view.y },
      };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [tool, screenToWorld, onAddFreeNote, onAddEvent, setTool, onSelect, view.x, view.y, handlePointerMove, handlePointerUp]
  );

  const zoomBy = useCallback((factor) => {
    const rect = viewportRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setView((v) => {
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
      const worldX = (cx - v.x) / v.scale;
      const worldY = (cy - v.y) / v.scale;
      return { scale: newScale, x: cx - worldX * newScale, y: cy - worldY * newScale };
    });
  }, []);

  const resetView = useCallback(() => {
    const rect = viewportRef.current.getBoundingClientRect();
    setView({ x: rect.width / 2, y: rect.height * 0.4, scale: 1 });
  }, []);

  const isEmpty = content.freeNotes.length === 0 && content.events.length === 0;

  return (
    <div
      className="board-viewport"
      ref={viewportRef}
      data-tool={tool}
      onPointerDown={handleBackgroundPointerDown}
      style={{
        backgroundPosition: `${view.x}px ${view.y}px`,
        backgroundSize: `${24 * view.scale}px ${24 * view.scale}px`,
      }}
    >
      <div className="board-world" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        <div className="timeline-line" />

        <svg className="connectors">
          {content.events.map((ev) => {
            const h = noteHeights[ev.id] ?? DEFAULT_NOTE_HEIGHT;
            const above = ev.note.y < 0;
            const targetY = above ? ev.note.y + h : ev.note.y;
            const targetX = ev.note.x + NOTE_WIDTH / 2;
            return (
              <line
                key={ev.id}
                x1={ev.markerX}
                y1={0}
                x2={targetX}
                y2={targetY}
                stroke="#9aa0a6"
                strokeWidth={1.5 / view.scale}
              />
            );
          })}
        </svg>

        {content.events.map((ev) => (
          <EventItem
            key={ev.id}
            event={ev}
            selected={selected?.type === 'event' && selected.id === ev.id}
            onMarkerPointerDown={(e) => {
              e.stopPropagation();
              onSelect({ type: 'event', id: ev.id });
              beginElementDrag('eventMarker', ev.id, ev.markerX, 0, e.clientX, e.clientY);
            }}
            onNotePointerDown={(e) => {
              e.stopPropagation();
              onSelect({ type: 'event', id: ev.id });
              beginElementDrag('eventNote', ev.id, ev.note.x, ev.note.y, e.clientX, e.clientY);
            }}
            onDateLabelCommit={(text) => onUpdateEventDateLabel(ev.id, text)}
            onTextCommit={(text) => onUpdateEventText(ev.id, text)}
            onColorChange={(color) => onUpdateEventNoteColor(ev.id, color)}
            onMarkerStyleChange={(style) => onUpdateEventMarkerStyle(ev.id, style)}
            onDelete={() => onDeleteEvent(ev.id)}
            onMeasure={(height) =>
              setNoteHeights((prev) => (prev[ev.id] === height ? prev : { ...prev, [ev.id]: height }))
            }
          />
        ))}

        {content.freeNotes.map((note) => (
          <StickyNote
            key={note.id}
            x={note.x}
            y={note.y}
            text={note.text}
            color={note.color}
            selected={selected?.type === 'freeNote' && selected.id === note.id}
            onPointerDownDrag={(e) => {
              e.stopPropagation();
              onSelect({ type: 'freeNote', id: note.id });
              beginElementDrag('freeNote', note.id, note.x, note.y, e.clientX, e.clientY);
            }}
            onTextCommit={(text) => onUpdateFreeNoteText(note.id, text)}
            onColorChange={(color) => onUpdateFreeNoteColor(note.id, color)}
            onDelete={() => onDeleteFreeNote(note.id)}
          />
        ))}
      </div>

      {isEmpty && (
        <div className="empty-hint">Use a barra lateral para adicionar uma nota ou um evento na linha do tempo.</div>
      )}

      <div className="zoom-control">
        <button type="button" onClick={() => zoomBy(1 / 1.2)} title="Diminuir zoom">
          −
        </button>
        <button type="button" className="zoom-reset" onClick={resetView} title="Restaurar vista">
          {Math.round(view.scale * 100)}%
        </button>
        <button type="button" onClick={() => zoomBy(1.2)} title="Aumentar zoom">
          +
        </button>
      </div>
    </div>
  );
}
