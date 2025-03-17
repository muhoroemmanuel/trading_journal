"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Bell, Mail, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { subscribeToNotifications, unsubscribeFromNotifications } from "@/lib/notifications"

interface NotificationSettings {
  email: string
  emailEnabled: boolean
  pushEnabled: boolean
  priceAlerts: boolean
  tradeUpdates: boolean
  journalReminders: boolean
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: "",
    emailEnabled: false,
    pushEnabled: false,
    priceAlerts: true,
    tradeUpdates: true,
    journalReminders: true,
  })

  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")

  // Load saved settings
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Check if push notifications are supported
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }
  }, [])

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
  }, [settings])

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, email: e.target.value })
  }

  // Toggle email notifications
  const toggleEmailNotifications = (checked: boolean) => {
    if (checked && !isValidEmail(settings.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setSettings({ ...settings, emailEnabled: checked })

    if (checked) {
      toast({
        title: "Email Notifications Enabled",
        description: "You will now receive email notifications",
      })
    }
  }

  // Toggle push notifications
  const togglePushNotifications = async (checked: boolean) => {
    if (checked) {
      try {
        // Request permission if not already granted
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission()
          setPushPermission(permission)

          if (permission !== "granted") {
            toast({
              title: "Permission Denied",
              description: "You need to allow notifications in your browser settings",
              variant: "destructive",
            })
            return
          }
        }

        // Subscribe to push notifications
        await subscribeToNotifications()

        setSettings({ ...settings, pushEnabled: true })
        toast({
          title: "Push Notifications Enabled",
          description: "You will now receive push notifications",
        })
      } catch (error) {
        console.error("Error subscribing to push notifications:", error)
        toast({
          title: "Subscription Failed",
          description: "Could not subscribe to push notifications",
          variant: "destructive",
        })
      }
    } else {
      try {
        // Unsubscribe from push notifications
        await unsubscribeFromNotifications()

        setSettings({ ...settings, pushEnabled: false })
        toast({
          title: "Push Notifications Disabled",
          description: "You will no longer receive push notifications",
        })
      } catch (error) {
        console.error("Error unsubscribing from push notifications:", error)
      }
    }
  }

  // Toggle notification types
  const toggleNotificationType = (
    type: keyof Pick<NotificationSettings, "priceAlerts" | "tradeUpdates" | "journalReminders">,
  ) => {
    setSettings({ ...settings, [type]: !settings[type] })
  }

  // Validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Test notification
  const sendTestNotification = () => {
    if (settings.pushEnabled && Notification.permission === "granted") {
      const notification = new Notification("Trading Journal Test", {
        body: "This is a test notification from your Trading Journal",
        icon: "/favicon.ico",
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    toast({
      title: "Test Notification Sent",
      description: settings.pushEnabled
        ? "A push notification has been sent"
        : "Push notifications are disabled. Enable them to receive notifications.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>Configure how and when you want to be notified about your trades</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-medium">Email Notifications</h3>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={toggleEmailNotifications}
              disabled={!settings.email && !settings.emailEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={settings.email}
              onChange={handleEmailChange}
            />
            <p className="text-sm text-muted-foreground">We'll send notifications to this email address</p>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <h3 className="text-lg font-medium">Push Notifications</h3>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={togglePushNotifications}
              disabled={!pushSupported}
            />
          </div>

          {!pushSupported && (
            <div className="flex items-center p-3 text-sm border rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Push notifications are not supported in your browser</p>
            </div>
          )}

          {pushSupported && pushPermission === "denied" && (
            <div className="flex items-center p-3 text-sm border rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Notifications are blocked. Please update your browser settings to allow notifications.</p>
            </div>
          )}

          {pushSupported && settings.pushEnabled && (
            <Button variant="outline" size="sm" onClick={sendTestNotification}>
              Send Test Notification
            </Button>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">What to Notify Me About</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <Label htmlFor="price-alerts" className="cursor-pointer">
                  Price Alerts
                </Label>
              </div>
              <Switch
                id="price-alerts"
                checked={settings.priceAlerts}
                onCheckedChange={() => toggleNotificationType("priceAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-blue-500" />
                <Label htmlFor="trade-updates" className="cursor-pointer">
                  Trade Updates
                </Label>
              </div>
              <Switch
                id="trade-updates"
                checked={settings.tradeUpdates}
                onCheckedChange={() => toggleNotificationType("tradeUpdates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <Label htmlFor="journal-reminders" className="cursor-pointer">
                  Journal Reminders
                </Label>
              </div>
              <Switch
                id="journal-reminders"
                checked={settings.journalReminders}
                onCheckedChange={() => toggleNotificationType("journalReminders")}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

