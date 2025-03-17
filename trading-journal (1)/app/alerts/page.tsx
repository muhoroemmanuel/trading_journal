import PriceAlertForm from "@/components/price-alert-form"

export default function AlertsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Price Alerts</h1>
      <div className="max-w-2xl mx-auto">
        <PriceAlertForm />
      </div>
    </div>
  )
}

