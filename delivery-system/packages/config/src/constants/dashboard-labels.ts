// src/lib/constants/dashboard-labels.ts
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

export const dashboardLabels = {
    // Welcome messages
    welcome: {
        default: "Welcome, {name}!",
    },

    // Subtitle messages based on context
    subtitle: {
        today: {
            withDeliveries: "Here are your deliveries for today. Select a shop to view details.",
            noDeliveries: "No deliveries scheduled for today.",
            loading: "Loading today's deliveries..."
        },
        future: {
            withDeliveries: "Viewing deliveries for {date}. Select a shop to view details.",
            noDeliveries: "No deliveries scheduled for {date}.",
            loading: "Loading deliveries for {date}..."
        },
        past: {
            withDeliveries: "Viewing past deliveries from {date}. Select a shop to view details.",
            noDeliveries: "No deliveries were scheduled for {date}.",
            loading: "Loading deliveries from {date}..."
        }
    },

    // Date headers
    dateHeader: {
        today: "Today's Deliveries",
        tomorrow: "Tomorrow's Deliveries",
        yesterday: "Yesterday's Deliveries",
        default: "Deliveries for {date}"
    },

    // Shop card labels
    shopCard: {
        products: "Products:",
        status: "Status:",
        viewDetails: "View Details",
        locationId: "Location ID:",
        noDeliveries: "No deliveries"
    },

    // Status labels
    status: {
        pending: "Pending",
        in_progress: "In Progress",
        completed: "Completed"
    },

    // Calendar
    calendar: {
        selectDate: "Select Date",
        hasDelivery: "Has deliveries"
    },

    // Navigation
    navigation: {
        backToDashboard: "← Back to Dashboard"
    },

    // Error messages
    errors: {
        fetchShops: "Failed to fetch shops. Please try again later.",
        fetchDeliveries: "Failed to fetch deliveries. Please try again later."
    }
};

// Helper function to get the appropriate date label
export function getDateLabel(date: Date): string {
    if (isToday(date)) {
        return dashboardLabels.dateHeader.today;
    } else if (isTomorrow(date)) {
        return dashboardLabels.dateHeader.tomorrow;
    } else if (isYesterday(date)) {
        return dashboardLabels.dateHeader.yesterday;
    } else {
        return dashboardLabels.dateHeader.default.replace("{date}", format(date, "MMMM d, yyyy"));
    }
}

// Helper function to get the appropriate subtitle
export function getSubtitleMessage(
    date: Date,
    hasDeliveries: boolean,
    isLoading: boolean
): string {
    const dateStr = format(date, "MMMM d, yyyy");

    if (isLoading) {
        if (isToday(date)) {
            return dashboardLabels.subtitle.today.loading;
        } else {
            return dashboardLabels.subtitle.future.loading.replace("{date}", dateStr);
        }
    }

    let subtitleSet;
    if (isToday(date)) {
        subtitleSet = dashboardLabels.subtitle.today;
    } else if (date > new Date()) {
        subtitleSet = dashboardLabels.subtitle.future;
    } else {
        subtitleSet = dashboardLabels.subtitle.past;
    }

    const message = hasDeliveries ? subtitleSet.withDeliveries : subtitleSet.noDeliveries;
    return message.replace("{date}", dateStr);
}

// Future: This will be the interface for multi-language support
export interface DashboardLabelsType {
    welcome: {
        default: string;
    };
    subtitle: {
        today: {
            withDeliveries: string;
            noDeliveries: string;
            loading: string;
        };
        future: {
            withDeliveries: string;
            noDeliveries: string;
            loading: string;
        };
        past: {
            withDeliveries: string;
            noDeliveries: string;
            loading: string;
        };
    };
    dateHeader: {
        today: string;
        tomorrow: string;
        yesterday: string;
        default: string;
    };
    shopCard: {
        products: string;
        status: string;
        viewDetails: string;
        locationId: string;
        noDeliveries: string;
    };
    status: {
        pending: string;
        in_progress: string;
        completed: string;
    };
    calendar: {
        selectDate: string;
        hasDelivery: string;
    };
    navigation: {
        backToDashboard: string;
    };
    errors: {
        fetchShops: string;
        fetchDeliveries: string;
    };
}

// Future multi-language implementation:
// export function getLabels(language: string = 'en'): DashboardLabelsType {
//   return dashboardLabels[language] || dashboardLabels['en'];
// }