export const CONTACT_FIELD_TYPES = ["text", "email", "textarea", "select", "checkbox"] as const;
export type ContactFieldType = (typeof CONTACT_FIELD_TYPES)[number];
export const RESERVED_CONTACT_KEYS = new Set(["name", "company", "email", "subject", "message", "website"]);

export function isContactFieldType(value: unknown): value is ContactFieldType {
  return typeof value === "string" && CONTACT_FIELD_TYPES.includes(value as ContactFieldType);
}

export function isValidFieldKey(value: string) {
  return /^[a-z][a-z0-9_]{1,63}$/.test(value) && !RESERVED_CONTACT_KEYS.has(value);
}