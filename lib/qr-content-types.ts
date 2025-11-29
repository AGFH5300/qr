// QR Content type definitions and formatters

export type QRContentType = "url" | "text" | "email" | "sms" | "phone" | "wifi" | "vcard" | "event" | "location"

export interface ContentTypeOption {
  id: QRContentType
  name: string
  icon: string
  description: string
}

export const contentTypes: ContentTypeOption[] = [
  { id: "url", name: "URL", icon: "Globe", description: "Website link" },
  { id: "text", name: "Text", icon: "Type", description: "Plain text" },
  { id: "email", name: "Email", icon: "Mail", description: "Email address" },
  { id: "sms", name: "SMS", icon: "MessageSquare", description: "Text message" },
  { id: "phone", name: "Phone", icon: "Phone", description: "Phone number" },
  { id: "wifi", name: "WiFi", icon: "Wifi", description: "WiFi network" },
  { id: "vcard", name: "vCard", icon: "User", description: "Contact card" },
  { id: "event", name: "Event", icon: "Calendar", description: "Calendar event" },
  { id: "location", name: "Location", icon: "MapPin", description: "GPS location" },
]

export interface URLContent {
  url: string
}

export interface TextContent {
  text: string
}

export interface EmailContent {
  email: string
  subject?: string
  body?: string
}

export interface SMSContent {
  phone: string
  message?: string
}

export interface PhoneContent {
  phone: string
}

export interface WiFiContent {
  ssid: string
  password: string
  security: "WPA" | "WEP" | "nopass"
  hidden: boolean
}

export interface VCardContent {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  organization?: string
  title?: string
  url?: string
  address?: string
}

export interface EventContent {
  title: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
}

export interface LocationContent {
  latitude: string
  longitude: string
  name?: string
}

export type QRContent =
  | { type: "url"; data: URLContent }
  | { type: "text"; data: TextContent }
  | { type: "email"; data: EmailContent }
  | { type: "sms"; data: SMSContent }
  | { type: "phone"; data: PhoneContent }
  | { type: "wifi"; data: WiFiContent }
  | { type: "vcard"; data: VCardContent }
  | { type: "event"; data: EventContent }
  | { type: "location"; data: LocationContent }

export function formatQRContent(content: QRContent): string {
  switch (content.type) {
    case "url":
      return content.data.url

    case "text":
      return content.data.text

    case "email": {
      const { email, subject, body } = content.data
      let mailto = `mailto:${email}`
      const params: string[] = []
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
      if (body) params.push(`body=${encodeURIComponent(body)}`)
      if (params.length) mailto += `?${params.join("&")}`
      return mailto
    }

    case "sms": {
      const { phone, message } = content.data
      return message ? `smsto:${phone}:${message}` : `tel:${phone}`
    }

    case "phone":
      return `tel:${content.data.phone}`

    case "wifi": {
      const { ssid, password, security, hidden } = content.data
      return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`
    }

    case "vcard": {
      const { firstName, lastName, email, phone, organization, title, url, address } = content.data

      // Use CRLF line endings for maximum vCard scanner compatibility
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `FN:${[firstName, lastName].filter(Boolean).join(" ") || firstName || lastName}`,
      ]

      if (organization) lines.push(`ORG:${organization}`)
      if (title) lines.push(`TITLE:${title}`)
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`)
      if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`)
      if (url) lines.push(`URL:${url}`)
      if (address) lines.push(`ADR:;;${address};;;;`)

      lines.push("END:VCARD")
      return `${lines.join("\r\n")}\r\n`
    }

    case "event": {
      const { title, location, startDate, endDate, description } = content.data
      const formatDate = (date: string) => date.replace(/[-:]/g, "").replace(".000", "")
      const lines = ["BEGIN:VEVENT", `SUMMARY:${title}`, `DTSTART:${formatDate(startDate)}`]
      if (endDate) lines.push(`DTEND:${formatDate(endDate)}`)
      if (location) lines.push(`LOCATION:${location}`)
      if (description) lines.push(`DESCRIPTION:${description}`)
      lines.push("END:VEVENT")
      return `BEGIN:VCALENDAR\nVERSION:2.0\n${lines.join("\n")}\nEND:VCALENDAR`
    }

    case "location": {
      const { latitude, longitude, name } = content.data
      return name ? `geo:${latitude},${longitude}?q=${encodeURIComponent(name)}` : `geo:${latitude},${longitude}`
    }

    default:
      return ""
  }
}

export function getDefaultContent(type: QRContentType): QRContent {
  switch (type) {
    case "url":
      return { type: "url", data: { url: "https://example.com" } }
    case "text":
      return { type: "text", data: { text: "" } }
    case "email":
      return { type: "email", data: { email: "", subject: "", body: "" } }
    case "sms":
      return { type: "sms", data: { phone: "", message: "" } }
    case "phone":
      return { type: "phone", data: { phone: "" } }
    case "wifi":
      return { type: "wifi", data: { ssid: "", password: "", security: "WPA", hidden: false } }
    case "vcard":
      return {
        type: "vcard",
        data: { firstName: "", lastName: "", email: "", phone: "", organization: "", title: "", url: "", address: "" },
      }
    case "event":
      return { type: "event", data: { title: "", location: "", startDate: "", endDate: "", description: "" } }
    case "location":
      return { type: "location", data: { latitude: "", longitude: "", name: "" } }
    default:
      return { type: "url", data: { url: "" } }
  }
}
