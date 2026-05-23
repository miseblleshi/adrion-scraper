import { StyleSheet } from "react-native";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

function useStyles() {
	const colorScheme = useColorScheme();
	const colour = Colors[colorScheme ?? 'light'].tint;
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			width: '100%',
			justifyContent: "center",
			flexDirection: 'row',
    		flexWrap: 'wrap',
			gap: 20
		},
		h1: {
			fontSize: 24,
			fontWeight: 600,
			color: colour
		},
		text: {
			fontSize: 15,
			color: colour,
			padding: 10,
			textAlign: "center"
		},
		textInput: {
			fontSize: 20,
			color: colour,
			padding: 10,
			borderColor: colour,
			borderWidth: 2
		},
		image: {
			width: 150,
			aspectRatio: 323/500
		},
		imageView: {
			width: 150,
		}
	})

	return styles;
}

export default useStyles;