import { useRef, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
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
    true;
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

export default function useAdrionScraper(keywords = 'dc compact') {
	const webViewRef = useRef(null);
	const [data, setData] = useState([]);
	const [status, setStatus] = useState('loading');
	const [error, setError] = useState(null);

	const handleLoad = useCallback(() => {
		webViewRef.current?.injectJavaScript(SESSION_EXTRACTOR_SCRIPT);
	}, []);

	const handleMessage = useCallback(async (event) => {
		try {
		const message = JSON.parse(event.nativeEvent.data);
		if (message.type === 'error') throw new Error('WebView JS error: ' + message.value);
		if (message.type === 'sessionid') {
			const results = await searchAdrion(keywords, message.value);
			setData(results);
			setStatus('done');
		}
		} catch (err) {
		setError(err.message);
		setStatus('error');
		}
	}, [keywords]);

	const handleWebViewError = useCallback((syntheticEvent) => {
		const { nativeEvent } = syntheticEvent;
		setError(`WebView failed to load: ${nativeEvent.description}`);
		setStatus('error');
	}, []);

	const ScraperWebView = useCallback(
		() => (
		<WebView
			ref={webViewRef}
			source={{ uri: 'https://www.adrionltd.com/' }}
			originWhitelist={['*']}
			onLoad={handleLoad}
			onMessage={handleMessage}
			onError={handleWebViewError}
			style={styles.hidden}
			javaScriptEnabled
		/>
		),
		[handleLoad, handleMessage, handleWebViewError],
	);

	return { data, status, error, ScraperWebView };
}

const styles = StyleSheet.create({
	hidden: {
		width: 0,
		height: 0,
		opacity: 0,
		position: 'absolute',
	}
});