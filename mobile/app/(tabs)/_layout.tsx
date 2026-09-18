import React from "react";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import {
  IconHome,
  IconLayoutDashboard,
  IconListDetails,
  IconTools,
  IconSettings,
} from "@tabler/icons-react-native";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        },
        headerTitleStyle: {
          color: theme.colors.onSurface,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size }) => (
            <IconHome color={color} size={size ?? 24} stroke={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <IconLayoutDashboard color={color} size={size ?? 24} stroke={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="coa"
        options={{
          title: "Chart of Accounts",
          tabBarLabel: "COA",
          tabBarIcon: ({ color, size }) => (
            <IconListDetails color={color} size={size ?? 24} stroke={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarLabel: "Tools",
          tabBarIcon: ({ color, size }) => (
            <IconTools color={color} size={size ?? 24} stroke={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size }) => (
            <IconSettings color={color} size={size ?? 24} stroke={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}
