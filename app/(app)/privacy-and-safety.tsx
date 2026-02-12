import {styles} from "@/features/app/privacy-and-safety/style";
import {useUserStore} from "@/store/userStore";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useEffect, useMemo, useState} from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const geoapifyKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

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

    const fetchGeocode = async () => {
      const locationQuery = profile?.current_location?.trim();
      if (!locationQuery || !geoapifyKey) {
        if (isMounted) {
          setMapCoords(null);
          setMapImageUrl(null);
        }
        return;
      }

      try {
        setIsGeocoding(true);
        const encoded = encodeURIComponent(locationQuery);
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encoded}&limit=1&format=json&apiKey=${geoapifyKey}`;
        const response = await fetch(url);
        const data = await response.json();
        const result = data?.results?.[0];
        if (!result) {
          if (isMounted) {
            setMapCoords(null);
            setMapImageUrl(null);
          }
          return;
        }

        const latitude = Number(result.lat);
        const longitude = Number(result.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          if (isMounted) {
            setMapCoords(null);
            setMapImageUrl(null);
          }
          return;
        }

        if (isMounted) {
          setMapCoords({latitude, longitude});
        }

        const zoom = locationPrecision === "exact" ? 13 : 9;
        const staticUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=800&height=360&center=lonlat:${longitude},${latitude}&zoom=${zoom}&marker=lonlat:${longitude},${latitude};color:%231dd1a1;size:medium&apiKey=${geoapifyKey}`;
        if (isMounted) {
          setMapImageUrl(staticUrl);
        }
      } catch (err) {
        console.error("Geoapify geocode error:", err);
        if (isMounted) {
          setMapCoords(null);
          setMapImageUrl(null);
        }
      } finally {
        if (isMounted) setIsGeocoding(false);
      }
    };

    fetchGeocode();

    return () => {
      isMounted = false;
    };
  }, [geoapifyKey, locationPrecision, profile?.current_location]);

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
            {mapImageUrl ? (
              <Image
                source={{uri: mapImageUrl}}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
              />
            ) : null}

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
                accessibilityState={{checked: locationPrecision === "exact"}}
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
              trackColor={{false: "#D1D5DB", true: "#5dac93ff"}}
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
              trackColor={{false: "#D1D5DB", true: "#5dac93ff"}}
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
              trackColor={{false: "#D1D5DB", true: "#5dac93ff"}}
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
