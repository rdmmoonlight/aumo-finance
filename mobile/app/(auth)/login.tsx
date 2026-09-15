import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { Stack, router } from 'expo-router';

import { useLogin } from '../../src/api/auth';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const loginMutation = useLogin();

  const errorMessage =
    (loginMutation.error as any)?.response?.data?.message ||
    (loginMutation.isError ? 'Gagal terhubung ke server.' : null);

  const handleLogin = () => {
    if (!email.trim() || !password) return;
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          // Tes berhasil login -> langsung ke halaman Periods
          router.replace('/periods');
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Login' }} />
      <View style={styles.container}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, marginBottom: 4 }}>
          Aumo Finance
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
          Masuk untuk melanjutkan
        </Text>

        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          right={<TextInput.Icon icon={secure ? 'eye' : 'eye-off'} onPress={() => setSecure(!secure)} />}
          style={styles.input}
        />

        {errorMessage && (
          <HelperText type="error" visible>
            {errorMessage}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending || !email.trim() || !password}
          style={styles.button}
        >
          Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
});
