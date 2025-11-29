"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type {
  QRContent,
  URLContent,
  TextContent,
  EmailContent,
  SMSContent,
  PhoneContent,
  WiFiContent,
  VCardContent,
  EventContent,
  LocationContent,
} from "@/lib/qr-content-types"

interface ContentFormProps {
  content: QRContent
  onChange: (content: QRContent) => void
}

export function ContentForm({ content, onChange }: ContentFormProps) {
  const updateData = <T extends QRContent["data"]>(updates: Partial<T>) => {
    onChange({ ...content, data: { ...content.data, ...updates } } as QRContent)
  }

  switch (content.type) {
    case "url":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={(content.data as URLContent).url}
              onChange={(e) => updateData<URLContent>({ url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        </div>
      )

    case "text":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              value={(content.data as TextContent).text}
              onChange={(e) => updateData<TextContent>({ text: e.target.value })}
              placeholder="Enter your text here..."
              rows={4}
            />
          </div>
        </div>
      )

    case "email": {
      const data = content.data as EmailContent
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => updateData<EmailContent>({ email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject (optional)</Label>
            <Input
              id="subject"
              value={data.subject || ""}
              onChange={(e) => updateData<EmailContent>({ subject: e.target.value })}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message (optional)</Label>
            <Textarea
              id="body"
              value={data.body || ""}
              onChange={(e) => updateData<EmailContent>({ body: e.target.value })}
              placeholder="Email body"
              rows={3}
            />
          </div>
        </div>
      )
    }

    case "sms": {
      const data = content.data as SMSContent
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => updateData<SMSContent>({ phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={data.message || ""}
              onChange={(e) => updateData<SMSContent>({ message: e.target.value })}
              placeholder="Your message"
              rows={3}
            />
          </div>
        </div>
      )
    }

    case "phone":
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={(content.data as PhoneContent).phone}
              onChange={(e) => updateData<PhoneContent>({ phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
        </div>
      )

    case "wifi": {
      const data = content.data as WiFiContent
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network Name (SSID)</Label>
            <Input
              id="ssid"
              value={data.ssid}
              onChange={(e) => updateData<WiFiContent>({ ssid: e.target.value })}
              placeholder="MyWiFiNetwork"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => updateData<WiFiContent>({ password: e.target.value })}
              placeholder="WiFi password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="security">Security Type</Label>
            <Select
              value={data.security}
              onValueChange={(value: "WPA" | "WEP" | "nopass") => updateData<WiFiContent>({ security: value })}
            >
              <SelectTrigger id="security">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">No Password</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hidden">Hidden Network</Label>
            <Switch
              id="hidden"
              checked={data.hidden}
              onCheckedChange={(checked) => updateData<WiFiContent>({ hidden: checked })}
            />
          </div>
        </div>
      )
    }

    case "vcard": {
      const data = content.data as VCardContent
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => updateData<VCardContent>({ firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => updateData<VCardContent>({ lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="vcardEmail">Email</Label>
            <Input
              id="vcardEmail"
              type="email"
              value={data.email || ""}
              onChange={(e) => updateData<VCardContent>({ email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vcardPhone">Phone</Label>
            <Input
              id="vcardPhone"
              type="tel"
              value={data.phone || ""}
              onChange={(e) => updateData<VCardContent>({ phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={data.organization || ""}
              onChange={(e) => updateData<VCardContent>({ organization: e.target.value })}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={data.title || ""}
              onChange={(e) => updateData<VCardContent>({ title: e.target.value })}
              placeholder="Software Engineer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vcardUrl">Website</Label>
            <Input
              id="vcardUrl"
              type="url"
              value={data.url || ""}
              onChange={(e) => updateData<VCardContent>({ url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        </div>
      )
    }

    case "event": {
      const data = content.data as EventContent
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              value={data.title}
              onChange={(e) => updateData<EventContent>({ title: e.target.value })}
              placeholder="Meeting"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventLocation">Location</Label>
            <Input
              id="eventLocation"
              value={data.location || ""}
              onChange={(e) => updateData<EventContent>({ location: e.target.value })}
              placeholder="Conference Room A"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date/Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={data.startDate}
                onChange={(e) => updateData<EventContent>({ startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date/Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={data.endDate || ""}
                onChange={(e) => updateData<EventContent>({ endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Description</Label>
            <Textarea
              id="eventDescription"
              value={data.description || ""}
              onChange={(e) => updateData<EventContent>({ description: e.target.value })}
              placeholder="Event details..."
              rows={3}
            />
          </div>
        </div>
      )
    }

    case "location": {
      const data = content.data as LocationContent
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={data.latitude}
                onChange={(e) => updateData<LocationContent>({ latitude: e.target.value })}
                placeholder="40.7128"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={data.longitude}
                onChange={(e) => updateData<LocationContent>({ longitude: e.target.value })}
                placeholder="-74.0060"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name (optional)</Label>
            <Input
              id="locationName"
              value={data.name || ""}
              onChange={(e) => updateData<LocationContent>({ name: e.target.value })}
              placeholder="New York City"
            />
          </div>
        </div>
      )
    }

    default:
      return null
  }
}
