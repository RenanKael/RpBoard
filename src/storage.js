import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rpboard-state-v1';
<<<<<<< HEAD
const PREFERENCES_KEY = 'rpboard-preferences-v1';
=======
const TIMELINES_KEY = 'rpboard-timelines-v1';
>>>>>>> bdc627a (Feat Arthur:Adicionei a pagina de gerenciamento de timelines e pequena melhora visual)

const EMPTY_CONTENT = { freeNotes: [], events: [], connections: [] };

export async function loadContent() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.freeNotes) && Array.isArray(parsed.events)) {
        return { connections: [], ...parsed };
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar o board salvo', err);
  }
  return EMPTY_CONTENT;
}

export async function saveContent(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Não foi possível salvar o board', err);
  }
}

<<<<<<< HEAD
export async function loadPreferences() {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.language === 'string') return { language: parsed.language, darkMode: parsed.darkMode === true };
  } catch (err) {
    console.warn('Não foi possível carregar as preferências salvas', err);
  }
  return { language: 'pt-BR', darkMode: false };
}

export async function savePreferences(preferences) {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (err) {
    console.warn('Não foi possível salvar as preferências', err);
=======
export async function loadTimelines() {
  try {
    const raw = await AsyncStorage.getItem(TIMELINES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((timeline) => ({
          id: timeline.id ?? `timeline-${Date.now()}`,
          name: timeline.name ?? 'Timeline sem nome',
          content: timeline.content ?? EMPTY_CONTENT,
        }));
      }
    }
  } catch (err) {
    console.warn('Não foi possível carregar as timelines salvas', err);
  }

  const legacyBoard = await loadContent();
  return [
    { id: 'timeline-campanha-1', name: 'Timeline campanha 1', content: legacyBoard },
    { id: 'timeline-campanha-2', name: 'Timeline campanha 2', content: EMPTY_CONTENT },
  ];
}

export async function saveTimelines(timelines) {
  try {
    await AsyncStorage.setItem(TIMELINES_KEY, JSON.stringify(timelines));
  } catch (err) {
    console.warn('Não foi possível salvar as timelines', err);
>>>>>>> bdc627a (Feat Arthur:Adicionei a pagina de gerenciamento de timelines e pequena melhora visual)
  }
}
