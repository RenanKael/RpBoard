import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import {
  cacheDirectory,
  copyAsync,
  makeDirectoryAsync,
  readAsStringAsync,
} from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const LAN_IP = '192.168.1.106';
const DEV_BOARD_URL = `http://${LAN_IP}:5173`;
const SAFE_EDGES = ['top', 'bottom', 'left', 'right'];
const htmlAsset = Asset.fromModule(require('./assets/rpboard-web/index.html'));

async function loadOfflineSource() {
  await htmlAsset.downloadAsync();
  const fileUri = htmlAsset.localUri ?? htmlAsset.uri;
  if (!fileUri) {
    throw new Error('HTML offline do board não encontrado.');
  }

  const cacheDir = `${cacheDirectory}rpboard/`;
  await makeDirectoryAsync(cacheDir, { intermediates: true });
  const cachedFile = `${cacheDir}index.html`;
  await copyAsync({ from: fileUri, to: cachedFile });

  const html = await readAsStringAsync(cachedFile);
  return {
    html,
    baseUrl: 'https://localhost/',
  };
}

export default function App() {
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBoard() {
      if (__DEV__) {
        if (!cancelled) {
          setSource({ uri: DEV_BOARD_URL });
        }
        return;
      }

      const offlineSource = await loadOfflineSource();
      if (!cancelled) {
        setSource(offlineSource);
      }
    }

    loadBoard().catch((loadError) => {
      console.error('Falha ao carregar o board', loadError);
      if (!cancelled) {
        setError(loadError?.message ?? 'Erro ao carregar o board.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={SAFE_EDGES}>
      <StatusBar style="dark" />
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Não foi possível abrir o board</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : source ? (
        <WebView
          source={source}
          originWhitelist={['*']}
          style={styles.webview}
          cacheEnabled={false}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          domStorageEnabled
          javaScriptEnabled
          mixedContentMode="always"
          setSupportMultipleWindows={false}
          bounces={false}
          overScrollMode="never"
          onError={(event) => {
            console.error('WebView error', event.nativeEvent);
            setError(
              __DEV__
                ? `Não conectou em ${DEV_BOARD_URL}. PC e celular na mesma Wi-Fi?`
                : 'Erro ao renderizar o board offline.',
            );
          }}
          onHttpError={(event) => {
            console.error('WebView HTTP error', event.nativeEvent);
            if (__DEV__) {
              setError(`Servidor web indisponível (${event.nativeEvent.statusCode}).`);
            }
          }}
        />
      ) : (
        <ActivityIndicator style={StyleSheet.absoluteFillObject} size="large" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111',
  },
  errorText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
