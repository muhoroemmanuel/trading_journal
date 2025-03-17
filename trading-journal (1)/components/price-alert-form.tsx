"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { AlertTriangle, Bell } from "lucide-react"
import { sendNotification } from "@/lib/notifications"

interface PriceAlert {
  id: string
  currencyPair: string
  price: number
  condition: "above" | "below"
  triggered: boolean
}

export default function PriceAlertForm() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [currencyPair, setCurrencyPair] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [condition, setCondition] = useState<"above" | "below">("above")
  const [currencyPairs, setCurrencyPairs] = useState<string[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Load saved alerts and currency pairs
  useEffect(() => {
    const savedAlerts = JSON.parse(localStorage.getItem("priceAlerts") || "[]")
    setAlerts(savedAlerts)

    const savedPairs = JSON.parse(localStorage.getItem("currencyPairs") || "[]")
    const defaultPairs = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP"]
    setCurrencyPairs([...new Set([...defaultPairs, ...savedPairs])])

    // Check if notifications are enabled
    const settings = JSON.parse(localStorage.getItem("notificationSettings") || "{}")
    setNotificationsEnabled(settings.pushEnabled || settings.emailEnabled || false)
  }, [])

  // Save alerts when they change
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(alerts))
  }, [alerts])

  // Add a new price alert
  const addAlert = () => {
    if (!currencyPair) {
      toast({
        title: "Error",
        description: "Please select a currency pair",
        variant: "destructive",
      })
      return
    }

    if (!price || isNaN(Number.parseFloat(price)) || Number.parseFloat(price) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      currencyPair,
      price: Number.parseFloat(price),
      condition,
      triggered: false,
    }

    setAlerts([...alerts, newAlert])

    toast({
      title: "Alert Created",
      description: `You will be notified when ${currencyPair} goes ${condition} ${price}`,
    })

    // Reset form
    setPrice("")
  }

  // Delete an alert
  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))

    toast({
      title: "Alert Deleted",
      description: "Price alert has been removed",
    })
  }

  // Simulate triggering an alert (for demo purposes)
  const simulateAlert = (alert: PriceAlert) => {
    // Mark alert as triggered
    setAlerts(alerts.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a)))

    // Send notification
    if (Notification.permission === "granted") {
      sendNotification(`${alert.currencyPair} Price Alert`, {
        body: `${alert.currencyPair} is now ${alert.condition} ${alert.price}`,
        icon: "/favicon.ico",
      })
    }

    toast({
      title: "Alert Triggered",
      description: `${alert.currencyPair} is now ${alert.condition} ${alert.price}`,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Price Alerts
        </CardTitle>
        <CardDescription>Get notified when currency pairs reach specific price levels</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!notificationsEnabled && (
          <div className="flex items-center p-3 text-sm border rounded-md bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>Notifications are disabled. Enable them in Settings to receive price alerts.</p>
          </div>
        )}

        {/* Active alerts */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Active Alerts</h3>

          {alerts.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No active price alerts. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 border rounded-md ${
                    alert.triggered
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Bell className={`h-4 w-4 ${alert.triggered ? "text-green-500" : "text-primary"}`} />
                    <div>
                      <p className="font-medium">{alert.currencyPair}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.condition === "above" ? "Above" : "Below"} {alert.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!alert.triggered && (
                      <Button variant="outline" size="sm" onClick={() => simulateAlert(alert)}>
                        Simulate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

