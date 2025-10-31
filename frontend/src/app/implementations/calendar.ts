// Self-contained calendar implementation backed by localStorage

// Check if we're in a browser environment
const isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const STORAGE_KEYS = {
    CALENDARS: 'appfactory_calendars',
    EVENTS: 'appfactory_events',
    NEXT_EVENT_ID: 'appfactory_next_event_id',
};

interface StoredCalendar {
    id: string;
    title: string;
    color: string;
}

interface StoredEvent {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    notes?: string;
    calendarId: string;
    allDay?: boolean;
}

// Initialize default calendars if not exists
const initializeDefaultCalendars = (): StoredCalendar[] => {
    if (!isBrowser) return [];

    const existing = localStorage.getItem(STORAGE_KEYS.CALENDARS);
    if (existing) {
        return JSON.parse(existing);
    }

    const defaultCalendars: StoredCalendar[] = [
        { id: 'default-calendar', title: 'My Calendar', color: '#007AFF' },
        { id: 'personal-calendar', title: 'Personal', color: '#34C759' },
        { id: 'work-calendar', title: 'Work', color: '#FF9500' },
    ];

    localStorage.setItem(
        STORAGE_KEYS.CALENDARS,
        JSON.stringify(defaultCalendars)
    );
    return defaultCalendars;
};

const getStoredEvents = (): StoredEvent[] => {
    if (!isBrowser) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return stored ? JSON.parse(stored) : [];
};

const saveEvents = (events: StoredEvent[]): void => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

const generateEventId = (): string => {
    if (!isBrowser) return `event_${Date.now()}`;

    const nextId = localStorage.getItem(STORAGE_KEYS.NEXT_EVENT_ID);
    const id = nextId ? parseInt(nextId) + 1 : 1;
    localStorage.setItem(STORAGE_KEYS.NEXT_EVENT_ID, id.toString());
    return `event_${id}`;
};

export const calendar = {
    requestAccess: async () => {
        console.log('[WEB] Calendar requestAccess');
        // In a web environment, we don't need special permissions for calendar access
        return true;
    },

    getCalendars: async () => {
        console.log('[WEB] Calendar getCalendars');
        return initializeDefaultCalendars();
    },

    getDefaultCalendarId: async () => {
        console.log('[WEB] Calendar getDefaultCalendarId');
        const calendars = initializeDefaultCalendars();
        return calendars[0]?.id || 'default-calendar';
    },

    createEvent: async (
        title: string,
        startDate: Date,
        endDate: Date,
        location?: string,
        notes?: string,
        calendarId?: string,
        allDay?: boolean
    ) => {
        console.log(`[WEB] Calendar createEvent: ${title}`);

        if (!isBrowser) {
            throw new Error(
                'Calendar operations require a browser environment'
            );
        }

        const id = generateEventId();
        const calendars = initializeDefaultCalendars();
        const defaultCalendarId = calendars[0]?.id || 'default-calendar';

        const event: StoredEvent = {
            id,
            title,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            location,
            notes,
            calendarId: calendarId || defaultCalendarId,
            allDay,
        };

        const events = getStoredEvents();
        events.push(event);
        saveEvents(events);

        return id;
    },

    showEventCreationUI: async (
        title?: string,
        startDate?: Date,
        endDate?: Date,
        location?: string,
        notes?: string,
        allDay?: boolean
    ) => {
        console.log('[WEB] Calendar showEventCreationUI');

        // Simulate a UI dialog for event creation
        const userTitle = title || prompt('Event title:', title) || 'New Event';
        const start = startDate || new Date();
        const end = endDate || new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

        try {
            const id = await calendar.createEvent(
                userTitle,
                start,
                end,
                location,
                notes,
                undefined,
                allDay
            );
            return { action: 'created', id };
        } catch {
            return { action: 'cancelled', id: null };
        }
    },

    getEvents: async (
        calendarIds: string[],
        startDate: Date,
        endDate: Date
    ) => {
        console.log(
            `[WEB] Calendar getEvents: ${calendarIds.length} calendars`
        );

        const events = getStoredEvents();
        const filteredEvents = events.filter((event) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);

            return (
                calendarIds.includes(event.calendarId) &&
                eventStart <= endDate &&
                eventEnd >= startDate
            );
        });

        return filteredEvents.map((event) => ({
            id: event.id,
            title: event.title,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            location: event.location,
            notes: event.notes,
            calendarId: event.calendarId,
            allDay: event.allDay ?? false,
        }));
    },

    updateEvent: async (
        id: string,
        title?: string,
        startDate?: Date,
        endDate?: Date,
        location?: string,
        notes?: string,
        allDay?: boolean
    ) => {
        console.log(`[WEB] Calendar updateEvent: ${id}`);

        if (!isBrowser) {
            throw new Error(
                'Calendar operations require a browser environment'
            );
        }

        const events = getStoredEvents();
        const eventIndex = events.findIndex((event) => event.id === id);

        if (eventIndex === -1) {
            throw new Error(`Event with id ${id} not found`);
        }

        const event = events[eventIndex];
        if (title !== undefined) event.title = title;
        if (startDate !== undefined) event.startDate = startDate.toISOString();
        if (endDate !== undefined) event.endDate = endDate.toISOString();
        if (location !== undefined) event.location = location;
        if (notes !== undefined) event.notes = notes;
        if (allDay !== undefined) event.allDay = allDay;

        saveEvents(events);
        return id;
    },

    deleteEvent: async (id: string) => {
        console.log(`[WEB] Calendar deleteEvent: ${id}`);

        if (!isBrowser) {
            throw new Error(
                'Calendar operations require a browser environment'
            );
        }

        const events = getStoredEvents();
        const filteredEvents = events.filter((event) => event.id !== id);

        if (filteredEvents.length === events.length) {
            return false; // Event not found
        }

        saveEvents(filteredEvents);
        return true;
    },

    showEventDetailsUI: async (id: string) => {
        console.log(`[WEB] Calendar showEventDetailsUI: ${id}`);

        const events = getStoredEvents();
        const event = events.find((e) => e.id === id);

        if (!event) {
            throw new Error(`Event with id ${id} not found`);
        }

        // Return the expected format: { action: string, id: string | null }
        // In a web environment, we can't actually open a native UI, so we simulate viewing
        return {
            action: 'viewed',
            id: event.id,
        };
    },
};
