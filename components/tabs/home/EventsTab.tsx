import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import JoinEventModal from "../../JoinEventModal";

interface Event {
  id: string;
  title: string;
  startDay: number;
  startDate: string;
  startTime: string;
  endDay: number;
  endDate: string;
  endTime: string;
  location: string;
  image: string;
  attendees: string;
  isJoined: boolean;
  eventType: "Public" | "Private";
}

export default function EventsTab() {
  const [eventSubtab, setEventSubtab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<"Private" | "Public">(
    "Private",
  );

  const events: Event[] = [
    {
      id: "1",
      title: "Sunset Campfire Social",
      startDay: 24,
      startDate: "Jan",
      startTime: "6:30 PM",
      endDay: 24,
      endDate: "Jan",
      endTime: "9:00 PM",
      location: "Bureau of Land Management, Moab",
      image: require("../../../assets/images/vanora.png"),
      attendees: "12+",
      isJoined: false,
      eventType: "Public",
    },
    {
      id: "2",
      title: "Desert Hiking Adventure",
      startDay: 26,
      startDate: "Jan",
      startTime: "8:00 AM",
      endDay: 26,
      endDate: "Jan",
      endTime: "12:00 PM",
      location: "Moab State Park, Moab",
      image: require("../../../assets/images/vanora.png"),
      attendees: "8+",
      isJoined: false,
      eventType: "Public",
    },
    {
      id: "3",
      title: "Nomad Meetup & Brunch",
      startDay: 28,
      startDate: "Jan",
      startTime: "10:00 AM",
      endDay: 29,
      endDate: "Jan",
      endTime: "2:00 PM",
      location: "The Spoke Alley, Moab",
      image: require("../../../assets/images/vanora.png"),
      attendees: "15+",
      isJoined: false,
      eventType: "Private",
    },
  ];

  const [eventList, setEventList] = useState(events);

  const filteredEvents =
    eventSubtab === "upcoming"
      ? eventList.filter((e) => !e.isJoined)
      : eventList.filter((e) => e.isJoined);

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleCreateEvent = () => {
    // TODO: Navigate to create event screen
    setShowCreateModal(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <TouchableOpacity
          style={styles.addEventButton}
          onPress={handleCreateEvent}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#ffffff" />
        </TouchableOpacity>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.eventSubtabs}>
            {["Upcoming", "Joined"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.eventSubtab,
                  eventSubtab === tab.toLowerCase() &&
                    styles.eventSubtabActive,
                ]}
                onPress={() => setEventSubtab(tab.toLowerCase())}
              >
                <Text
                  style={[
                    styles.eventSubtabText,
                    eventSubtab === tab.toLowerCase() &&
                      styles.eventSubtabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            {eventSubtab === "upcoming"
              ? "Upcoming Gatherings"
              : "My Gatherings"}
          </Text>
          {filteredEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.cardImageContainer}>
                <Image source={event.image} style={styles.eventImage} />
              </View>

              <View style={styles.eventInfo}>
                <View style={styles.titleAttendeeRow}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.attendeesBadge}>
                    <MaterialCommunityIcons
                      name="account-multiple"
                      size={12}
                      color="#1dd1a1"
                    />
                    <Text style={styles.eventAttendees}>{event.attendees}</Text>
                  </View>
                </View>

                <View style={styles.dateTimeColumn}>
                  <View style={styles.dateTimeBlock}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#666666"
                    />
                    <Text style={styles.dateTimeValue}>
                      {event.startDate} {event.startDay} - {event.startTime}
                    </Text>
                  </View>
                  <View style={styles.dateTimeBlock}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#666666"
                    />
                    <Text style={styles.dateTimeValue}>
                      {event.endDate} {event.endDay} - {event.endTime}
                    </Text>
                  </View>
                </View>

                <View style={styles.eventMeta}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={14}
                    color="#666666"
                  />
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewEvent(event)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                  <MaterialCommunityIcons
                    name="share-outline"
                    size={18}
                    color="#1dd1a1"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {selectedEvent && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalImageContainer}>
              <Image source={selectedEvent.image} style={styles.modalImage} />

              <View style={styles.eventTagContainer}>
                <Text style={styles.eventTag}>{selectedEvent.eventType}</Text>
              </View>

              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={handleCloseModal}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color="#ffffff"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalShareButton}>
                <MaterialCommunityIcons
                  name="share-outline"
                  size={20}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                </View>
              </View>

              <View style={styles.dateTimeCardsContainer}>
                <View style={styles.dateTimeCard}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#1dd1a1"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>Start</Text>
                    <Text style={styles.cardValue}>
                      {selectedEvent.startDate} {selectedEvent.startDay}
                    </Text>
                    <Text style={styles.cardValue}>
                      {selectedEvent.startTime}
                    </Text>
                  </View>
                </View>
                <View style={styles.dateTimeCard}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={16}
                    color="#1dd1a1"
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>End</Text>
                    <Text style={styles.cardValue}>
                      {selectedEvent.endDate} {selectedEvent.endDay}
                    </Text>
                    <Text style={styles.cardValue}>{selectedEvent.endTime}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.locationCard}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={18}
                  color="#1dd1a1"
                />
                <View style={styles.locationContent}>
                  <Text style={styles.locationTitle}>Location</Text>
                  <Text style={styles.locationAddress}>
                    {selectedEvent.location}
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.openMapsLink}>Open in Maps</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.sectionHeader}>About the Event</Text>
                <Text style={styles.aboutText}>
                  Join us for an amazing evening under the stars! We&apos;ll be
                  enjoying a campfire social with fellow nomads, sharing
                  stories, and making new friends. Bring your own chairs,
                  drinks, and snacks!
                </Text>
              </View>

              <View style={styles.whosGoingSection}>
                <View style={styles.whosGoingHeader}>
                  <Text style={styles.sectionHeader}>Who&apos;s Going</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAllLink}>See all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalAttendeesRow}>
                  <MaterialCommunityIcons
                    name="account-multiple"
                    size={14}
                    color="#999999"
                  />
                  <Text style={styles.modalAttendees}>
                    {selectedEvent.attendees} Nomads attending
                  </Text>
                </View>
                <View style={styles.avatarContainer}>
                  {[
                    require("../../../assets/images/vanora.png"),
                    require("../../../assets/images/vanora.png"),
                    require("../../../assets/images/vanora.png"),
                  ].map((avatar, index) => (
                    <Image
                      key={index}
                      source={avatar}
                      style={[
                        styles.avatarSmall,
                        { marginLeft: index > 0 ? -8 : 0 },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalJoinButton,
                  selectedEvent.isJoined && styles.modalJoinButtonActive,
                ]}
                onPress={() => {
                  setShowJoinModal(true);
                }}
              >
                <Text
                  style={[
                    styles.modalJoinButtonText,
                    selectedEvent.isJoined && styles.modalJoinButtonTextActive,
                  ]}
                >
                  {selectedEvent.isJoined ? "Joined" : "Join Event"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showCreateModal && (
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalContainer}>
            <View style={styles.createModalHeader}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#1a1a1a"
                />
              </TouchableOpacity>
              <Text style={styles.createModalTitle}>Create an Event</Text>
              <View style={{ width: 24 }} />
            </View>

            
            <ScrollView
              style={styles.createModalContent}
              showsVerticalScrollIndicator={false}
            >
            <View style={styles.imageUploadSection}>
              <Text style={styles.createModalLabel}>Event Image</Text>
              <View style={styles.imageUploadBox}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={40}
                  color="#a0aec0"
                />
                <Text style={styles.imageUploadText}>
                  Upload a cover photo
                </Text>
              </View>
            </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Event Title</Text>
                <View style={styles.formInput}>
                  <Text style={styles.formPlaceholder}>
                    e.g. Sunset Bonfire Meetup
                  </Text>
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>START DATE</Text>
                  <View style={styles.formInput}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text style={styles.formPlaceholder}>Oct 24, 2023</Text>
                  </View>
                </View>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>START TIME</Text>
                  <View style={styles.formInput}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text style={styles.formPlaceholder}>6:00 PM</Text>
                  </View>
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>END DATE</Text>
                  <View style={styles.formInput}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text style={styles.formPlaceholder}>Oct 24, 2023</Text>
                  </View>
                </View>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>END TIME</Text>
                  <View style={styles.formInput}>
                    <MaterialCommunityIcons
                      name="clock"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text style={styles.formPlaceholder}>9:00 PM</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location</Text>
                <View style={styles.formInput}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#1dd1a1"
                  />
                  <Text style={styles.formPlaceholder}>
                    Address or coordinates
                  </Text>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <View style={[styles.formInput, styles.textArea]}>
                  <Text style={styles.formPlaceholder}>
                    What should guests know?
                  </Text>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Event Type</Text>
                <Text style={styles.eventTypeSubtitle}>
                  Choose who can discover and request to join
                </Text>
                <View style={styles.eventTypeToggle}>
                  {["Private", "Public"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        eventTypeFilter === type && styles.eventTypeButtonActive,
                      ]}
                      onPress={() =>
                        setEventTypeFilter(type as "Private" | "Public")
                      }
                    >
                      <Text
                        style={[
                          styles.eventTypeButtonText,
                          eventTypeFilter === type &&
                            styles.eventTypeButtonTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {eventTypeFilter === "Private" && (
                <>
                  <View style={styles.privateEventInfo}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={20}
                      color="#1dd1a1"
                    />
                    <View style={styles.privateEventTextContainer}>
                      <Text style={styles.privateEventTitle}>
                        Private Event
                      </Text>
                      <Text style={styles.privateEventSubtitle}>
                        Invitation only
                      </Text>
                      <Text style={styles.privateEventDescription}>
                        Visible only to those you share the link with
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.inviteHeader}>
                      <Text style={styles.formLabel}>Invite Friends</Text>
                      <Text style={styles.inviteCount}>0 / 3 Selected</Text>
                    </View>
                    <View style={styles.searchInput}>
                      <MaterialCommunityIcons
                        name="magnify"
                        size={18}
                        color="#cbd5e0"
                      />
                      <Text style={styles.formPlaceholder}>
                        Search followers...
                      </Text>
                    </View>

                    <View style={styles.friendList}>
                      {[
                        { name: "Felix Nomad", selected: false },
                        { name: "Luna VanLife", selected: false },
                        { name: "Marcus Road", selected: false },
                      ].map((friend, index) => (
                        <TouchableOpacity key={index} style={styles.friendItem}>
                          <Image
                            source={require("../../../assets/images/vanora.png")}
                            style={styles.friendAvatar}
                          />
                          <Text style={styles.friendName}>{friend.name}</Text>
                          <View style={styles.checkbox} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.premiumCard}>
                    <MaterialCommunityIcons
                      name="star"
                      size={24}
                      color="#1dd1a1"
                    />
                    <View style={styles.premiumContent}>
                      <Text style={styles.premiumTitle}>Go Premium</Text>
                      <Text style={styles.premiumDescription}>
                        Go Premium to invite unlimited friends and host up to
                        100 participants
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.upgradeButton}>
                      <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {eventTypeFilter === "Public" && (
                <View style={styles.publicEventInfo}>
                  <MaterialCommunityIcons
                    name="question-mark"
                    size={20}
                    color="#cbd5e0"
                  />
                  <View style={styles.publicEventTextContainer}>
                    <Text style={styles.publicEventTitle}>Public Event</Text>
                    <Text style={styles.publicEventDescription}>
                      Anyone can see and request to join.
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ height: 30 }} />
            </ScrollView>

            <View style={styles.createModalButtons}>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {selectedEvent && showJoinModal && (
        <JoinEventModal
          visible={showJoinModal}
          event={selectedEvent}
          onBack={() => setShowJoinModal(false)}
          onClose={() => {
            setShowJoinModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentWrapper: {
    flex: 1,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addEventButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1dd1a1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  eventSubtabs: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 6,
  },
  eventSubtab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  eventSubtabActive: {
    backgroundColor: "#1dd1a1",
  },
  eventSubtabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999999",
  },
  eventSubtabTextActive: {
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardImageContainer: {
    position: "relative",
    height: 160,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  dateBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  dateMonth: {
    fontSize: 18,
    fontWeight: "300",
    color: "#10B981",
  },
  dateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1dd1a1",
  },
  dateSeparator: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1dd1a1",
  },
  eventInfo: {
    padding: 12,
  },
  titleAttendeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
  },
  attendeesBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8faf6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  eventLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
    flex: 1,
  },
  eventAttendees: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  dateTimeColumn: {
    marginVertical: 8,
    gap: 8,
  },
  dateTimeBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    alignItems: "center",
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#1dd1a1",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
    marginTop: 40,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  modalContainer: {
    flex: 0.9,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalImageContainer: {
    position: "relative",
    height: 250,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  eventTagContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  eventTag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1dd1a1",
    backgroundColor: "#e8faf6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  modalBackButton: {
    position: "absolute",
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalShareButton: {
    position: "absolute",
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  modalAttendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalAttendees: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999999",
  },
  dateTimeCardsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999999",
    marginHorizontal: 3,
  },
  cardValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    paddingLeft: 5,
  },
  locationCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  openMapsLink: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  aboutSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  aboutText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666666",
    lineHeight: 18,
  },
  whosGoingSection: {
    marginBottom: 16,
  },
  whosGoingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalJoinButton: {
    backgroundColor: "#1dd1a1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalJoinButtonActive: {
    backgroundColor: "#f0f0f0",
  },
  modalJoinButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  modalJoinButtonTextActive: {
    color: "#1dd1a1",
  },
  createModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 2000,
  },
  createModalContainer: {
    flex: 0.9,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  createModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  imageUploadSection: {
    paddingVertical: 16,
  },
  imageUploadBox: {
    backgroundColor: "#e8f4f1",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
    marginTop: 8,
  },
  imageUploadText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a0aec0",
    marginTop: 8,
  },
  createModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  createModalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 8,
  },
  formSection: {
    marginBottom: 16,
    flex: 1,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4a5568",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  formInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  formPlaceholder: {
    fontSize: 12,
    fontWeight: "400",
    color: "#cbd5e0",
    marginLeft: 8,
    flex: 1,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    alignItems: "flex-start",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  eventTypeSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#718096",
    marginBottom: 12,
  },
  eventTypeToggle: {
    flexDirection: "row",
    gap: 8,
  },
  eventTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#cbd5e0",
    alignItems: "center",
  },
  eventTypeButtonActive: {
    backgroundColor: "#1dd1a1",
    borderColor: "#1dd1a1",
  },
  eventTypeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#718096",
  },
  eventTypeButtonTextActive: {
    color: "#ffffff",
  },
  privateEventInfo: {
    flexDirection: "row",
    backgroundColor: "#e8faf6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  privateEventTextContainer: {
    flex: 1,
  },
  privateEventTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1dd1a1",
    marginBottom: 2,
  },
  privateEventSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 4,
  },
  privateEventDescription: {
    fontSize: 11,
    fontWeight: "400",
    color: "#718096",
  },
  publicEventInfo: {
    flexDirection: "row",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  publicEventTextContainer: {
    flex: 1,
  },
  publicEventTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#718096",
    marginBottom: 4,
  },
  publicEventDescription: {
    fontSize: 11,
    fontWeight: "400",
    color: "#a0aec0",
  },
  inviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inviteCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },
  friendList: {
    gap: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e0",
  },
  premiumCard: {
    flexDirection: "row",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 4,
  },
  premiumDescription: {
    fontSize: 11,
    fontWeight: "400",
    color: "#718096",
    lineHeight: 16,
  },
  upgradeButton: {
    backgroundColor: "#1dd1a1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upgradeButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  createModalButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#cbd5e0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#718096",
  },
  createButton: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1dd1a1",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
