"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowUpCircle, ArrowDownCircle, Trash2, DollarSign, BookOpen, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export default function Portfolio() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [importData, setImportData] = useState<string>("")
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)

  // Load trades from localStorage
  useEffect(() => {
    const storedTrades = JSON.parse(localStorage.getItem("trades") || "[]")
    setTrades(storedTrades)
  }, [])

  // Filter trades based on selection
  const filteredTrades = trades
    .filter((trade) => filter === "all" || trade.currencyPair === filter)
    .filter((trade) => statusFilter === "all" || trade.status === statusFilter)

  // Get unique currency pairs for filter
  const uniquePairs = Array.from(new Set(trades.map((trade) => trade.currencyPair)))

  // Delete a trade
  const deleteTrade = (id: string) => {
    const updatedTrades = trades.filter((trade) => trade.id !== id)
    setTrades(updatedTrades)
    localStorage.setItem("trades", JSON.stringify(updatedTrades))
    toast({
      title: "Success",
      description: "Trade deleted successfully",
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  // Calculate average confidence
  const getAverageConfidence = (conditions: Condition[]) => {
    if (conditions.length === 0) return 0
    const sum = conditions.reduce((acc, cond) => acc + cond.confidence, 0)
    return Math.round(sum / conditions.length)
  }

  // Calculate potential profit/loss for open trades
  const calculatePotentialPL = (trade: Trade) => {
    if (trade.status === "closed" || !trade.entryPrice || !trade.positionSize) {
      return { takeProfit: 0, stopLoss: 0 }
    }

    const entry = trade.entryPrice
    const tp = trade.takeProfitPrice || 0
    const sl = trade.stopLossPrice || 0
    const size = trade.positionSize

    let takeProfitPL = 0
    let stopLossPL = 0

    if (trade.action === "buy") {
      takeProfitPL = tp > 0 ? (tp - entry) * size : 0
      stopLossPL = sl > 0 ? (sl - entry) * size : 0
    } else if (trade.action === "sell") {
      takeProfitPL = tp > 0 ? (entry - tp) * size : 0
      stopLossPL = sl > 0 ? (entry - sl) * size : 0
    }

    return { takeProfit: takeProfitPL, stopLoss: stopLossPL }
  }

  // Export trades to CSV
  const exportToCSV = () => {
    if (trades.length === 0) {
      toast({
        title: "Error",
        description: "No trades to export",
        variant: "destructive",
      })
      return
    }

    // Define CSV headers
    const headers = [
      "ID",
      "Currency Pair",
      "Action",
      "Date",
      "Entry Price",
      "Stop Loss",
      "Take Profit",
      "Exit Price",
      "Position Size",
      "Status",
      "Profit/Loss",
      "Conditions",
      "Notes",
    ]

    // Convert trades to CSV rows
    const csvRows = trades.map((trade) => {
      const conditionsText = trade.conditions.map((c) => `${c.description} (${c.confidence}%)`).join("; ")

      return [
        trade.id,
        trade.currencyPair,
        trade.action,
        trade.date,
        trade.entryPrice,
        trade.stopLossPrice,
        trade.takeProfitPrice,
        trade.exitPrice || "",
        trade.positionSize,
        trade.status,
        trade.profitLoss || "",
        conditionsText,
        // Escape quotes in notes to prevent CSV issues
        trade.notes ? `"${trade.notes.replace(/"/g, '""')}"` : "",
      ]
    })

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n")

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `trading-journal-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Trades exported successfully",
    })
  }

  // Export trades to JSON
  const exportToJSON = () => {
    if (trades.length === 0) {
      toast({
        title: "Error",
        description: "No trades to export",
        variant: "destructive",
      })
      return
    }

    const jsonContent = JSON.stringify(trades, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `trading-journal-export-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Trades exported successfully as JSON",
    })
  }

  // Import trades from JSON
  const importFromJSON = () => {
    try {
      const importedTrades = JSON.parse(importData)

      // Validate imported data
      if (!Array.isArray(importedTrades)) {
        throw new Error("Invalid import data: not an array")
      }

      // Basic validation of each trade
      importedTrades.forEach((trade) => {
        if (!trade.id || !trade.currencyPair || !trade.action || !trade.date) {
          throw new Error("Invalid trade data: missing required fields")
        }
      })

      // Merge with existing trades, avoiding duplicates
      const existingIds = new Set(trades.map((t) => t.id))
      const newTrades = importedTrades.filter((t) => !existingIds.has(t.id))
      const updatedTrades = [...trades, ...newTrades]

      // Update state and localStorage
      setTrades(updatedTrades)
      localStorage.setItem("trades", JSON.stringify(updatedTrades))

      toast({
        title: "Success",
        description: `Imported ${newTrades.length} new trades`,
      })

      setImportData("")
      setShowImportDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: `Import failed: ${error instanceof Error ? error.message : "Invalid data format"}`,
        variant: "destructive",
      })
    }
  }

  // Handle file upload for import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Trade Portfolio</CardTitle>
            <CardDescription>View and manage your saved trades</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON}>
                <Download className="h-4 w-4 mr-2" />
                Export to JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import from JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="filter">Filter by Currency Pair</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger id="filter">
                  <SelectValue placeholder="Filter by currency pair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pairs</SelectItem>
                  {uniquePairs.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trades found. Add some trades in the Journal tab.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTrades.map((trade) => (
                <Card key={trade.id} className="overflow-hidden">
                  <div className={`h-2 ${trade.action === "buy" ? "bg-green-500" : "bg-red-500"}`} />
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-base font-bold">{trade.currencyPair}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(trade.date)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={trade.action === "buy" ? "default" : "destructive"}
                          className="flex items-center text-xs py-0 h-5"
                        >
                          {trade.action === "buy" ? (
                            <ArrowUpCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <ArrowDownCircle className="mr-1 h-3 w-3" />
                          )}
                          {trade.action.toUpperCase()}
                        </Badge>
                        <Badge variant={trade.status === "open" ? "outline" : "secondary"} className="text-xs py-0 h-5">
                          {trade.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mb-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry:</span>
                        <span>{trade.entryPrice.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{trade.positionSize}</span>
                      </div>
                      {trade.stopLossPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stop Loss:</span>
                          <span>{trade.stopLossPrice.toFixed(5)}</span>
                        </div>
                      )}
                      {trade.takeProfitPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Take Profit:</span>
                          <span>{trade.takeProfitPrice.toFixed(5)}</span>
                        </div>
                      )}
                      {trade.exitPrice && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Exit:</span>
                          <span>{trade.exitPrice.toFixed(5)}</span>
                        </div>
                      )}
                    </div>

                    {/* Profit/Loss Display */}
                    <div className="mb-2">
                      {trade.status === "closed" && trade.profitLoss !== undefined ? (
                        <div
                          className={`flex items-center justify-between p-1.5 rounded-md ${
                            trade.profitLoss >= 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}
                        >
                          <span className="font-medium text-xs flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            P/L:
                          </span>
                          <span className="font-bold text-xs">
                            {trade.profitLoss >= 0 ? "+" : ""}
                            {trade.profitLoss.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1">
                          {(() => {
                            const potential = calculatePotentialPL(trade)
                            return (
                              <>
                                <div
                                  className={`p-1 rounded-md text-center text-xs ${
                                    potential.takeProfit >= 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  }`}
                                >
                                  TP: {potential.takeProfit.toFixed(2)}
                                </div>
                                <div
                                  className={`p-1 rounded-md text-center text-xs ${
                                    potential.stopLoss >= 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  }`}
                                >
                                  SL: {potential.stopLoss.toFixed(2)}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-medium">Conditions:</h4>
                      <ul className="text-xs space-y-0.5">
                        {trade.conditions.map((condition) => (
                          <li key={condition.id} className="flex justify-between">
                            <span className="truncate mr-2">{condition.description}</span>
                            <span className="text-muted-foreground shrink-0">{condition.confidence}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Journal Notes Button */}
                    {trade.notes && (
                      <div className="mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              View Notes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Trade Notes</DialogTitle>
                              <DialogDescription>
                                {formatDate(trade.date)} - {trade.currencyPair} ({trade.action.toUpperCase()})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-2 max-h-[60vh] overflow-y-auto">
                              <div className="whitespace-pre-wrap text-sm">{trade.notes}</div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    <div className="mt-2 flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs px-2">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this trade entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTrade(trade.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Trades</DialogTitle>
            <DialogDescription>
              Import your trades from a JSON file. This will add new trades without overwriting existing ones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="import-file">Select JSON File</Label>
              <Input id="import-file" type="file" accept=".json" onChange={handleFileUpload} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={importFromJSON} disabled={!importData}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

