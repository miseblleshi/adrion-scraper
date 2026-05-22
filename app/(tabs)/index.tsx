import { ScrollView, Text } from 'react-native';
import { useState } from 'react';
import useStyles from './_styles';
import AdrionScraper from '../backend/scraper';

export default function HomeScreen() {
	const [data, setData] = useState([]);
	const { container } = useStyles();
	
	return (
		<AdrionScraper
			keywords="dc compact"
			onData={results => setData(results)}
			onError={(err) => console.error('Scraper error:', err)}
		>
			<ScrollView style={container}>
				{data.map((item) => <Text key={item.id}>{item.title} — {item.price} ALL</Text>)}
			</ScrollView>
		</AdrionScraper>
	);
}