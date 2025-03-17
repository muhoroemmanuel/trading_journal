"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { PlusCircle, Save, Trash2, ChevronsUpDown, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

// Define types
interface Condition {
  id: string
  description: string
  confidence: number
  checked: boolean
}

interface Trade {
  id: string
  currencyPair: string
  action: "buy" | "sell"
  date: string
  conditions: Condition[]
  entryPrice: number
  stopLossPrice: number
  takeProfitPrice: number
  exitPrice?: number
  positionSize: number
  status: "open" | "closed"
  profitLoss?: number
  notes: string
}

// Predefined conditions
const buyConditions: Omit<Condition, "id" | "checked">[] = [
  { description: "Price above 200 EMA", confidence: 80 },
  { description: "RSI below 30", confidence: 75 },
  { description: "Bullish engulfing pattern", confidence: 85 },
  { description: "Support level holding", confidence: 70 },
]

const sellConditions: Omit<Condition, "id" | "checked">[] = [
  { description: "Price below 200 EMA", confidence: 80 },
  { description: "RSI above 70", confidence: 75 },
  { description: "Bearish engulfing pattern", confidence: 85 },
  { description: "Resistance level reached", confidence: 70 },
]

// Currency pairs
const initialCurrencyPairs = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP"]

export default function TradeJournal() {
  const [currencyPairs, setCurrencyPairs] = useState<string[]>([
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "USD/CHF",
    "AUD/USD",
    "USD/CAD",
    "NZD/USD",
    "EUR/GBP",
  ])
  const [customPairInput, setCustomPairInput] = useState<string>("")
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false)
  const [currencyPair, setCurrencyPair] = useState<string>("")
  const [action, setAction] = useState<"buy" | "sell" | "">("")
  const [conditions, setConditions] = useState<Condition[]>([])
  const [newCondition, setNewCondition] = useState<string>("")
  const [newConfidence, setNewConfidence] = useState<number>(50)
  const [open, setOpen] = useState(false)

  // New state for profit/loss tracking
  const [entryPrice, setEntryPrice] = useState<string>("")
  const [stopLossPrice, setStopLossPrice] = useState<string>("")
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>("")
  const [positionSize, setPositionSize] = useState<string>("")
  const [tradeStatus, setTradeStatus] = useState<"open" | "closed">("open")
  const [exitPrice, setExitPrice] = useState<string>("")

  // New state for journaling notes
  const [notes, setNotes] = useState<string>("")

  // Calculate potential profit/loss
  const calculatePotentialPL = () => {
    if (!entryPrice || !positionSize || !action) return { takeProfit: 0, stopLoss: 0 }

    const entry = Number.parseFloat(entryPrice)
    const tp = takeProfitPrice ? Number.parseFloat(takeProfitPrice) : 0
    const sl = stopLossPrice ? Number.parseFloat(stopLossPrice) : 0
    const size = Number.parseFloat(positionSize)

    let takeProfitPL = 0
    let stopLossPL = 0

    if (action === "buy") {
      // For buy: profit when price goes up, loss when price goes down
      takeProfitPL = tp > 0 ? (tp - entry) * size : 0
      stopLossPL = sl > 0 ? (sl - entry) * size : 0
    } else if (action === "sell") {
      // For sell: profit when price goes down, loss when price goes up
      takeProfitPL = tp > 0 ? (entry - tp) * size : 0
      stopLossPL = sl > 0 ? (entry - sl) * size : 0
    }

    return { takeProfit: takeProfitPL, stopLoss: stopLossPL }
  }

  // Calculate actual profit/loss for closed trades
  const calculateActualPL = () => {
    if (tradeStatus !== "closed" || !entryPrice || !exitPrice || !positionSize || !action) return 0

    const entry = Number.parseFloat(entryPrice)
    const exit = Number.parseFloat(exitPrice)
    const size = Number.parseFloat(positionSize)

    if (action === "buy") {
      return (exit - entry) * size
    } else {
      return (entry - exit) * size
    }
  }

  const potentialPL = calculatePotentialPL()
  const actualPL = calculateActualPL()

  // Load predefined conditions when action changes
  useEffect(() => {
    if (action === "buy") {
      setConditions(
        buyConditions.map((cond) => ({
          ...cond,
          id: crypto.randomUUID(),
          checked: false,
        })),
      )
    } else if (action === "sell") {
      setConditions(
        sellConditions.map((cond) => ({
          ...cond,
          id: crypto.randomUUID(),
          checked: false,
        })),
      )
    } else {
      setConditions([])
    }
  }, [action])

  // Load saved currency pairs from localStorage
  useEffect(() => {
    const savedPairs = JSON.parse(localStorage.getItem("currencyPairs") || "[]")
    if (savedPairs.length > 0) {
      setCurrencyPairs((prev) => {
        const uniquePairs = Array.from(new Set([...prev, ...savedPairs]))
        return uniquePairs
      })
    }
  }, [])

  // Add a new custom condition
  const addCondition = () => {
    if (!newCondition.trim()) {
      toast({
        title: "Error",
        description: "Condition description cannot be empty",
        variant: "destructive",
      })
      return
    }

    const condition: Condition = {
      id: crypto.randomUUID(),
      description: newCondition,
      confidence: newConfidence,
      checked: false,
    }

    setConditions([...conditions, condition])
    setNewCondition("")
    setNewConfidence(50)
  }

  // Toggle condition checked state
  const toggleCondition = (id: string) => {
    setConditions(conditions.map((cond) => (cond.id === id ? { ...cond, checked: !cond.checked } : cond)))
  }

  // Delete a condition
  const deleteCondition = (id: string) => {
    setConditions(conditions.filter((cond) => cond.id !== id))
  }

  // Save the trade
  const saveTrade = () => {
    if (!currencyPair) {
      toast({
        title: "Error",
        description: "Please select a currency pair",
        variant: "destructive",
      })
      return
    }

    if (!action) {
      toast({
        title: "Error",
        description: "Please select an action (buy/sell)",
        variant: "destructive",
      })
      return
    }

    if (!entryPrice) {
      toast({
        title: "Error",
        description: "Please enter an entry price",
        variant: "destructive",
      })
      return
    }

    if (!positionSize) {
      toast({
        title: "Error",
        description: "Please enter a position size",
        variant: "destructive",
      })
      return
    }

    if (!conditions.some((cond) => cond.checked)) {
      toast({
        title: "Error",
        description: "Please select at least one condition",
        variant: "destructive",
      })
      return
    }

    // Calculate profit/loss
    let profitLoss = undefined
    if (tradeStatus === "closed" && exitPrice) {
      profitLoss = calculateActualPL()
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      currencyPair,
      action,
      date: new Date().toISOString(),
      conditions: conditions.filter((cond) => cond.checked),
      entryPrice: Number.parseFloat(entryPrice),
      stopLossPrice: stopLossPrice ? Number.parseFloat(stopLossPrice) : 0,
      takeProfitPrice: takeProfitPrice ? Number.parseFloat(takeProfitPrice) : 0,
      exitPrice: exitPrice ? Number.parseFloat(exitPrice) : undefined,
      positionSize: Number.parseFloat(positionSize),
      status: tradeStatus,
      profitLoss,
      notes: notes.trim(),
    }

    // Get existing trades from localStorage
    const existingTrades = JSON.parse(localStorage.getItem("trades") || "[]")

    // Add new trade
    localStorage.setItem("trades", JSON.stringify([...existingTrades, trade]))

    // Save currency pairs to localStorage
    localStorage.setItem("currencyPairs", JSON.stringify(currencyPairs))

    toast({
      title: "Success",
      description: "Trade saved successfully",
    })

    // Reset form
    setCurrencyPair("")
    setAction("")
    setConditions([])
    setEntryPrice("")
    setStopLossPrice("")
    setTakeProfitPrice("")
    setPositionSize("")
    setTradeStatus("open")
    setExitPrice("")
    setNotes("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Trade Entry</CardTitle>
        <CardDescription>Record your trade details and conditions</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency-pair">Currency Pair</Label>
            {!showCustomInput ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    id="currency-pair"
                  >
                    {currencyPair ? currencyPair : "Select currency pair"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search currency pair..." />
                    <CommandList>
                      <CommandEmpty>No currency pair found.</CommandEmpty>
                      <CommandGroup>
                        {currencyPairs.map((pair) => (
                          <CommandItem
                            key={pair}
                            value={pair}
                            onSelect={(value) => {
                              setCurrencyPair(value === currencyPair ? "" : value)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", currencyPair === pair ? "opacity-100" : "opacity-0")}
                            />
                            {pair}
                          </CommandItem>
                        ))}
                        <CommandItem
                          value="custom-new-pair"
                          onSelect={() => {
                            setShowCustomInput(true)
                            setCurrencyPair("")
                            setOpen(false)
                          }}
                          className="text-primary"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Custom Pair
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g. BTC/USD"
                    value={customPairInput}
                    onChange={(e) => setCustomPairInput(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (customPairInput.trim()) {
                        const newPair = customPairInput.trim()
                        if (!currencyPairs.includes(newPair)) {
                          setCurrencyPairs([...currencyPairs, newPair])
                        }
                        setCurrencyPair(newPair)
                        setCustomPairInput("")
                        setShowCustomInput(false)
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomPairInput("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={(value: "buy" | "sell") => setAction(value)}>
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price and Position Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-4">Trade Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-price">Entry Price</Label>
              <Input
                id="entry-price"
                type="number"
                step="0.00001"
                placeholder="Enter entry price"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position-size">Position Size (Units/Lots)</Label>
              <Input
                id="position-size"
                type="number"
                step="0.01"
                placeholder="Enter position size"
                value={positionSize}
                onChange={(e) => setPositionSize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss Price</Label>
              <Input
                id="stop-loss"
                type="number"
                step="0.00001"
                placeholder="Enter stop loss price"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="take-profit">Take Profit Price</Label>
              <Input
                id="take-profit"
                type="number"
                step="0.00001"
                placeholder="Enter take profit price"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-status">Trade Status</Label>
              <Select value={tradeStatus} onValueChange={(value: "open" | "closed") => setTradeStatus(value)}>
                <SelectTrigger id="trade-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tradeStatus === "closed" && (
              <div className="space-y-2">
                <Label htmlFor="exit-price">Exit Price</Label>
                <Input
                  id="exit-price"
                  type="number"
                  step="0.00001"
                  placeholder="Enter exit price"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Profit/Loss Summary */}
          {action && entryPrice && positionSize && (
            <div className="mt-4 p-3 border rounded-md bg-muted/30">
              <h4 className="font-medium mb-2">Profit/Loss Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {tradeStatus === "open" ? (
                  <>
                    <div className="flex justify-between">
                      <span>Potential Profit (Take Profit):</span>
                      <span
                        className={
                          potentialPL.takeProfit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
                        }
                      >
                        {potentialPL.takeProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential Loss (Stop Loss):</span>
                      <span
                        className={
                          potentialPL.stopLoss >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
                        }
                      >
                        {potentialPL.stopLoss.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk/Reward Ratio:</span>
                      <span className="font-medium">
                        {potentialPL.stopLoss !== 0 && potentialPL.takeProfit !== 0
                          ? `1:${Math.abs(potentialPL.takeProfit / potentialPL.stopLoss).toFixed(2)}`
                          : "N/A"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between col-span-2">
                    <span>Actual Profit/Loss:</span>
                    <span className={actualPL >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {actualPL.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trading Journal Notes */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-lg font-medium">
              Journal Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Document your thoughts about this trade: market sentiment, reasons for entry, potential mistakes, lessons learned..."
              className="min-h-[120px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {action && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{action === "buy" ? "Buy" : "Sell"} Conditions</h3>
              <div className="space-y-2">
                {conditions.map((condition) => (
                  <div key={condition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.id}
                      checked={condition.checked}
                      onCheckedChange={() => toggleCondition(condition.id)}
                    />
                    <Label htmlFor={condition.id} className="flex-1">
                      {condition.description}
                    </Label>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {condition.confidence}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCondition(condition.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete condition</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Add Custom Condition</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition Description</Label>
                  <Input
                    id="condition"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Enter your condition"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="confidence">Confidence Level: {newConfidence}%</Label>
                  </div>
                  <Slider
                    id="confidence"
                    min={0}
                    max={100}
                    step={1}
                    value={[newConfidence]}
                    onValueChange={(values) => setNewConfidence(values[0])}
                  />
                </div>

                <Button type="button" variant="outline" onClick={addCondition} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Condition
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={saveTrade} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Trade
        </Button>
      </CardFooter>
    </Card>
  )
}

