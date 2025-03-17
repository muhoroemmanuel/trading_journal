// This file contains functions for handling push notifications

// Function to subscribe to push notifications
export async function subscribeToNotifications() {
  try {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported in this browser")
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
    })

    // Check if push is supported
    if (!("PushManager" in window)) {
      throw new Error("Push notifications are not supported in this browser")
    }

    // Get existing subscription
    let subscription = await registration.pushManager.getSubscription()

    // If no subscription exists, create one
    if (!subscription) {
      // You would typically get this from your server in a real app
      // For demo purposes, we're using a placeholder
      const vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"

      // Convert the key to the format expected by the browser
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      // In a real app, you would send this subscription to your server
      console.log("Subscribed to push notifications:", subscription)
    }

    return subscription
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    throw error
  }
}

// Function to unsubscribe from push notifications
export async function unsubscribeFromNotifications() {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get push subscription
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      return true
    }

    // Unsubscribe
    const result = await subscription.unsubscribe()

    // In a real app, you would notify your server about the unsubscription
    console.log("Unsubscribed from push notifications")

    return result
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    throw error
  }
}

// Helper function to convert base64 to Uint8Array
// (required for applicationServerKey)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

// Function to send a notification (for demo purposes)
export function sendNotification(title: string, options: NotificationOptions = {}) {
  if (!("Notification" in window)) {
    console.error("Notifications not supported")
    return
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, options)
    return notification
  }
}

