import { useUserStore } from "@/store/userStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

type LocationPrecision = "approximate" | "exact";

export default function PrivacyAndSafetyScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const [locationPrecision, setLocationPrecision] =
    useState<LocationPrecision>("approximate");
  const [mapCoords, setMapCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [showOnMap, setShowOnMap] = useState(true);
  const [parkedMode, setParkedMode] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);

  const precisionDescription = useMemo(() => {
    if (locationPrecision === "exact") {
      return "Other nomads see your exact campsite location on the map.";
    }

    return "Other nomads see you within a 2-mile radius to keep your exact campsite private.";
  }, [locationPrecision]);

  const visibilityTagLabel = useMemo(() => {
    if (locationPrecision === "exact") {
      return "Public Exact Location";
    }

    return "Approximate Radius Active";
  }, [locationPrecision]);

  const mapLocationLabel = useMemo(() => {
    const location = profile?.current_location?.trim();
    return location && location.length > 0 ? location : "Location unavailable";
  }, [profile?.current_location]);

  const mapRegion = useMemo(() => {
    if (mapCoords) {
      const delta = locationPrecision === "exact" ? 0.06 : 0.2;
      return {
        latitude: mapCoords.latitude,
        longitude: mapCoords.longitude,
        latitudeDelta: delta,
        longitudeDelta: delta,
      };
    }

    return {
      latitude: 39.8283,
      longitude: -98.5795,
      latitudeDelta: 24,
      longitudeDelta: 24,
    };
  }, [mapCoords, locationPrecision]);

  useEffect(() => {
    let isMounted = true;
    const location = profile?.current_location?.trim();

    if (!location) {
      setMapCoords(null);
      return () => {
        isMounted = false;
      };
    }

    setIsGeocoding(true);
    Location.geocodeAsync(location)
      .then((results) => {
        if (!isMounted) return;
        const first = results[0];
        if (first) {
          setMapCoords({
            latitude: first.latitude,
            longitude: first.longitude,
          });
        } else {
          setMapCoords(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMapCoords(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsGeocoding(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.current_location]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacy &amp; Safety</Text>

        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>VISUAL FEEDBACK</Text>
        <Text style={styles.sectionTitle}>Map Preview</Text>

        <View style={styles.mapCard}>
          <View style={styles.mapPreview}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              region={mapRegion}
              pointerEvents="none"
            >
              {mapCoords ? (
                <>
                  <Marker coordinate={mapCoords} pinColor="#1dd1a1" />
                  {locationPrecision === "approximate" ? (
                    <Circle
                      center={mapCoords}
                      radius={3219}
                      strokeColor="rgba(29, 209, 161, 0.55)"
                      fillColor="rgba(29, 209, 161, 0.18)"
                    />
                  ) : null}
                </>
              ) : null}
            </MapView>

            {!mapCoords && !isGeocoding ? (
              <>
                <MaterialCommunityIcons name="map" size={22} color="#9CA3AF" />
                <Text style={styles.mapPreviewText}>Map preview</Text>
              </>
            ) : null}

            <View style={styles.mapLocationPill}>
              <MaterialCommunityIcons
                name="map-marker"
                size={12}
                color="#065F46"
              />
              <Text style={styles.mapLocationText}>{mapLocationLabel}</Text>
            </View>

            <View style={styles.mapBadge}>
              <MaterialCommunityIcons
                name={
                  locationPrecision === "exact"
                    ? "map-marker-check"
                    : "shield-check"
                }
                size={14}
                color="#D1FAE5"
              />
              <Text style={styles.mapBadgeText}>{visibilityTagLabel}</Text>
            </View>
          </View>
          <View style={styles.mapContent}>
            <Text style={styles.cardEyebrow}>How others see you</Text>
            <Text style={styles.cardTitle}>
              {locationPrecision === "exact"
                ? "Public Location"
                : "Approximate Location Active"}
            </Text>
            <Text style={styles.cardDescription}>{precisionDescription}</Text>

            <View
              style={styles.segmented}
              accessibilityRole="radiogroup"
              accessibilityLabel="Location precision"
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setLocationPrecision("approximate")}
                style={[
                  styles.segment,
                  locationPrecision === "approximate" && styles.segmentSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: locationPrecision === "approximate",
                }}
                accessibilityLabel="Approximate"
              >
                <Text
                  style={[
                    styles.segmentText,
                    locationPrecision === "approximate" &&
                      styles.segmentTextSelected,
                  ]}
                >
                  Approximate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setLocationPrecision("exact")}
                style={[
                  styles.segment,
                  locationPrecision === "exact" && styles.segmentSelected,
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: locationPrecision === "exact" }}
                accessibilityLabel="Exact"
              >
                <Text
                  style={[
                    styles.segmentText,
                    locationPrecision === "exact" && styles.segmentTextSelected,
                  ]}
                >
                  Exact
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>
          COMMUNITY VISIBILITY
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons name="eye" size={18} color="#93C5FD" />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>Show on Map</Text>
                <Text style={styles.rowSubtitle}>
                  Allow other van-lifers to see you
                </Text>
              </View>
            </View>
            <Switch
              value={showOnMap}
              onValueChange={setShowOnMap}
              trackColor={{ false: "#D1D5DB", true: "#5dac93ff" }}
              thumbColor={showOnMap ? "#ffffff" : "#F3F4F6"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons
                  name="weather-night"
                  size={18}
                  color="#C4B5FD"
                />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>Parked Mode</Text>
                <Text style={styles.rowSubtitle}>
                  Auto-hide location when stationary
                </Text>
              </View>
            </View>
            <Switch
              value={parkedMode}
              onValueChange={setParkedMode}
              trackColor={{ false: "#D1D5DB", true: "#5dac93ff" }}
              thumbColor={parkedMode ? "#ffffff" : "#F3F4F6"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons
                  name="ghost"
                  size={18}
                  color="#F59E0B"
                />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>Ghost Mode</Text>
                <Text style={styles.rowSubtitle}>Browse map anonymously</Text>
              </View>
            </View>
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{ false: "#D1D5DB", true: "#5dac93ff" }}
              thumbColor={ghostMode ? "#ffffff" : "#F3F4F6"}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>
          TRUSTED CONTACTS
        </Text>

        <View style={styles.card}>
          <View style={styles.contactRow}>
            <View style={styles.contactLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactName}>Mark Thompson</Text>
                <Text style={styles.contactSubtitle}>
                  Always sees exact location
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Trusted contact settings"
              style={styles.contactAction}
              activeOpacity={0.8}
              onPress={() => {
                // Intentionally left blank (design-only)
              }}
            >
              <MaterialCommunityIcons name="cog" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addTrustedButton}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Add trusted friend"
            onPress={() => {
              // Intentionally left blank (design-only)
            }}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#2e7d64"
              style={styles.addTrustedButtonIcon}
            />
            <Text style={styles.addTrustedButtonText}>Add Trusted Friend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <MaterialCommunityIcons name="shield" size={18} color="#D1FAE5" />
          </View>
          <Text style={styles.tipText}>
            Safety Tip: When boondocking in remote areas, your exact location
            stays protected using Approximate Location or Parked Mode.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerIconSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    marginTop: 12,
    fontSize: 11,
    letterSpacing: 1.2,
    color: "#2e7d64",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  sectionLabelSpacing: {
    marginTop: 24,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  mapCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapPreview: {
    height: 200,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  mapPreviewText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  mapLocationPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    maxWidth: 160,
  },
  mapLocationText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
  },
  mapBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#2e7d64",
    borderRadius: 999,
    borderWidth: 0,
    shadowColor: "#2e7d64",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  card: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardEyebrow: {
    fontSize: 12,
    color: "#2e7d64",
    fontWeight: "800",
  },
  cardTitle: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  segmented: {
    marginTop: 14,
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 0,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: {
    backgroundColor: "#2e7d64",
    shadowColor: "#2e7d64",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  segmentTextSelected: {
    color: "#ffffff",
  },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  rowSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf9",
    borderWidth: 2,
    borderColor: "#2e7d64",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#2e7d64",
    fontWeight: "700",
    fontSize: 16,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  contactSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#2e7d64",
    fontWeight: "600",
  },
  contactAction: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addTrustedButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#f0fdf9",
    borderWidth: 1.5,
    borderColor: "#2e7d64",
    borderStyle: "dashed",
  },
  addTrustedButtonIcon: {
    marginRight: 8,
  },
  addTrustedButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d64",
  },
  tipCard: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    backgroundColor: "#f0fdf9",
    borderWidth: 1,
    borderColor: "#9ed6c3",
    padding: 14,
    shadowColor: "#2e7d64",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: "#2e7d64",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    color: "#065F46",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  mapContent: {
    marginTop: 16,
  },
});
