/**
 * Generated documentation for contacts module.
 * This file is auto-generated from module_types/contacts.ts
 */

export const contacts = {
  moduleName: "contacts",
  description: "Contacts API for device address book. Manages contacts with full CRUD operations and native UI. Requires permission before accessing contact data.",
  userDescription: "Access and manage device contacts with full CRUD operations and native contact picker UI.",
  
  functions: {
    requestPermission: {
      name: "requestPermission",
      description: "Requests contacts permission.",
      documentation: `
Signature: () => Promise<boolean>
`
    },
    
    getContacts: {
      name: "getContacts",
      description: "Gets contacts list.",
      documentation: `
Signature: (fields?: string[], searchName?: string) => Promise<Contact[]>
Param Info:
  - fields: Array of field names to retrieve (e.g., ["firstName", "phoneNumbers"])
  - searchName: Optional name to filter contacts by
`
    },
    
    getContactById: {
      name: "getContactById",
      description: "Gets contact by ID.",
      documentation: `
Signature: (id: string) => Promise<Contact | null>
Param Info:
  - id: Contact ID to retrieve
`
    },
    
    addContact: {
      name: "addContact",
      description: "Adds new contact.",
      documentation: `
Signature: (firstName?: string, lastName?: string, company?: string, phoneNumbers?: PhoneNumber[], emails?: EmailAddress[], addresses?: Address[], birthday?: Birthday, image?: { uri: string }) => Promise<string>
Param Info:
  - firstName: Contact's first name
  - lastName: Contact's last name
  - company: Contact's company
  - phoneNumbers: Array of phone numbers
  - emails: Array of email addresses
  - addresses: Array of physical addresses
  - birthday: Birthday information
  - image: Contact photo URI
`
    },
    
    updateContact: {
      name: "updateContact",
      description: "Updates existing contact.",
      documentation: `
Signature: (id: string, firstName?: string, lastName?: string, company?: string, phoneNumbers?: PhoneNumber[], emails?: EmailAddress[], addresses?: Address[], birthday?: Birthday, image?: { uri: string }) => Promise<string>
Param Info:
  - id: Contact ID to update
  - firstName: New first name
  - lastName: New last name
  - company: New company
  - phoneNumbers: New phone numbers
  - emails: New email addresses
  - addresses: New physical addresses
  - birthday: New birthday
  - image: New contact photo URI
`
    },
    
    deleteContact: {
      name: "deleteContact",
      description: "Deletes contact.",
      documentation: `
Signature: (id: string) => Promise<boolean>
Param Info:
  - id: Contact ID to delete
`
    },
    
    presentContactForm: {
      name: "presentContactForm",
      description: "Shows native contact form.",
      documentation: `
Signature: (contactId?: string, firstName?: string, lastName?: string, company?: string, phoneNumbers?: PhoneNumber[], emails?: EmailAddress[], addresses?: Address[], birthday?: Birthday, image?: { uri: string }, allowsEditing?: boolean) => Promise<Contact>
Param Info:
  - contactId: Existing contact ID to edit
  - firstName: Pre-filled first name
  - lastName: Pre-filled last name
  - company: Pre-filled company
  - phoneNumbers: Pre-filled phone numbers
  - emails: Pre-filled email addresses
  - addresses: Pre-filled physical addresses
  - birthday: Pre-filled birthday
  - image: Pre-filled contact photo URI
  - allowsEditing: Whether to allow editing
`
    },
    
    selectContact: {
      name: "selectContact",
      description: "Shows contact picker UI.",
      documentation: `
Signature: () => Promise<Contact | null>
`
    }
  },
  
  types: {
    PhoneNumber: {
      type: "interface",
      description: "",
      properties: {
        label: "Phone type (mobile, home, work)",
        number: "Phone number"
      }
    },
    EmailAddress: {
      type: "interface",
      description: "Email address entry",
      properties: {
        label: "Email type (personal, work)",
        email: "Email address"
      }
    },
    Address: {
      type: "interface",
      description: "Physical address",
      properties: {
        label: "Address type (home, work)",
        street: "Street address",
        city: "City name",
        region: "State/province",
        postalCode: "Postal/ZIP code",
        country: "Country name"
      }
    },
    Birthday: {
      type: "interface",
      description: "Birthday information",
      properties: {
        day: "Day of month (1-31)",
        month: "Month (1-12)",
        year: "Full year"
      }
    },
    Contact: {
      type: "interface",
      description: "Contact information",
      properties: {
        id: "Contact unique ID",
        firstName: "First name",
        lastName: "Last name",
        company: "Company name",
        phoneNumbers: "Phone numbers",
        emails: "Email addresses",
        addresses: "Physical addresses",
        birthday: "Birthday",
        imageUri: "Contact photo URI"
      }
    }
  },
  
  example: `
await Native.contacts.requestPermission();
const contacts = await Native.contacts.getContacts();
const contact = await Native.contacts.selectContact();
`
};

// Export for module access
export default contacts;