"use client"

import { useCallback, useEffect, useState } from "react"

export interface HistoryItem {
  id: string
  dataUrl: string
  format: "idcard" | "pfp"
  name: string
  stack: string
  accent: "yellow" | "pink"
  createdAt: number
}

const STORAGE_KEY = "hhgoa-card-history"
const MAX_ITEMS = 24

function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is HistoryItem =>
        i && typeof i.dataUrl === "string" && (i.format === "idcard" || i.format === "pfp"),
    )
  } catch {
    return []
  }
}

function writeHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable — history is best-effort only
  }
}

// Every generated card/frame is persisted to localStorage so the user's
// creations survive refreshes and can be re-opened, downloaded, or shared.
export function useCardHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    setHistory(readHistory())
  }, [])

  const addToHistory = useCallback(
    (item: Omit<HistoryItem, "id" | "createdAt">) => {
      const entry: HistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      }
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ITEMS)
        writeHistory(next)
        return next
      })
      return entry
    },
    [],
  )

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((i) => i.id !== id)
      writeHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return { history, addToHistory, removeFromHistory, clearHistory }
}
