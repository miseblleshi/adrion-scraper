import { ScrollView, Text, ActivityIndicator, Image, View } from 'react-native';
import useStyles from './_styles';
import useAdrionScraper from '../backend/scraper';

export default function HomeScreen() {
	const { data, status, error, ScraperWebView } = useAdrionScraper('dc compact');
	const { text, image, container, imageView } = useStyles();

	return (
		<>
			<ScraperWebView />
			{status === 'loading' && <ActivityIndicator />}
			{status === 'error'   && <Text style={{ color: 'red' }}>{error}</Text>}
			<ScrollView>
				<View style={container}>
					{data.map((item, i) => <View key={i} style={imageView}>
						<Image source={{ uri: item.image }} style={image} />
						<Text style={text}>{item.title}</Text>
					</View>)}
				</View>
			</ScrollView>
		</>
	);
}