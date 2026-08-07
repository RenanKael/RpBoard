import { useEffect, useRef, useState } from 'react';
import { NOTE_COLORS, NOTE_WIDTH } from '../constants';
import './StickyNote.css';

export default function StickyNote({
  x,
  y,
  text,
  color,
  selected,
  onPointerDownDrag,
  onTextCommit,
  onColorChange,
  onDelete,
  onMeasure,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const rootRef = useRef(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !onMeasure) return undefined;
    const notify = () => onMeasure(el.offsetHeight);
    notify();
    const ro = new ResizeObserver(notify);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMeasure]);

  function commit() {
    setEditing(false);
    if (draft !== text) onTextCommit(draft);
  }

  return (
    <div
      ref={rootRef}
      className={`sticky-note${selected ? ' selected' : ''}`}
      style={{ left: x, top: y, width: NOTE_WIDTH, background: color }}
      onPointerDown={(e) => {
        if (editing) {
          e.stopPropagation();
          return;
        }
        onPointerDownDrag(e);
      }}
      onDoubleClick={() => setEditing(true)}
    >
      {editing ? (
        <textarea
          autoFocus
          className="sticky-note-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(text);
              setEditing(false);
            }
          }}
        />
      ) : (
        <div className="sticky-note-text">{text}</div>
      )}

      {selected && !editing && (
        <div className="note-toolbar" onPointerDown={(e) => e.stopPropagation()}>
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-swatch"
              style={{ background: c }}
              onClick={() => onColorChange(c)}
              title="Cor da nota"
            />
          ))}
          <button type="button" className="delete-btn" onClick={onDelete} title="Excluir (Delete)">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
