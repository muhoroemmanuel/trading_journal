import NotificationSettings from "@/components/notification-settings"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="max-w-2xl mx-auto">
        <NotificationSettings />
      </div>
    </div>
  )
}

