import type { ContactsAPI } from "@/modules/module_types/contacts";

// Check if we're in a browser environment
const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const STORAGE_KEYS = {
  CONTACTS: "appfactory_contacts",
  NEXT_CONTACT_ID: "appfactory_next_contact_id",
};

interface StoredContact {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phoneNumbers?: { label: string; number: string }[];
  emails?: { label: string; email: string }[];
  addresses?: {
    label: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  }[];
  birthday?: { day: number; month: number; year: number };
  imageUri?: string;
}

const getStoredContacts = (): StoredContact[] => {
  if (!isBrowser) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return stored ? JSON.parse(stored) : [];
};

const saveContacts = (contacts: StoredContact[]): void => {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
};

const generateContactId = (): string => {
  if (!isBrowser) return `contact_${Date.now()}`;

  const nextId = localStorage.getItem(STORAGE_KEYS.NEXT_CONTACT_ID);
  const id = nextId ? parseInt(nextId) + 1 : 1;
  localStorage.setItem(STORAGE_KEYS.NEXT_CONTACT_ID, id.toString());
  return `contact_${id}`;
};

const filterContacts = (
  contacts: StoredContact[],
  fields?: string[],
  searchName?: string
): StoredContact[] => {
  let filtered = contacts;

  // Filter by search name if provided
  if (searchName) {
    const searchLower = searchName.toLowerCase();
    filtered = contacts.filter((contact) => {
      const fullName = `${contact.firstName || ""} ${
        contact.lastName || ""
      }`.toLowerCase();
      const company = (contact.company || "").toLowerCase();
      return fullName.includes(searchLower) || company.includes(searchLower);
    });
  }

  // Return only requested fields if specified
  if (fields && fields.length > 0) {
    return filtered.map((contact) => {
      const result: StoredContact = { id: contact.id };
      fields.forEach((field) => {
        if (field in contact) {
          (result as unknown as Record<string, unknown>)[field] =
            contact[field as keyof StoredContact];
        }
      });
      return result;
    });
  }

  return filtered;
};

export const contacts: ContactsAPI = {
  requestPermission: async () => {
    console.log("[WEB] Contacts requestPermission");
    // In a web environment, we don't need special permissions for contact storage
    return true;
  },

  getContacts: async (fields?: string[], searchName?: string) => {
    console.log(
      `[WEB] Contacts getContacts: ${searchName || "all"}, fields: ${
        fields?.join(",") || "all"
      }`
    );

    const allContacts = getStoredContacts();
    return filterContacts(allContacts, fields, searchName);
  },

  getContactById: async (id: string) => {
    console.log(`[WEB] Contacts getContactById: ${id}`);

    const contacts = getStoredContacts();
    const contact = contacts.find((c) => c.id === id);
    return contact || null;
  },

  addContact: async (
    firstName?: string,
    lastName?: string,
    company?: string,
    phoneNumbers?: { label: string; number: string }[],
    emails?: { label: string; email: string }[],
    addresses?: {
      label: string;
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    }[],
    birthday?: { day: number; month: number; year: number },
    image?: { uri: string }
  ) => {
    console.log(`[WEB] Contacts addContact: ${firstName} ${lastName}`);

    if (!isBrowser) {
      throw new Error("Contact operations require a browser environment");
    }

    const id = generateContactId();
    const newContact: StoredContact = {
      id,
      firstName,
      lastName,
      company,
      phoneNumbers,
      emails,
      addresses,
      birthday,
      imageUri: image?.uri,
    };

    const contacts = getStoredContacts();
    contacts.push(newContact);
    saveContacts(contacts);

    return id;
  },

  updateContact: async (
    id: string,
    firstName?: string,
    lastName?: string,
    company?: string,
    phoneNumbers?: { label: string; number: string }[],
    emails?: { label: string; email: string }[],
    addresses?: {
      label: string;
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    }[],
    birthday?: { day: number; month: number; year: number },
    image?: { uri: string }
  ) => {
    console.log(`[WEB] Contacts updateContact: ${id}`);

    if (!isBrowser) {
      throw new Error("Contact operations require a browser environment");
    }

    const contacts = getStoredContacts();
    const contactIndex = contacts.findIndex((c) => c.id === id);

    if (contactIndex === -1) {
      throw new Error(`Contact with id ${id} not found`);
    }

    const contact = contacts[contactIndex];
    if (firstName !== undefined) contact.firstName = firstName;
    if (lastName !== undefined) contact.lastName = lastName;
    if (company !== undefined) contact.company = company;
    if (phoneNumbers !== undefined) contact.phoneNumbers = phoneNumbers;
    if (emails !== undefined) contact.emails = emails;
    if (addresses !== undefined) contact.addresses = addresses;
    if (birthday !== undefined) contact.birthday = birthday;
    if (image !== undefined) contact.imageUri = image.uri;

    saveContacts(contacts);
    return id;
  },

  deleteContact: async (id: string) => {
    console.log(`[WEB] Contacts deleteContact: ${id}`);

    if (!isBrowser) {
      throw new Error("Contact operations require a browser environment");
    }

    const contacts = getStoredContacts();
    const filteredContacts = contacts.filter((c) => c.id !== id);

    if (filteredContacts.length === contacts.length) {
      return false; // Contact not found
    }

    saveContacts(filteredContacts);
    return true;
  },

  presentContactForm: async (
    contactId?: string,
    firstName?: string,
    lastName?: string,
    company?: string,
    phoneNumbers?: { label: string; number: string }[],
    emails?: { label: string; email: string }[],
    addresses?: {
      label: string;
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    }[],
    birthday?: { day: number; month: number; year: number },
    image?: { uri: string },
    allowsEditing?: boolean
  ) => {
    console.log(
      `[WEB] Contacts presentContactForm: ${contactId || "new contact"}`
    );

    // Simulate a contact form dialog
    const isEditing = !!contactId;

    if (isEditing && !allowsEditing) {
      // Just display the contact details
      const contact = await contacts.getContactById(contactId);
      if (!contact) {
        throw new Error(`Contact with id ${contactId} not found`);
      }
      return contact;
    }

    // Simulate user input
    const userFirstName =
      firstName || prompt("First Name:", firstName || "") || "";
    const userLastName = lastName || prompt("Last Name:", lastName || "") || "";
    const userCompany = company || prompt("Company:", company || "") || "";

    const contactData = {
      firstName: userFirstName,
      lastName: userLastName,
      company: userCompany,
      phoneNumbers,
      emails,
      addresses,
      birthday,
      image,
    };

    try {
      let id: string;
      if (isEditing) {
        id = await contacts.updateContact(
          contactId,
          contactData.firstName,
          contactData.lastName,
          contactData.company,
          contactData.phoneNumbers,
          contactData.emails,
          contactData.addresses,
          contactData.birthday,
          contactData.image
        );
      } else {
        id = await contacts.addContact(
          contactData.firstName,
          contactData.lastName,
          contactData.company,
          contactData.phoneNumbers,
          contactData.emails,
          contactData.addresses,
          contactData.birthday,
          contactData.image
        );
      }

      return {
        id,
        ...contactData,
        action: isEditing ? "updated" : "created",
      };
    } catch {
      throw new Error("Contact form was cancelled");
    }
  },

  selectContact: async () => {
    console.log("[WEB] Contacts selectContact");

    const allContacts = getStoredContacts();

    if (allContacts.length === 0) {
      return null;
    }

    // Simulate a contact picker dialog
    const contactNames = allContacts.map(
      (c) => `${c.firstName || ""} ${c.lastName || ""} (${c.id})`
    );
    const selection = prompt(
      `Select a contact:\n${contactNames.join("\n")}\n\nEnter contact ID:`
    );

    if (!selection) {
      return null;
    }

    const selectedContact = allContacts.find(
      (c) =>
        c.id === selection ||
        `${c.firstName || ""} ${c.lastName || ""}`.trim() === selection
    );

    return selectedContact || null;
  },
};
