import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TradeJournal from "@/components/trade-journal"
import Portfolio from "@/components/portfolio"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">Trading Journal</h1>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted dark:bg-secondary">
          <TabsTrigger
            value="journal"
            className="data-[state=active]:bg-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:text-foreground"
          >
            Journal
          </TabsTrigger>
          <TabsTrigger
            value="portfolio"
            className="data-[state=active]:bg-background dark:data-[state=active]:bg-white dark:data-[state=active]:text-black data-[state=active]:text-foreground"
          >
            Portfolio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <TradeJournal />
        </TabsContent>

        <TabsContent value="portfolio">
          <Portfolio />
        </TabsContent>
      </Tabs>
    </main>
  )
}

