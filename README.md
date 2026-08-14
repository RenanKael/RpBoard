# RPBoard

App Expo (React Native) para montar quadros de storyline/timeline de RPG num
canvas infinito: notas adesivas, eventos numa linha do tempo e conexões
manuais entre blocos, com pan e pinch-to-zoom por toque.

## Rodar no celular

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS).

## Estrutura

- `App.js` — dono do estado do board (notas, eventos, conexões) e persistência.
- `src/components/Board.js` — canvas: pan, pinch-to-zoom, grade de fundo, camada de conexões.
- `src/components/StickyNote.js` / `EventItem.js` — os blocos (notas livres e eventos na timeline).
- `src/components/ConnectHandle.js` / `ConnectOverlay.js` — o "+" de arrastar para ligar duas notas.
- `src/hooks/useHistory.js` — undo/redo.
- `src/storage.js` — persistência local (AsyncStorage).
