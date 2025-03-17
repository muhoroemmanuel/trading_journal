// This is a simple service worker for handling push notifications

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body || "New notification from Trading Journal",
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      data: data.data || {},
      actions: data.actions || [],
    }

    event.waitUntil(self.registration.showNotification(data.title || "Trading Journal", options))
  }
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === "/" && "focus" in client) {
          return client.focus()
        }
      }

      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    }),
  )
})

