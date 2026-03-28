/**
 * @file Support.jsx
 * @module Screens/Support
 * @description
 * Ultra-enhanced support ticket system with search, filtering,
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  Pressable,
  Alert,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from '../../../utilities/custom-components/modal/Modal.utility';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTicket,
  getUserTickets,
  resetSupportState,
  deleteTicket,
} from '../../../redux/slices/support.slice';
import Header from '../../../utilities/custom-components/header/header/Header';
import Button from '../../../utilities/custom-components/button/Button.utility';
import Input from '../../../utilities/custom-components/input-field/InputField.utility';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const FILTERS = ['ALL', 'OPEN', 'RESOLVED', 'CLOSED'];

const StatusChip = ({ status }) => {
  let color = '#64748B';
  let bg = '#F1F5F9';
  let icon = 'progress-question';

  switch (status?.toUpperCase()) {
    case 'OPEN':
      color = '#3B82F6';
      bg = '#EFF6FF';
      icon = 'inbox-arrow-down';
      break;
    case 'IN_PROGRESS':
      color = '#F59E0B';
      bg = '#FFFBEB';
      icon = 'progress-clock';
      break;
    case 'RESOLVED':
      color = '#10B981';
      bg = '#ECFDF5';
      icon = 'check-circle-outline';
      break;
    case 'CLOSED':
      color = '#EF4444';
      bg = '#FEF2F2';
      icon = 'lock-outline';
      break;
  }

  return (
    <View style={[styles.statusChip, { backgroundColor: bg }]}>
      <MaterialCommunityIcons
        name={icon}
        size={width * 0.035}
        color={color}
        style={{ marginRight: width * 0.01 }}
      />
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
};

const TicketSkeleton = () => (
  <View style={styles.skeletonCard}>
    <Animatable.View
      animation="flash"
      iterationCount="infinite"
      duration={1500}
      style={styles.skeletonFlash}
    />
  </View>
);

const Support = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { tickets, loading } = useSelector(state => state.support);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
    return () => dispatch(resetSupportState());
  }, []);

  const fetchTickets = () => {
    const userId = user?.id || user?._id;
    if (userId) dispatch(getUserTickets(userId));
  };

  const processedTickets = useMemo(() => {
    let data = tickets || [];

    if (activeFilter !== 'ALL') {
      data = data.filter(t => t.status?.toUpperCase() === activeFilter);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        t =>
          t.subject?.toLowerCase().includes(lowerQuery) ||
          t.ticketId?.toLowerCase().includes(lowerQuery),
      );
    }

    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tickets, activeFilter, searchQuery]);

  const handleFilterChange = filter => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFilter(filter);
  };

  const handleDeleteTicket = ticketId => {
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await dispatch(deleteTicket(ticketId)).unwrap();
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: response?.message || 'Ticket deleted successfully',
              });
              fetchTickets();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'Failed to delete ticket',
              });
            }
          },
        },
      ],
    );
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Missing Details',
        text2: 'Please describe your issue.',
      });
    }

    try {
      const ticketData = {
        subject: subject.trim(),
        description: description.trim(),
        priority,
      };

      const response = await dispatch(createTicket(ticketData)).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response?.message || 'Ticket created successfully',
      });

      setShowCreateModal(false);
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
      fetchTickets();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error?.message || 'Failed to create ticket',
      });
    }
  };

  const getPriorityColor = p => {
    switch (p) {
      case 'HIGH':
        return '#EF4444';
      case 'MEDIUM':
        return '#F59E0B';
      default:
        return '#3B82F6';
    }
  };

  const renderTicketItem = useCallback(
    ({ item, index }) => (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
        useNativeDriver
      >
        <Pressable
          onLongPress={() => handleDeleteTicket(item._id)}
          delayLongPress={800}
          style={({ pressed }) => [
            styles.ticketCard,
            pressed && styles.ticketCardPressed,
            { borderLeftColor: getPriorityColor(item.priority) },
          ]}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.ticketId}>
              #{item._id?.slice(-6).toUpperCase() || 'ID'}
            </Text>
            <StatusChip status={item.status || 'OPEN'} />
          </View>

          <Text style={styles.ticketSubject} numberOfLines={1}>
            {item.subject}
          </Text>
          <Text style={styles.ticketDesc} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.divider} />

          <View style={styles.cardFooter}>
            <View style={styles.metaContainer}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={width * 0.035}
                color="#94A3B8"
              />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.priorityBadge}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              />
              <Text style={styles.priorityText}>{item.priority}</Text>
            </View>
          </View>
        </Pressable>
      </Animatable.View>
    ),
    [tickets],
  );

  return (
    <View style={styles.container}>
      <Header
        logo={require('../../../assets/logo/logo.png')}
        title="Help Center"
      />

      <View style={styles.controlsSection}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={width * 0.05}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search tickets..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={FILTERS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleFilterChange(item)}
                style={[
                  styles.filterChip,
                  activeFilter === item && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === item && styles.filterChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      <FlatList
        data={loading ? Array(3).fill({}) : processedTickets}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={loading ? TicketSkeleton : renderTicketItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchTickets}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <Animatable.View animation="fadeIn" style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="lifebuoy"
                  size={width * 0.1}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Tickets Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Everything looks good! You have no pending issues.'}
              </Text>
            </Animatable.View>
          )
        }
      />

      <Animatable.View
        animation="zoomIn"
        duration={400}
        style={styles.fabWrapper}
      >
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={width * 0.07}
            color="#FFF"
          />
          <Text style={styles.fabText}>New Ticket</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Submit Request"
        showCloseButton
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalHelperText}>
            Please provide details so we can assist you quickly.
          </Text>

          <View style={styles.formGroup}>
            <Input
              label="Subject"
              placeholder="e.g. Login Issue"
              value={subject}
              onChangeText={setSubject}
              icon="format-title"
            />
          </View>

          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.prioritySelector}>
            {PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                style={[
                  styles.priorityOption,
                  priority === p && {
                    backgroundColor: getPriorityColor(p) + '20',
                    borderColor: getPriorityColor(p),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === p && {
                      color: getPriorityColor(p),
                      fontFamily: theme.typography.bold,
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Input
              label="Description"
              placeholder="Tell us more..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              height={height * 0.15}
              icon="text-short"
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Submit Ticket"
              onPress={handleCreateTicket}
              loading={loading}
              width={width * 0.8}
              backgroundColor={theme.colors.primary}
              borderRadius={theme.borderRadius.medium}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Support;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  controlsSection: {
    backgroundColor: theme.colors.white,
    paddingBottom: height * 0.02,
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.015,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: width * 0.04,
    height: height * 0.06,
  },

  searchIcon: {
    marginRight: width * 0.025,
  },

  searchInput: {
    flex: 1,
    fontFamily: theme.typography.medium,
    fontSize: theme.typography.fontSize.sm,
    color: '#334155',
  },

  filterContainer: {
    marginTop: height * 0.02,
  },

  filterScroll: {
    paddingHorizontal: width * 0.05,
  },

  filterChip: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: width * 0.025,
  },

  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  filterChipText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.semiBold,
    color: '#64748B',
  },

  filterChipTextActive: {
    color: theme.colors.white,
  },

  listContent: {
    padding: width * 0.05,
    paddingBottom: height * 0.12,
  },

  ticketCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    borderLeftWidth: 4,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },

  ticketCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },

  ticketId: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    fontFamily: theme.typography.bold,
    letterSpacing: 0.5,
  },

  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.005,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 10,
    fontFamily: theme.typography.bold,
  },

  ticketSubject: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginBottom: height * 0.005,
  },

  ticketDesc: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.regular,
    color: '#64748B',
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: height * 0.015,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#94A3B8',
    marginLeft: width * 0.015,
    fontFamily: theme.typography.medium,
  },

  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priorityDot: {
    width: width * 0.015,
    height: width * 0.015,
    borderRadius: width * 0.01,
    marginRight: width * 0.015,
  },

  priorityText: {
    fontSize: 11,
    fontFamily: theme.typography.bold,
    color: '#475569',
  },

  skeletonCard: {
    height: height * 0.18,
    backgroundColor: '#E2E8F0',
    borderRadius: theme.borderRadius.medium,
    marginBottom: height * 0.02,
    overflow: 'hidden',
  },

  skeletonFlash: {
    flex: 1,
    backgroundColor: theme.colors.white,
    opacity: 0.3,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },

  emptyIconCircle: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },

  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.bold,
    color: '#1E293B',
    marginBottom: height * 0.005,
  },

  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    width: width * 0.7,
    lineHeight: 22,
    fontFamily: theme.typography.regular,
  },

  fabWrapper: {
    position: 'absolute',
    bottom: height * 0.04,
    right: width * 0.05,
  },

  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.05,
    borderRadius: 30,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  fabText: {
    color: theme.colors.white,
    fontFamily: theme.typography.bold,
    fontSize: theme.typography.fontSize.md,
    marginLeft: width * 0.02,
  },

  modalHelperText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#64748B',
    marginBottom: height * 0.025,
    fontFamily: theme.typography.regular,
  },

  formGroup: {
    marginBottom: height * 0.025,
  },

  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.semiBold,
    color: '#1E293B',
    marginBottom: height * 0.012,
    marginLeft: width * 0.01,
  },

  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.03,
  },

  priorityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: theme.borderRadius.small,
    marginHorizontal: width * 0.01,
    backgroundColor: theme.colors.white,
  },

  priorityOptionText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.medium,
    color: '#64748B',
  },

  modalActions: {
    marginTop: height * 0.01,
    alignItems: 'center',
  },
});
