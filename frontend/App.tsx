import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WS_URL = "ws://192.168.1.8:8000/ws";

type Lead = {
  id: string;
  created_time: string;
  email: string;
  full_name: string;
};

function formatCreatedTime(createdTime: string) {
  // Convert offsets like +0000 to +00:00 for consistent date parsing.
  const normalizedTime = createdTime.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const date = new Date(normalizedTime);

  if (Number.isNaN(date.getTime())) {
    return createdTime;
  }

  return date.toLocaleString();
}

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const lead: Lead = JSON.parse(event.data);

        if (
          !lead ||
          typeof lead.id !== "string" ||
          typeof lead.full_name !== "string" ||
          typeof lead.email !== "string" ||
          typeof lead.created_time !== "string"
        ) {
          console.warn("Received an invalid lead.");
          return;
        }

        setLeads((currentLeads) => [lead, ...currentLeads]);
      } catch {
        console.warn("Could not parse the WebSocket message.");
      }
    };

    socket.onerror = () => {
      setIsConnected(false);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList<Lead>
        data={leads}
        keyExtractor={(lead) => lead.id}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Real-Time Leads</Text>

            <View style={styles.infoRow}>
              <Text style={[styles.status, isConnected && styles.connected]}>
                {isConnected ? "Connected" : "Disconnected"}
              </Text>

              <Text style={styles.count}>
                {leads.length} {leads.length === 1 ? "lead" : "leads"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leads received yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.details}>
              Created: {formatCreatedTime(item.created_time)}
            </Text>
            <Text style={styles.details}>Lead ID: {item.id}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222222",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  status: {
    fontSize: 14,
    color: "#a33a32",
  },
  connected: {
    color: "#28733d",
  },
  count: {
    fontSize: 14,
    color: "#555555",
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  email: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333333",
    marginTop: 4,
  },
  details: {
    fontSize: 13,
    lineHeight: 20,
    color: "#555555",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 24,
  },
});