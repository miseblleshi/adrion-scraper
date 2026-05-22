import { StyleSheet } from "react-native";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

function useStyles() {
	const colorScheme = useColorScheme();
	const styles = StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 20
		},
		h1: {
			fontSize: 24,
			fontWeight: 600,
			color: Colors[colorScheme ?? 'light'].tint
		},
		text: {
			fontSize: 20,
			color: Colors[colorScheme ?? 'light'].tint,
			padding: 10,
			textAlign: "center"
		},
		textInput: {
			fontSize: 20,
			color: Colors[colorScheme ?? 'light'].tint,
			padding: 10,
			borderColor: Colors[colorScheme ?? 'light'].tint,
			borderWidth: 2
		}
	})

	return styles;
}

export default useStyles;