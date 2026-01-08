import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8B4513',   // น้ำตาลเข้ม
        tabBarInactiveTintColor: '#A0522D', // น้ำตาลอ่อน
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFC0CB', // ชมพูเข้มขึ้น
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />

      {/* Add Product Tab */}
      <Tabs.Screen
        name="addproduct"
        options={{
          title: 'Add',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle" color={color} />,
        }}
      />

      {/* Edit Product Tab */}
      <Tabs.Screen
        name="editproduct"
        options={{
          title: 'Edit',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pencil.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
