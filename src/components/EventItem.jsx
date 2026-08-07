import { useEffect, useState } from 'react';
import StickyNote from './StickyNote';
import MarkerShape from './MarkerShape';
import { MARKER_SHAPES, MARKER_COLORS } from '../constants';
import './EventItem.css';

export default function EventItem({
  event,
  selected,
  onMarkerPointerDown,
  onNotePointerDown,
  onDateLabelCommit,
  onTextCommit,
  onColorChange,
  onMarkerStyleChange,
  onDelete,
  onMeasure,
}) {
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(event.dateLabel);

  useEffect(() => {
    setDateDraft(event.dateLabel);
  }, [event.dateLabel]);

  function commitDate() {
    setEditingDate(false);
    if (dateDraft !== event.dateLabel) onDateLabelCommit(dateDraft);
  }

  return (
    <>
      <div
        className={`event-marker${selected ? ' selected' : ''}`}
        style={{ left: event.markerX, top: 0 }}
        onPointerDown={onMarkerPointerDown}
      >
        <span className="marker-icon">
          <MarkerShape shape={event.shape} color={event.color} />
        </span>
        {editingDate ? (
          <input
            autoFocus
            className="date-input"
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onBlur={commitDate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') {
                setDateDraft(event.dateLabel);
                setEditingDate(false);
              }
            }}
          />
        ) : (
          <span
            className="date-label"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingDate(true);
            }}
          >
            {event.dateLabel}
          </span>
        )}

        {selected && !editingDate && (
          <div className="marker-toolbar" onPointerDown={(e) => e.stopPropagation()}>
            {MARKER_SHAPES.map((shape) => (
              <button
                key={shape}
                type="button"
                className={`shape-btn${event.shape === shape ? ' active' : ''}`}
                onClick={() => onMarkerStyleChange({ shape, color: event.color })}
                title="Formato do marcador"
              >
                <MarkerShape shape={shape} color={event.color} size={14} />
              </button>
            ))}
            <span className="toolbar-divider" />
            {MARKER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="color-swatch"
                style={{ background: c }}
                onClick={() => onMarkerStyleChange({ shape: event.shape, color: c })}
                title="Cor do marcador"
              />
            ))}
          </div>
        )}
      </div>

      <StickyNote
        x={event.note.x}
        y={event.note.y}
        text={event.note.text}
        color={event.note.color}
        selected={selected}
        onPointerDownDrag={onNotePointerDown}
        onTextCommit={onTextCommit}
        onColorChange={onColorChange}
        onDelete={onDelete}
        onMeasure={onMeasure}
      />
    </>
  );
}
