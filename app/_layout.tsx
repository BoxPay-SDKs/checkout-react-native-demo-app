import { Stack } from 'expo-router'

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='check' options={{ headerShown: false }} />
      <Stack.Screen name='enterTokenScreen' options={{ headerShown: false }} />
      <Stack.Screen name='sdk' options={{ headerShown: false }} />
    </Stack>
  )
}

export default _layout
