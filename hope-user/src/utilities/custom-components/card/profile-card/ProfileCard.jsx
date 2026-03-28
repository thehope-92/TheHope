import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../../styles/Themes';

const { width, height } = Dimensions.get('window');

const ProfileCard = ({
  title,
  iconName,
  navigationTarget,
  iconColor = '#3A1830', 
  textColor = '#000000',
  onPressFunction,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (navigationTarget) {
      navigation.navigate(navigationTarget);
    } else if (onPressFunction) {
      onPressFunction();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={handlePress}
      style={styles.itemContainer}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={24}
          color={iconColor}
        />
      </View>
      
      <Text style={[styles.itemText, { color: textColor }]}>
        {title || 'Title'}
      </Text>
    </TouchableOpacity>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.014,
    paddingHorizontal: width * 0.04,
  },

  iconContainer: {
    width: width * 0.064,
    alignItems: 'center',
    marginRight: width * 0.04,
  },

  itemText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium, 
  },
});