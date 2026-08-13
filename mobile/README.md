# RPBoard (Expo)

Wrapper Expo para rodar o RPBoard no celular via **Expo Go**. O app React/Vite
existente é compilado num único arquivo HTML autocontido (JS/CSS inline) e
carregado offline dentro de uma WebView — nenhum código do board foi
reescrito, é o mesmo app da raiz do repositório.

## Rodar no celular

Na raiz do repositório (não em `mobile/`):

```bash
npm install
npm run build:mobile   # gera mobile/assets/rpboard-web/index.html
```

Depois, dentro de `mobile/`:

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS).

## Atualizando o app depois de mudar o código do board

Sempre que o código em `src/` mudar, rode `npm run build:mobile` na raiz
novamente para atualizar o HTML embutido em `mobile/assets/rpboard-web/`.
