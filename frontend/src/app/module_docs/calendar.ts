/**
 * Generated documentation for calendar module.
 * This file is auto-generated from module_types/calendar.ts
 */

export const calendar = {
  moduleName: "calendar",
  description: "Calendar API for device calendar access. Manages calendar events and provides native UI integration. Requires permission before accessing calendar data.",
  userDescription: "Create, read, and manage calendar events with native calendar integration and event reminders.",
  
  functions: {
    requestAccess: {
      name: "requestAccess",
      description: "Requests calendar access permission.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getCalendars: {
      name: "getCalendars",
      description: "Gets available calendars.",
      documentation: `
Signature: () => Promise<Calendar[]>
`
    },
    
    getDefaultCalendarId: {
      name: "getDefaultCalendarId",
      description: "Gets default calendar ID.",
      documentation: `
Signature: () => Promise<string>
`
    },
    
    createEvent: {
      name: "createEvent",
      description: "Creates calendar event.",
      documentation: `
Signature: (title: string, startDate: Date, endDate: Date, location?: string, notes?: string, calendarId?: string, allDay?: boolean) => Promise<string>
Param Info:
  - title: Event title
  - startDate: Start time
  - endDate: End time
  - location: Event location
  - notes: Event description
  - calendarId: Target calendar
  - allDay: All-day event flag
`
    },
    
    showEventCreationUI: {
      name: "showEventCreationUI",
      description: "Shows native event creation UI.",
      documentation: `
Signature: (title?: string, startDate?: Date, endDate?: Date, location?: string, notes?: string, allDay?: boolean) => Promise<EventCreationResult>
Param Info:
  - title: Pre-filled event title
  - startDate: Pre-filled start time
  - endDate: Pre-filled end time
  - location: Pre-filled location
  - notes: Pre-filled description
  - allDay: Pre-filled all-day flag
`
    },
    
    getEvents: {
      name: "getEvents",
      description: "Gets events in date range.",
      documentation: `
Signature: (calendarIds: string[], startDate: Date, endDate: Date) => Promise<CalendarEvent[]>
Param Info:
  - calendarIds: Array of calendar IDs to search
  - startDate: Start of date range
  - endDate: End of date range
`
    },
    
    updateEvent: {
      name: "updateEvent",
      description: "Updates existing event.",
      documentation: `
Signature: (id: string, title?: string, startDate?: Date, endDate?: Date, location?: string, notes?: string, allDay?: boolean) => Promise<string>
Param Info:
  - id: Event ID to update
  - title: New event title
  - startDate: New start time
  - endDate: New end time
  - location: New location
  - notes: New description
  - allDay: New all-day flag
`
    },
    
    deleteEvent: {
      name: "deleteEvent",
      description: "Deletes calendar event.",
      documentation: `
Signature: (id: string) => Promise<boolean>
Param Info:
  - id: Event ID to delete
`
    },
    
    showEventDetailsUI: {
      name: "showEventDetailsUI",
      description: "Shows event details UI.",
      documentation: `
Signature: (id: string) => Promise<EventCreationResult>
Param Info:
  - id: Event ID to display
`
    }
  },
  
  types: {
    Calendar: {
      type: "interface",
      description: "",
      properties: {
        id: "Calendar unique ID",
        title: "Calendar display name",
        color: "Calendar color hex code"
      }
    },
    CalendarEvent: {
      type: "interface",
      description: "Calendar event",
      properties: {
        id: "Event unique ID",
        title: "Event title",
        startDate: "Event start time",
        endDate: "Event end time",
        location: "Event location",
        notes: "Event notes/description",
        allDay: "Whether all-day event",
        calendarId: "Associated calendar ID"
      }
    },
    EventCreationResult: {
      type: "interface",
      description: "Event UI creation result",
      properties: {
        action: "User action (saved/cancelled)",
        id: "Created event ID if saved"
      }
    }
  },
  
  example: `
await Native.calendar.requestAccess();
const eventId = await Native.calendar.createEvent(
"Meeting", new Date(), new Date(Date.now() + 3600000)
);
`
};

// Export for module access
export default calendar;