import './Sidebar.css';

function IconSelect() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l6.5 16 2-6.5L20 10.5z" />
    </svg>
  );
}

function IconNote() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 9.5h8M8 13.5h5" />
    </svg>
  );
}

function IconEvent() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <path d="M12 4.5l3 7.5-3 7.5-3-7.5z" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7H4V4" />
      <path d="M4 7c2-2.5 5-4 8.5-4A9 9 0 1 1 4.5 17" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 7h3V4" />
      <path d="M20 7c-2-2.5-5-4-8.5-4A9 9 0 1 0 19.5 17" />
    </svg>
  );
}

const TOOLS = [
  { id: 'select', label: 'Selecionar / mover', Icon: IconSelect },
  { id: 'note', label: 'Adicionar nota', Icon: IconNote },
  { id: 'event', label: 'Adicionar evento na linha do tempo', Icon: IconEvent },
];

export default function Sidebar({ tool, onToolChange, onUndo, onRedo, canUndo, canRedo }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo" title="RPBoard">
        RP
      </div>

      <div className="sidebar-tools">
        {TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-btn${tool === id ? ' active' : ''}`}
            title={label}
            onClick={() => onToolChange(id)}
          >
            <Icon />
          </button>
        ))}
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-tools">
        <button type="button" className="sidebar-btn" title="Desfazer (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
          <IconUndo />
        </button>
        <button type="button" className="sidebar-btn" title="Refazer (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>
          <IconRedo />
        </button>
      </div>
    </aside>
  );
}
