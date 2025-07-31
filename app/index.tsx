import { Link } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Link href={"/check"} style={styles.buttonText}>Open Checkout By Default</Link>
      <Link href={"/enterTokenScreen"} style={styles.buttonText}>Open Checkout By Enter Token</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    marginBottom: 30,
  }
});


