import { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const SESSION_EXTRACTOR_SCRIPT = `
	(function() {
		try {
		const sessionId =
			localStorage.getItem('sessionid') ||
			sessionStorage.getItem('sessionid') ||
			window._sessionid ||
			'';
		window.ReactNativeWebView.postMessage(JSON.stringify({
			type: 'sessionid',
			value: sessionId
		}));
		} catch (e) {
		window.ReactNativeWebView.postMessage(JSON.stringify({
			type: 'error',
			value: e.message
		}));
		}
	})();
	true; // Required by react-native-webview
`;

async function searchAdrion(keywords, sessionId, categoryIds = 'wktjoucppw') {
	const ENDPOINT = 'https://api.adrionltd.com/1.0/web/items/search';
	const payload = JSON.stringify({
		keywords,
		types: '',
		brandids: '',
		publisherids: '',
		authorids: '',
		categoryids: categoryIds,
		tagids: '',
		colorids: '',
		agegroupids: '',
		serieids: '',
		materialids: '',
		formatids: '',
		languageids: '',
		ids: '',
		notrelids: '',
		minprice: 0,
		maxprice: 0,
		page: 0,
		stock: 0,
		orderby: 'relevance',
		ordertype: 'DESC',
		limit: 24,
		discounted: '',
		reloadfilters: 'no',
		refresh: Date.now(),
	});

	const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2, 18);
	const body =
		`--${boundary}\r\n` +
		`Content-Disposition: form-data; name="data"\r\n\r\n` +
		`${payload}\r\n` +
		`--${boundary}--`;

	const response = await fetch(ENDPOINT, {
		method: 'POST',
		headers: {
		'Content-Type': `multipart/form-data; boundary=${boundary}`,
		'sessionid': sessionId,
		'Origin': 'https://www.adrionltd.com',
		'Referer': 'https://www.adrionltd.com/',
		},
		body,
	});

	if (!response.ok) throw new Error(`HTTP ${response.status}`);

	const data = await response.json();

	return (data.rows ?? []).map((item) => ({
		id: item.id,
		title: item.name,
		isbn: item.isbn,
		price: item.price,
		inStock: item.quantity > 0,
		quantity: item.quantity,
		isNew: item.newitem,
		likes: item.likes,
		image: item.images?.primary ?? null,
		authors: (item.taxonomies?.author ?? []).map((a) => a.name),
		publisher: (item.taxonomies?.publisher ?? [])[0]?.name ?? null,
	}));
}

export default function AdrionScraper({ keywords = 'dc compact', onData, onError }) {
	const webViewRef = useRef(null);
	const [status, setStatus] = useState('loading');

	const handleLoad = () => webViewRef.current?.injectJavaScript(SESSION_EXTRACTOR_SCRIPT);;

	const handleMessage = async (event) => {
		try {
			const message = JSON.parse(event.nativeEvent.data);

			if (message.type === 'error') {
				throw new Error('WebView JS error: ' + message.value);
			}

			if (message.type === 'sessionid') {
				const sessionId = message.value;
				const results = await searchAdrion(keywords, sessionId);
				setStatus('done');
				onData?.(results);
			}

		} catch (err) {
			setStatus('error');
			onError?.(err.message);
		}
	};

	const handleWebViewError = (syntheticEvent) => {
		const { nativeEvent } = syntheticEvent;
		setStatus('error');
		onError?.(`WebView failed to load: ${nativeEvent.description}`);
	};

	return (
		<View>
			{status === 'loading' && <ActivityIndicator />}
			{status === 'error'   && <Text style={styles.error}>Scrape failed</Text>}
			<WebView
				ref={webViewRef}
				source={{ uri: 'https://www.adrionltd.com/' }}
				originWhitelist={['*']}
				onLoad={handleLoad}
				onMessage={handleMessage}
				onError={handleWebViewError}
				style={styles.hidden}
				javaScriptEnabled={true}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	hidden: {
		width: 0,
		height: 0,
		opacity: 0,
		position: 'absolute',
	},
	error: {
		color: 'red',
	}
});