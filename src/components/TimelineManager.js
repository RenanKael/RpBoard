import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function TimelineManager({ timelines, onSelect, onCreateTimeline }) {
  const totalNotes = timelines.reduce((sum, timeline) => sum + (timeline.content?.freeNotes?.length ?? 0), 0);
  const totalEvents = timelines.reduce((sum, timeline) => sum + (timeline.content?.events?.length ?? 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.topPanel}>
        <View style={styles.topHeader}>
          <Text style={styles.eyebrow}>Gerenciar</Text>
          <Pressable style={styles.createButton} onPress={onCreateTimeline}>
            <Text style={styles.createButtonText}>+ nova</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Timelines</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{timelines.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Notas</Text>
            <Text style={styles.statValue}>{totalNotes}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Eventos</Text>
            <Text style={styles.statValue}>{totalEvents}</Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {timelines.map((timeline, index) => {
          const noteCount = timeline.content?.freeNotes?.length ?? 0;
          const eventCount = timeline.content?.events?.length ?? 0;
          const accentColors = ['#d97706', '#0f766e', '#7c3aed', '#b45309', '#065f46', '#c2410c'];
          const accent = accentColors[index % accentColors.length];

          return (
            <Pressable key={timeline.id} style={styles.card} onPress={() => onSelect(timeline.id)}>
              <View style={[styles.cardBadge, { backgroundColor: accent }]} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{timeline.name}</Text>
                <Text style={styles.cardMeta}>
                  {noteCount} notas · {eventCount} eventos
                </Text>
              </View>
              <View style={styles.cardAction}>
                <Text style={styles.cardArrow}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f0ea',
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 30,
  },
  topPanel: {
    backgroundColor: '#fffaf7',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#f0dfd1',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  eyebrow: {
    color: '#8e7867',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  createButton: {
    backgroundColor: '#2b2825',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  createButtonText: {
    color: '#fffaf7',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    color: '#221c19',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9f2eb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f0e1d5',
  },
  statLabel: {
    color: '#806d63',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    color: '#241f1c',
    fontSize: 22,
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fffdfb',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#efe1d2',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardBadge: {
    width: 14,
    height: 14,
    borderRadius: 14,
    marginRight: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: '#241f1c',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMeta: {
    color: '#756a62',
    fontSize: 13,
    fontWeight: '500',
  },
  cardAction: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#f4eee8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cardArrow: {
    color: '#584d46',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
});
