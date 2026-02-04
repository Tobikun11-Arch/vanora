import {MaterialCommunityIcons} from '@expo/vector-icons';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {useRouter} from 'expo-router';
import JoinEventModal from '../../JoinEventModal';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {supabase} from '../../../services/supabase';
import {useUserStore} from '../../../store/userStore';
import LocationSearchModal from '../../newpost/LocationSearchModal';
import {showToast} from '../../Toast';
import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import {useAppMutation} from '@/hooks/useAppMutation';
import {useQuery, useQueryClient} from '@tanstack/react-query';

interface Event {
  id: string;
  title: string;
  startAt?: Date | null;
  endAt?: Date | null;
  startDay: number;
  startDate: string;
  startTime: string;
  endDay: number;
  endDate: string;
  endTime: string;
  location: string;
  image: any;
  attendees: string;
  isJoined: boolean;
  eventType: 'Public' | 'Private';
  description?: string | null;
  hostId?: string;
  hostName?: string;
  hostAvatar?: string | null;
  coverImageUrl?: string | null;
}

type EventsQueryData = {
  eventList: Event[];
  joinedEvents: Event[];
};

type CreateEventPayload = {
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  visibility: 'private' | 'public';
  inviteeIds: string[];
};

type CreateEventResult = {
  eventRow: any;
  userId: string;
};

const CACHE_TTL_MS = 60 * 1000;

export default function EventsTab() {
  const [eventSubtab, setEventSubtab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<'Private' | 'Public'>(
    'Private'
  );
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(
    undefined
  );
  const profile = useUserStore(state => state.profile);
  const [eventImageUri, setEventImageUri] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [startDateLabel, setStartDateLabel] = useState('');
  const [startTimeLabel, setStartTimeLabel] = useState('');
  const [endDateLabel, setEndDateLabel] = useState('');
  const [endTimeLabel, setEndTimeLabel] = useState('');
  const [startDateValue, setStartDateValue] = useState<Date | null>(null);
  const [endDateValue, setEndDateValue] = useState<Date | null>(null);
  const [startTimeValue, setStartTimeValue] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);
  const [endTimeValue, setEndTimeValue] = useState<{
    hours: number;
    minutes: number;
  } | null>(null);
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const descriptionInputRef = React.useRef<TextInput>(null);
  const [inviteSearch, setInviteSearch] = useState('');
  const [followers, setFollowers] = useState<
    {id: string; name: string; avatar: string | null}[]
  >([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersError, setFollowersError] = useState<string | null>(null);
  const [selectedInvitees, setSelectedInvitees] = useState<Set<string>>(
    new Set()
  );
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<
    'startDate' | 'startTime' | 'endDate' | 'endTime' | null
  >(null);
  const {isSubscribed} = useRevenueCatSubscription();

  const dateOptions = useMemo(() => {
    const options: {label: string; value: Date}[] = [];
    const now = new Date();
    for (let i = 0; i < 365; i += 1) {
      const next = new Date(now);
      next.setDate(now.getDate() + i);
      options.push({
        label: next.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        value: next
      });
    }
    return options;
  }, []);

  const timeOptions = useMemo(() => {
    const options: {label: string; hours: number; minutes: number}[] = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        options.push({
          label: date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          }),
          hours: hour,
          minutes: minute
        });
      }
    }
    return options;
  }, []);

  useEffect(() => {
    const init = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };

    init();
  }, []);

  const openPicker = (
    type: 'startDate' | 'startTime' | 'endDate' | 'endTime'
  ) => {
    setPickerType(type);
    setPickerVisible(true);
  };

  const handleSelectPickerValue = (
    value:
      | {label: string; value: Date}
      | {label: string; hours: number; minutes: number}
  ) => {
    if (pickerType === 'startDate' && 'value' in value) {
      setStartDateLabel(value.label);
      setStartDateValue(value.value);
    } else if (pickerType === 'startTime' && 'hours' in value) {
      setStartTimeLabel(value.label);
      setStartTimeValue({hours: value.hours, minutes: value.minutes});
    } else if (pickerType === 'endDate' && 'value' in value) {
      setEndDateLabel(value.label);
      setEndDateValue(value.value);
    } else if (pickerType === 'endTime' && 'hours' in value) {
      setEndTimeLabel(value.label);
      setEndTimeValue({hours: value.hours, minutes: value.minutes});
    }
    setPickerVisible(false);
  };

  const handleSelectEventLocation = (location: string) => {
    setEventLocation(location);
  };

  const clearEventLocation = () => {
    setEventLocation('');
  };

  const toggleInvitee = (inviteeId: string) => {
    setSelectedInvitees(prev => {
      const next = new Set(prev);
      if (next.has(inviteeId)) {
        next.delete(inviteeId);
      } else {
        next.add(inviteeId);
      }
      return next;
    });
  };

  const resolveCoverImageUrl = (value: string | null | undefined) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    const {data} = supabase.storage.from('profiles').getPublicUrl(value);
    return data?.publicUrl ?? null;
  };

  const mapEventRow = (row: any, isJoined: boolean): Event => {
    const start = row.start_at ? new Date(row.start_at) : null;
    const end = row.end_at ? new Date(row.end_at) : null;

    const startDate = start
      ? start.toLocaleDateString('en-US', {month: 'short'})
      : '';
    const startDay = start ? start.getDate() : 0;
    const startTime = start
      ? start.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        })
      : '';

    const endDate = end ? end.toLocaleDateString('en-US', {month: 'short'}) : '';
    const endDay = end ? end.getDate() : 0;
    const endTime = end
      ? end.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        })
      : '';

    const participantCount =
      row.event_participants?.[0]?.count ?? row.event_participants?.count ?? 0;

    const coverUrl = resolveCoverImageUrl(row.cover_image_url);
    const hostProfile =
      row.host_profile ?? row.host ?? row.profiles ?? row.organizer ?? null;
    const fallbackHostName =
      row.host_id === profile?.id
        ? profile?.display_name || profile?.username
        : null;
    const fallbackHostAvatar =
      row.host_id === profile?.id ? profile?.profile_picture_url : null;

    return {
      id: row.id,
      title: row.title ?? 'Untitled Event',
      startAt: start,
      endAt: end,
      startDay,
      startDate,
      startTime,
      endDay,
      endDate,
      endTime,
      location: row.location ?? 'TBA',
      image: coverUrl
        ? {uri: coverUrl}
        : require('../../../assets/images/vanora.png'),
      attendees: `${participantCount}+`,
      isJoined,
      eventType: row.visibility === 'private' ? 'Private' : 'Public',
      description: row.description,
      hostId: row.host_id,
      hostName:
        hostProfile?.display_name ||
        hostProfile?.username ||
        fallbackHostName ||
        'Organizer',
      hostAvatar: hostProfile?.profile_picture_url ?? fallbackHostAvatar ?? null,
      coverImageUrl: coverUrl
    };
  };


  const fetchEvents = async (userId: string | null): Promise<EventsQueryData> => {
    const {data: visibleEvents, error: visibleError} = await supabase
      .from('events')
      .select(
        'id, title, description, location, start_at, end_at, cover_image_url, visibility, host_id, host_profile:profiles!events_host_id_fkey ( id, username, display_name, profile_picture_url ), event_participants(count)'
      )
      .order('start_at', {ascending: true});

    if (visibleError) {
      throw visibleError;
    }

    const joinedIds = new Set<string>();
    const invitedIds = new Set<string>();
    const joinedEventRows: Event[] = [];

    if (userId) {
      const {data: joinedRows, error: joinedError} = await supabase
        .from('event_participants')
        .select(
          'event_id, events ( id, title, description, location, start_at, end_at, cover_image_url, visibility, host_id, host_profile:profiles!events_host_id_fkey ( id, username, display_name, profile_picture_url ), event_participants(count) )'
        )
        .eq('user_id', userId);

      if (joinedError) {
        throw joinedError;
      }

      (joinedRows ?? []).forEach(row => {
        if ((row as any).event_id) joinedIds.add((row as any).event_id);
        const event = (row as any).events;
        if (event) {
          joinedEventRows.push(mapEventRow(event, true));
        }
      });

      const {data: inviteRows, error: inviteError} = await supabase
        .from('event_invites')
        .select('event_id')
        .eq('invitee_id', userId);

      if (inviteError) {
        throw inviteError;
      }

      (inviteRows ?? []).forEach(row => {
        if ((row as any).event_id) invitedIds.add((row as any).event_id);
      });
    }

    const mappedVisible = (visibleEvents ?? [])
      .filter(row => {
        if (row.visibility !== 'private') return true;
        if (!userId) return false;
        if (row.host_id === userId) return true;
        if (joinedIds.has(row.id)) return true;
        return invitedIds.has(row.id);
      })
      .map(row => mapEventRow(row, joinedIds.has(row.id)));

    return {
      eventList: mappedVisible,
      joinedEvents: joinedEventRows
    };
  };

  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery({
    queryKey: ['events', currentUserId],
    queryFn: () => fetchEvents(currentUserId ?? null),
    enabled: currentUserId !== undefined,
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS * 5
  });

  const eventList = eventsData?.eventList ?? [];
  const joinedEvents = eventsData?.joinedEvents ?? [];
  const eventsErrorMessage = eventsError
    ? 'Unable to load events right now.'
    : null;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const isEventCurrentOrFuture = (event: Event) => {
    const compareDate = event.endAt ?? event.startAt;
    if (!compareDate) return true;
    return compareDate >= todayStart;
  };

  const filteredEvents = (
    eventSubtab === 'upcoming' ? eventList : joinedEvents
  ).filter(isEventCurrentOrFuture);

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

  useEffect(() => {
    const loadFollowers = async () => {
      if (!showCreateModal || eventTypeFilter !== 'Private') {
        return;
      }

      setFollowersLoading(true);
      setFollowersError(null);

      try {
        const userId =
          profile?.id ?? (await supabase.auth.getUser()).data?.user?.id;
        if (!userId) {
          setFollowers([]);
          setFollowersError('Unable to load followers right now.');
          return;
        }

        const {data: followRows, error: followsError} = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', userId);

        if (followsError) {
          throw followsError;
        }

        const followerIds = (followRows ?? []).map(row => row.follower_id);
        if (followerIds.length === 0) {
          setFollowers([]);
          return;
        }

        const {data: profilesData, error: profilesError} = await supabase
          .from('profiles')
          .select('id, username, display_name, profile_picture_url')
          .in('id', followerIds);

        if (profilesError) {
          throw profilesError;
        }

        const mappedFollowers = (profilesData ?? []).map(user => ({
          id: user.id,
          name: user.display_name || user.username || 'Unnamed user',
          avatar: user.profile_picture_url
        }));

        setFollowers(mappedFollowers);
      } catch {
        setFollowers([]);
        setFollowersError('Unable to load followers right now.');
      } finally {
        setFollowersLoading(false);
      }
    };

    loadFollowers();
  }, [eventTypeFilter, profile?.id, showCreateModal]);

  const handleShareEvent = async (
    visibility: 'public' | 'private',
    eventId: string
  ) => {
    const eventLink = `https://vanora.app/events/${eventId}`;
    const shareMessage =
      visibility === 'private'
        ? `You are invited! Join my private event here: ${eventLink}`
        : `Check out this event on Vanora: ${eventLink}`;

    await Share.share({
      message: shareMessage,
      url: eventLink,
      title: 'Share Event'
    });
  };

  const handleJoinEvent = async (event: Event) => {
    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user?.id) {
        showToast('error', 'Error', 'Please sign in again.');
        return;
      }

      const {error: joinError} = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: user.id,
          role: 'attendee'
        });

      if (joinError) {
        throw joinError;
      }

      if (currentUserId !== undefined) {
        queryClient.setQueryData<EventsQueryData>(
          ['events', currentUserId],
          previous => {
            if (!previous) return previous;
            const updatedEventList = previous.eventList.map(item =>
              item.id === event.id ? {...item, isJoined: true} : item
            );
            const alreadyJoined = previous.joinedEvents.some(
              item => item.id === event.id
            );
            const updatedJoinedEvents = alreadyJoined
              ? previous.joinedEvents
              : [...previous.joinedEvents, {...event, isJoined: true}];
            return {
              eventList: updatedEventList,
              joinedEvents: updatedJoinedEvents
            };
          }
        );
        queryClient.invalidateQueries({queryKey: ['events', currentUserId]});
      }

      setSelectedEvent(prev =>
        prev && prev.id === event.id ? {...prev, isJoined: true} : prev
      );

      showToast('success', 'Joined', 'You joined this event.');
    } catch (error) {
      console.error('Error joining event:', error);
      showToast('error', 'Error', 'Unable to join event right now.');
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      if (!asset?.uri) return;

      let resolvedUri = asset.uri;
      if (resolvedUri.startsWith('content://')) {
        try {
          const safeName = asset.fileName || `event-${Date.now()}.jpg`;
          const cacheUri = `${FileSystem.cacheDirectory ?? ''}${safeName}`;
          await FileSystem.copyAsync({from: resolvedUri, to: cacheUri});
          resolvedUri = cacheUri;
        } catch (error) {
          console.warn('Failed to cache selected image:', error);
        }
      }

      setEventImageUri(resolvedUri);
    }
  };

  const uploadEventCover = async (eventId: string, userId: string) => {
    if (!eventImageUri) return null;

    try {
      const fileExt = eventImageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/events/${eventId}/cover.${fileExt}`;
      const response = await fetch(eventImageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      let contentType = 'image/jpeg';
      if (fileExt === 'png') contentType = 'image/png';
      if (fileExt === 'gif') contentType = 'image/gif';
      if (fileExt === 'webp') contentType = 'image/webp';

      const {error: uploadError} = await supabase.storage
        .from('profiles')
        .upload(fileName, arrayBuffer, {
          contentType,
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const {data: urlData} = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading event cover:', error);
      return null;
    }
  };

  const resetCreateForm = () => {
    setEventTitle('');
    setStartDateLabel('');
    setStartTimeLabel('');
    setEndDateLabel('');
    setEndTimeLabel('');
    setStartDateValue(null);
    setEndDateValue(null);
    setStartTimeValue(null);
    setEndTimeValue(null);
    setEventLocation('');
    setEventDescription('');
    setEventImageUri(null);
    setSelectedInvitees(new Set());
    setShowCreateModal(false);
  };
  

  const createEventMutation = useAppMutation<CreateEventPayload, CreateEventResult>({
    mutationFn: async payload => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create an event.');
      }

      const {data: eventData, error: eventError} = await supabase
        .from('events')
        .insert({
          host_id: user.id,
          title: payload.title,
          description: payload.description,
          location: payload.location,
          start_at: payload.startAt,
          end_at: payload.endAt,
          visibility: payload.visibility
        })
        .select()
        .single();

      if (eventError) {
        throw eventError;
      }

      const coverUrl = await uploadEventCover(eventData.id, user.id);
      if (coverUrl) {
        const {error: coverError} = await supabase
          .from('events')
          .update({cover_image_url: coverUrl})
          .eq('id', eventData.id);
        if (coverError) {
          throw coverError;
        }
        eventData.cover_image_url = coverUrl;
      }

      const {error: hostError} = await supabase
        .from('event_participants')
        .insert({
          event_id: eventData.id,
          user_id: user.id,
          role: 'host'
        });
      if (hostError) {
        throw hostError;
      }

      if (payload.visibility === 'private' && payload.inviteeIds.length > 0) {
        const inviteRows = payload.inviteeIds.map(inviteeId => ({
          event_id: eventData.id,
          inviter_id: user.id,
          invitee_id: inviteeId,
          status: 'pending'
        }));
        const {error: invitesError} = await supabase
          .from('event_invites')
          .insert(inviteRows);
        if (invitesError) {
          console.error('Error creating invites:', invitesError);
        } else {
          const organizerName =
            profile?.display_name || profile?.username || 'An organizer';
          const notificationRows = inviteRows.map(invite => ({
            recipient_id: invite.invitee_id,
            actor_id: user.id,
            type: 'general',
            title: 'Event Invite',
            message: `${organizerName} invited you to "${eventData.title}".`
          }));
          const {error: notifError} = await supabase
            .from('notifications')
            .insert(notificationRows);
          if (notifError) {
            console.error('Error creating notifications:', notifError);
          }
        }
      }

      return {
        eventRow: {
          ...eventData,
          event_participants: [{count: 1}]
        },
        userId: user.id
      };
    },
    successMessage: 'Event posted successfully.',
    errorMessage: 'Failed to create event. Please try again.',
    resetForm: resetCreateForm,
    onSuccessExtra: result => {
      if (!result) return;
      const {eventRow, userId} = result;
      setCurrentUserId(userId);
      const mappedEvent = mapEventRow(eventRow, true);

      queryClient.setQueryData<EventsQueryData>(
        ['events', userId],
        previous => {
          const safePrevious = previous ?? {eventList: [], joinedEvents: []};
          const alreadyUpcoming = safePrevious.eventList.some(
            item => item.id === mappedEvent.id
          );
          const alreadyJoined = safePrevious.joinedEvents.some(
            item => item.id === mappedEvent.id
          );

          return {
            eventList: alreadyUpcoming
              ? safePrevious.eventList
              : [mappedEvent, ...safePrevious.eventList],
            joinedEvents: alreadyJoined
              ? safePrevious.joinedEvents
              : [mappedEvent, ...safePrevious.joinedEvents]
          };
        }
      );

      queryClient.invalidateQueries({queryKey: ['events', userId]});
    }
  });

  const isPosting = createEventMutation.isPending;

  const handlePostEvent = async () => {
    if (!eventTitle.trim()) {
      showToast('error', 'Required', 'Please enter an event title.');
      return;
    }

    if (
      !startDateValue ||
      !startTimeValue ||
      !endDateValue ||
      !endTimeValue
    ) {
        showToast('error', 'Required', 'Please select start and end date/time.');
      return;
    }

    const startAt = new Date(startDateValue);
    startAt.setHours(startTimeValue.hours, startTimeValue.minutes, 0, 0);

    const endAt = new Date(endDateValue);
    endAt.setHours(endTimeValue.hours, endTimeValue.minutes, 0, 0);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      showToast('error', 'Invalid date', 'Please choose valid dates and times.');
      return;
    }

    if (endAt < startAt) {
      showToast('error', 'Invalid time', 'End time must be after start time.');
      return;
    }

    createEventMutation.mutate({
      title: eventTitle.trim(),
      description: eventDescription.trim() || null,
      location: eventLocation.trim() || null,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      visibility: eventTypeFilter.toLowerCase() as 'private' | 'public',
      inviteeIds: Array.from(selectedInvitees)
    });
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
            {['Upcoming', 'Joined'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.eventSubtab,
                  eventSubtab === tab.toLowerCase() && styles.eventSubtabActive
                ]}
                onPress={() => setEventSubtab(tab.toLowerCase())}
              >
                <Text
                  style={[
                    styles.eventSubtabText,
                    eventSubtab === tab.toLowerCase() &&
                      styles.eventSubtabTextActive
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            {eventSubtab === 'upcoming'
              ? 'Upcoming Gatherings'
              : 'My Gatherings'}
          </Text>
          {eventsLoading ? (
            <Text style={styles.placeholderText}>Loading events...</Text>
          ) : eventsErrorMessage ? (
            <Text style={styles.placeholderText}>{eventsErrorMessage}</Text>
          ) : filteredEvents.length === 0 ? (
            <Text style={styles.placeholderText}>No events yet.</Text>
          ) : (
            filteredEvents.map(event => (
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
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() =>
                      handleShareEvent(
                        event.eventType === 'Private' ? 'private' : 'public',
                        event.id
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="share-outline"
                      size={18}
                      color="#1dd1a1"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
              <TouchableOpacity
                style={styles.modalShareButton}
                onPress={() =>
                  handleShareEvent(
                    selectedEvent.eventType === 'Private' ? 'private' : 'public',
                    selectedEvent.id
                  )
                }
              >
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
                    <Text style={styles.cardValue}>
                      {selectedEvent.endTime}
                    </Text>
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
                  {selectedEvent.description ||
                    "Join us for an amazing event! We'll be sharing stories and making new friends."}
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
                    require('../../../assets/images/vanora.png'),
                    require('../../../assets/images/vanora.png'),
                    require('../../../assets/images/vanora.png')
                  ].map((avatar, index) => (
                    <Image
                      key={index}
                      source={avatar}
                      style={[
                        styles.avatarSmall,
                        {marginLeft: index > 0 ? -8 : 0}
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={{height: 100}} />
            </ScrollView>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalJoinButton,
                  selectedEvent.isJoined && styles.modalJoinButtonActive
                ]}
                onPress={() => {
                  if (!selectedEvent.isJoined) {
                    handleJoinEvent(selectedEvent);
                  }
                  setShowJoinModal(true);
                }}
              >
                <Text
                  style={[
                    styles.modalJoinButtonText,
                    selectedEvent.isJoined && styles.modalJoinButtonTextActive
                  ]}
                >
                  {selectedEvent.isJoined ? 'View Updates' : 'Join Event'}
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
              <View style={{width: 24}} />
            </View>

            <ScrollView
              style={styles.createModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.imageUploadSection}>
                <Text style={styles.createModalLabel}>Event Image</Text>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={handlePickImage}
                  activeOpacity={0.8}
                >
                  {eventImageUri ? (
                    <Image
                      source={{uri: eventImageUri}}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={40}
                        color="#a0aec0"
                      />
                      <Text style={styles.imageUploadText}>
                        Upload a cover photo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Event Title</Text>
                <View style={styles.formInput}>
                  <TextInput
                    placeholder="e.g. Sunset Bonfire Meetup"
                    placeholderTextColor="#cbd5e0"
                    value={eventTitle}
                    onChangeText={setEventTitle}
                    style={styles.inputText}
                  />
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>START DATE</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => openPicker('startDate')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text
                      style={[
                        styles.inputText,
                        !startDateLabel && styles.placeholderTextLight
                      ]}
                    >
                      {startDateLabel || 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>START TIME</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => openPicker('startTime')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="clock"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text
                      style={[
                        styles.inputText,
                        !startTimeLabel && styles.placeholderTextLight
                      ]}
                    >
                      {startTimeLabel || 'Select time'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>END DATE</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => openPicker('endDate')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text
                      style={[
                        styles.inputText,
                        !endDateLabel && styles.placeholderTextLight
                      ]}
                    >
                      {endDateLabel || 'Select date'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>END TIME</Text>
                  <TouchableOpacity
                    style={styles.formInput}
                    onPress={() => openPicker('endTime')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="clock"
                      size={18}
                      color="#1dd1a1"
                    />
                    <Text
                      style={[
                        styles.inputText,
                        !endTimeLabel && styles.placeholderTextLight
                      ]}
                    >
                      {endTimeLabel || 'Select time'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Location</Text>
                <TouchableOpacity
                  style={styles.formInput}
                  onPress={() => setLocationModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#1dd1a1"
                  />
                  <Text
                    style={[
                      styles.inputText,
                      !eventLocation && styles.placeholderTextLight
                    ]}
                  >
                    {eventLocation || 'Search for a location'}
                  </Text>
                  {eventLocation ? (
                    <TouchableOpacity
                      onPress={clearEventLocation}
                      style={styles.clearLocationButton}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={16}
                        color="#cbd5e0"
                      />
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description</Text>
                <Pressable
                  style={[styles.formInput, styles.textArea]}
                  onPress={() => descriptionInputRef.current?.focus()}
                >
                  <TextInput
                    placeholder="What should guests know?"
                    placeholderTextColor="#cbd5e0"
                    value={eventDescription}
                    onChangeText={setEventDescription}
                    style={[styles.inputText, styles.textAreaInput]}
                    multiline
                    textAlignVertical="top"
                    ref={descriptionInputRef}
                  />
                </Pressable>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Event Type</Text>
                <Text style={styles.eventTypeSubtitle}>
                  Choose who can discover and request to join
                </Text>
                <View style={styles.eventTypeToggle}>
                  {['Private', 'Public'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.eventTypeButton,
                        eventTypeFilter === type && styles.eventTypeButtonActive
                      ]}
                      onPress={() =>
                        setEventTypeFilter(type as 'Private' | 'Public')
                      }
                    >
                      <Text
                        style={[
                          styles.eventTypeButtonText,
                          eventTypeFilter === type &&
                            styles.eventTypeButtonTextActive
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {eventTypeFilter === 'Private' && (
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
                        Invitation only (visible to invited guests)
                      </Text>
                      <Text style={styles.privateEventDescription}>
                        Visible only to people you invite
                      </Text>
                    </View>
                  </View>

                  <View style={styles.formSection}>
                    <View style={styles.inviteHeader}>
                      <Text style={styles.formLabel}>Invite Friends</Text>
                      <Text style={styles.inviteCount}>
                        {selectedInvitees.size} Selected
                      </Text>
                    </View>
                  <View style={styles.searchInput}>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={18}
                      color="#cbd5e0"
                    />
                    <TextInput
                      placeholder="Search followers..."
                      placeholderTextColor="#cbd5e0"
                      value={inviteSearch}
                      onChangeText={setInviteSearch}
                      style={styles.inputText}
                    />
                  </View>

                    <View style={styles.friendList}>
                      {followersLoading ? (
                        <Text style={styles.emptyFollowersText}>
                          Loading followers...
                        </Text>
                      ) : followersError ? (
                        <Text style={styles.emptyFollowersText}>
                          {followersError}
                        </Text>
                      ) : followers.length === 0 ? (
                        <Text style={styles.emptyFollowersText}>
                          No followers yet. Share your profile to start inviting
                          friends.
                        </Text>
                      ) : (
                        followers
                          .filter(friend =>
                            friend.name
                              .toLowerCase()
                              .includes(inviteSearch.toLowerCase())
                          )
                          .map(friend => {
                            const isSelected = selectedInvitees.has(friend.id);
                            return (
                            <TouchableOpacity
                              key={friend.id}
                              style={styles.friendItem}
                              onPress={() => toggleInvitee(friend.id)}
                            >
                              <Image
                                source={
                                  friend.avatar
                                    ? {uri: friend.avatar}
                                    : require('../../../assets/images/vanora.png')
                                }
                                style={styles.friendAvatar}
                              />
                              <Text style={styles.friendName}>
                                {friend.name}
                              </Text>
                              <View
                                style={[
                                  styles.checkbox,
                                  isSelected && styles.checkboxSelected
                                ]}
                              >
                                {isSelected && (
                                  <MaterialCommunityIcons
                                    name="check"
                                    size={14}
                                    color="#ffffff"
                                  />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                          })
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.shareInviteButton}
                      onPress={() => handleShareEvent('private', 'event-id')}
                    >
                      <MaterialCommunityIcons
                        name="share-variant"
                        size={16}
                        color="#1dd1a1"
                      />
                      <Text style={styles.shareInviteText}>
                        Share invite link
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!isSubscribed && (
                    <View style={styles.premiumCard}>
                      <MaterialCommunityIcons
                        name="star"
                        size={24}
                        color="#1dd1a1"
                      />
                      <View style={styles.premiumContent}>
                        <Text style={styles.premiumTitle}>Go Premium</Text>
                        <Text style={styles.premiumDescription}>
                          Go Premium to invite up to 20 participants. Free plan
                          is limited to 3 invites.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={() =>
                          router.push('/(app)/membership-subscription')
                        }
                      >
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              {eventTypeFilter === 'Public' && (
                <>
                  <View style={styles.publicEventInfo}>
                    <MaterialCommunityIcons
                      name="account"
                      size={20}
                      color="#cbd5e0"
                    />
                    <View style={styles.publicEventTextContainer}>
                      <Text style={styles.publicEventTitle}>Public Event</Text>
                      <Text style={styles.publicEventDescription}>
                        Anyone can see and request to join. Free plan allows up
                        to 20 participants.
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.shareInviteButton}
                    onPress={() => handleShareEvent('public', 'event-id')}
                  >
                    <MaterialCommunityIcons
                      name="share-variant"
                      size={16}
                      color="#1dd1a1"
                    />
                    <Text style={styles.shareInviteText}>
                      Share event link
                    </Text>
                  </TouchableOpacity>

                  {!isSubscribed && (
                    <View style={styles.premiumCard}>
                      <MaterialCommunityIcons
                        name="star"
                        size={24}
                        color="#1dd1a1"
                      />
                      <View style={styles.premiumContent}>
                        <Text style={styles.premiumTitle}>Go Premium</Text>
                        <Text style={styles.premiumDescription}>
                          Upgrade to host public events with up to 100
                          participants.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={() =>
                          router.push('/(app)/membership-subscription')
                        }
                      >
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}

              <View style={{height: 30}} />
            </ScrollView>

            <View style={styles.createModalButtons}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  isPosting && styles.createButtonDisabled
                ]}
                onPress={handlePostEvent}
                disabled={isPosting}
              >
                <View style={styles.createButtonContent}>
                  {isPosting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : null}
                  <Text style={styles.createButtonText}>
                    {isPosting ? 'Posting...' : 'Post'}
                  </Text>
                </View>
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

      <LocationSearchModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={handleSelectEventLocation}
      />

      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickerType === 'startDate' && 'Start Date'}
                {pickerType === 'startTime' && 'Start Time'}
                {pickerType === 'endDate' && 'End Date'}
                {pickerType === 'endTime' && 'End Time'}
              </Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#1a1a1a"
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={
                pickerType === 'startDate' || pickerType === 'endDate'
                  ? dateOptions
                  : timeOptions
              }
              keyExtractor={item => item.label}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={() => handleSelectPickerValue(item)}
                >
                  <Text style={styles.pickerOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  contentWrapper: {
    flex: 1,
    position: 'relative'
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  addEventButton: {
    position: 'absolute',
    bottom: 35,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1dd1a1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100
  },
  eventSubtabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 6
  },
  eventSubtab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center'
  },
  eventSubtabActive: {
    backgroundColor: '#1dd1a1'
  },
  eventSubtabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999'
  },
  eventSubtabTextActive: {
    color: '#ffffff'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12
  },
  eventCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  cardImageContainer: {
    position: 'relative',
    height: 160
  },
  eventImage: {
    width: '100%',
    height: '100%'
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4
  },
  dateMonth: {
    fontSize: 18,
    fontWeight: '300',
    color: '#10B981'
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1dd1a1'
  },
  dateSeparator: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1dd1a1'
  },
  eventInfo: {
    padding: 12
  },
  titleAttendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1
  },
  attendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8faf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6
  },
  eventLocation: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    flex: 1
  },
  eventAttendees: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1dd1a1'
  },
  dateTimeColumn: {
    marginVertical: 8,
    gap: 8
  },
  dateTimeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dateTimeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 2
  },
  dateTimeValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666'
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    alignItems: 'center'
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#1dd1a1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
    textAlign: 'center',
    marginTop: 40
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000
  },
  modalContainer: {
    flex: 0.9,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  modalImageContainer: {
    position: 'relative',
    height: 250
  },
  modalImage: {
    width: '100%',
    height: '100%'
  },
  eventTagContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12
  },
  eventTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1dd1a1',
    backgroundColor: '#e8faf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  modalBackButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalShareButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  modalHeader: {
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8
  },
  modalAttendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  modalAttendees: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999'
  },
  dateTimeCardsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  dateTimeCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    marginHorizontal: 3
  },
  cardValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingLeft: 5
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16
  },
  locationContent: {
    flex: 1
  },
  locationTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 4
  },
  locationAddress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6
  },
  openMapsLink: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1dd1a1'
  },
  aboutSection: {
    marginBottom: 16
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  aboutText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 18
  },
  whosGoingSection: {
    marginBottom: 16
  },
  whosGoingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1dd1a1'
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  modalButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  modalJoinButton: {
    backgroundColor: '#1dd1a1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  modalJoinButtonActive: {
    backgroundColor: '#f0f0f0'
  },
  modalJoinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  modalJoinButtonTextActive: {
    color: '#1dd1a1'
  },
  createModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 2000
  },
  createModalContainer: {
    flex: 0.9,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  imageUploadSection: {
    paddingVertical: 16
  },
  imageUploadBox: {
    backgroundColor: '#e8f4f1',
    borderRadius: 12,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
    height: 180
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imageUploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0aec0',
    marginTop: 8
  },
  createModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  createModalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8
  },
  formSection: {
    marginBottom: 16,
    flex: 1
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4a5568',
    textTransform: 'uppercase',
    marginBottom: 8
  },
  formInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  inputText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '400',
    color: '#1a1a1a',
    marginLeft: 8,
    paddingVertical: 0
  },
  placeholderTextLight: {
    color: '#cbd5e0'
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
    alignItems: 'flex-start'
  },
  textAreaInput: {
    marginLeft: 0,
    width: '100%'
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  clearLocationButton: {
    paddingLeft: 8
  },
  eventTypeSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#718096',
    marginBottom: 12
  },
  eventTypeToggle: {
    flexDirection: 'row',
    gap: 8
  },
  eventTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    alignItems: 'center'
  },
  eventTypeButtonActive: {
    backgroundColor: '#1dd1a1',
    borderColor: '#1dd1a1'
  },
  eventTypeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096'
  },
  eventTypeButtonTextActive: {
    color: '#ffffff'
  },
  privateEventInfo: {
    flexDirection: 'row',
    backgroundColor: '#e8faf6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10
  },
  privateEventTextContainer: {
    flex: 1
  },
  privateEventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1dd1a1',
    marginBottom: 2
  },
  privateEventSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 4
  },
  privateEventDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: '#718096'
  },
  publicEventInfo: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10
  },
  publicEventTextContainer: {
    flex: 1
  },
  publicEventTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 4
  },
  publicEventDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: '#a0aec0'
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  inviteCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1dd1a1'
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12
  },
  friendList: {
    gap: 10
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1
  },
  emptyFollowersText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0aec0',
    textAlign: 'center',
    paddingVertical: 12
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e0'
  },
  checkboxSelected: {
    backgroundColor: '#1dd1a1',
    borderColor: '#1dd1a1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f7fafc',
    marginTop: 12
  },
  shareInviteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1dd1a1'
  },
  premiumCard: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center'
  },
  premiumContent: {
    flex: 1
  },
  premiumTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 4
  },
  premiumDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: '#718096',
    lineHeight: 16
  },
  upgradeButton: {
    backgroundColor: '#1dd1a1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6
  },
  upgradeButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff'
  },
  createModalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096'
  },
  createButton: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1dd1a1',
    alignItems: 'center'
  },
  createButtonDisabled: {
    opacity: 0.7
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end'
  },
  pickerSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%'
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  pickerOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a'
  }
});
