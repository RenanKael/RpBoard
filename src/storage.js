import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rpboard-state-v1';

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
