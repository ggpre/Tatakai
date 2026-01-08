import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Text } from 'react-native';
import { colors, borderRadius, fontSizes } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : null, style]}
          placeholderTextColor={colors.mutedForeground}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  iconContainer: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: fontSizes.md,
    color: colors.foreground,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.destructive,
    marginTop: 4,
  },
});
