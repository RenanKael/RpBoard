import { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

// The RPBoard web app is pre-built into a single self-contained HTML file
// (see ../package.json "build:mobile") so it can run fully offline here,
// with no dev server or network connection required.
const htmlAsset = Asset.fromModule(require('./assets/rpboard-web/index.html'));

export default function App() {
  const [uri, setUri] = useState(null);

  useEffect(() => {
    htmlAsset.downloadAsync().then(() => setUri(htmlAsset.localUri ?? htmlAsset.uri));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {uri ? (
        <WebView
          source={{ uri }}
          originWhitelist={['*']}
          style={styles.webview}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          bounces={false}
          overScrollMode="never"
        />
      ) : (
        <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1, backgroundColor: '#fff' },
});
