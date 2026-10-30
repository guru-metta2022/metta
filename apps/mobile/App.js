/**
 * Project Metta - Cross-Platform Mobile Client (Android & iOS)
 * Built on React Native & Expo, powered by @metta/common.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { PRECEPTS, DHAMMA_NODES, MettaClient } from '@metta/common';

const client = new MettaClient({ baseUrl: 'https://metta-gateway.internal' });

export default function App() {
  const [activeTab, setActiveTab] = useState('dialogue');
  const [inputText, setInputText] = useState('');
  const [statusText, setStatusText] = useState('Pristine clarity • Guest Mode');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070a08" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Project Metta</Text>
        <Text style={styles.badge}>Sati: High</Text>
      </View>

      {/* Navigation Bar */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dialogue' && styles.activeTab]}
          onPress={() => setActiveTab('dialogue')}
        >
          <Text style={[styles.tabText, activeTab === 'dialogue' && styles.activeTabText]}>Zen Dialogue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'precepts' && styles.activeTab]}
          onPress={() => setActiveTab('precepts')}
        >
          <Text style={[styles.tabText, activeTab === 'precepts' && styles.activeTabText]}>5 Precepts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'graph' && styles.activeTab]}
          onPress={() => setActiveTab('graph')}
        >
          <Text style={[styles.tabText, activeTab === 'graph' && styles.activeTabText]}>Dhamma Graph</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'dialogue' && (
          <View style={styles.dialogueBox}>
            <Text style={styles.statusBanner}>{statusText}</Text>
            <View style={styles.quoteCard}>
              <Text style={styles.quotePali}>"Sabbe sattā sukhi no vā khemino hontu"</Text>
              <Text style={styles.quoteEnglish}>May all beings be secure and at peace.</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Reflect or speak your inquiry..."
              placeholderTextColor="#64748b"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.buttonSubmit}>
              <Text style={styles.buttonText}>Submit Inquiry 🕊️</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'precepts' && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>The Five Sacred Precepts</Text>
            {PRECEPTS.map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardCategory}>{p.category} • Precept {p.id}</Text>
                <Text style={styles.cardPali}>{p.pali}</Text>
                <Text style={styles.cardEnglish}>{p.description}</Text>
                <Text style={styles.cardAnchor}>Anchor: {p.suttaAnchor}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'graph' && (
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Universal Dhamma Graph</Text>
            <Text style={styles.subheading}>Equanimity Destinations:</Text>
            {DHAMMA_NODES.equanimity.map((node) => (
              <View key={node.id} style={styles.cardGold}>
                <Text style={styles.cardGoldTitle}>{node.name}</Text>
                <Text style={styles.cardEnglish}>{node.description}</Text>
                <Text style={styles.cardPaliVerse}>"{node.paliVerse}"</Text>
                <Text style={styles.cardAnchor}>Sutta: {node.suttaAnchor}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070a08',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1c3227',
  },
  logo: {
    fontSize: 22,
  },
  title: {
    color: '#f0fdf4',
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1c3227',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#34d399',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#34d399',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  dialogueBox: {
    gap: 16,
  },
  statusBanner: {
    color: '#6ee7b7',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: '#0e1612',
    borderRadius: 8,
  },
  quoteCard: {
    padding: 16,
    backgroundColor: '#0e1612',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#34d399',
  },
  quotePali: {
    fontStyle: 'italic',
    color: '#f1f5f9',
    fontSize: 14,
    marginBottom: 4,
  },
  quoteEnglish: {
    color: '#94a3b8',
    fontSize: 12,
  },
  textInput: {
    backgroundColor: '#0e1612',
    borderColor: '#1c3227',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: '#f0fdf4',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonSubmit: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listSection: {
    gap: 12,
  },
  sectionTitle: {
    color: '#f0fdf4',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  subheading: {
    color: '#fde047',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0e1612',
    borderColor: '#1c3227',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  cardGold: {
    backgroundColor: '#12160e',
    borderColor: '#3a3219',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  cardGoldTitle: {
    color: '#fde047',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardCategory: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardPali: {
    fontStyle: 'italic',
    color: '#f1f5f9',
    fontSize: 13,
    marginBottom: 4,
  },
  cardEnglish: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  cardPaliVerse: {
    color: '#cbd5e1',
    fontStyle: 'italic',
    fontSize: 11,
    marginVertical: 4,
  },
  cardAnchor: {
    color: '#64748b',
    fontSize: 11,
  },
});
