
export const getPanelTitle = (userRole?: string) => {
  switch (userRole) {
    case 'owner':
      return 'Owner Dashboard - All Notifications';
    case 'admin':
      return 'Admin Panel - Messages & Updates';
    case 'franchise':
      return 'Franchise Notifications';
    default:
      return 'Notifications';
  }
};

export const getPanelDescription = (userRole?: string) => {
  switch (userRole) {
    case 'owner':
      return 'System-wide notifications, user registrations, and messages from all roles';
    case 'admin':
      return 'Messages from owners and franchise communications';
    case 'franchise':
      return 'Your verification status, orders, and messages from management';
    default:
      return 'Your notifications and updates';
  }
};

export const getEmptyStateMessage = (userRole?: string) => {
  switch (userRole) {
    case 'owner':
      return 'You\'ll see all system notifications, user registrations, and messages here.';
    case 'admin':
      return 'You\'ll receive messages from owners and franchise communications here.';
    case 'franchise':
      return 'You\'ll receive updates about verification, orders, and management messages here.';
    default:
      return 'You\'ll receive notifications here.';
  }
};
