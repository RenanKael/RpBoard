export const LANGUAGES = [
  { id: 'pt-BR', label: 'Português (Brasil)' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

const TRANSLATIONS = {
  'pt-BR': {
    settings: 'Configurações',
    language: 'Idioma',
    appearance: 'Aparência',
    darkMode: 'Modo escuro',
    close: 'Fechar configurações',
    selected: 'Selecionado',
    boardHint: 'Use a barra lateral para adicionar uma nota ou um evento na linha do tempo.',
    selectTool: 'Selecionar',
    noteTool: 'Adicionar nota',
    eventTool: 'Adicionar evento',
    undo: 'Desfazer',
    redo: 'Refazer',
    openSettings: 'Abrir configurações',
  },
  en: {
    settings: 'Settings',
    language: 'Language',
    appearance: 'Appearance',
    darkMode: 'Dark mode',
    close: 'Close settings',
    selected: 'Selected',
    boardHint: 'Use the sidebar to add a note or an event to the timeline.',
    selectTool: 'Select',
    noteTool: 'Add note',
    eventTool: 'Add event',
    undo: 'Undo',
    redo: 'Redo',
    openSettings: 'Open settings',
  },
  es: {
    settings: 'Configuración',
    language: 'Idioma',
    appearance: 'Apariencia',
    darkMode: 'Modo oscuro',
    close: 'Cerrar configuración',
    selected: 'Seleccionado',
    boardHint: 'Usa la barra lateral para añadir una nota o un evento a la línea de tiempo.',
    selectTool: 'Seleccionar',
    noteTool: 'Añadir nota',
    eventTool: 'Añadir evento',
    undo: 'Deshacer',
    redo: 'Rehacer',
    openSettings: 'Abrir configuración',
  },
};

export function getTranslations(language) {
  return TRANSLATIONS[language] || TRANSLATIONS['pt-BR'];
}
