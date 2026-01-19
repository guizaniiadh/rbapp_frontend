import { useState, useEffect, useCallback, useRef } from 'react'

interface ColumnWidths {
  [key: string]: number
}

interface UseColumnResizeOptions {
  tableId: string
  defaultWidths?: ColumnWidths
  minWidth?: number
}

export const useColumnResize = ({
  tableId,
  defaultWidths = {},
  minWidth = 80
}: UseColumnResizeOptions) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(defaultWidths)
  const [isResizing, setIsResizing] = useState(false)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const startXRef = useRef<number>(0)
  const startWidthRef = useRef<number>(0)

  // Load saved widths from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`table-column-widths-${tableId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setColumnWidths(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Failed to parse saved column widths:', e)
      }
    }
  }, [tableId])

  // Save widths to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      localStorage.setItem(`table-column-widths-${tableId}`, JSON.stringify(columnWidths))
    }
  }, [columnWidths, tableId])

  const startResize = useCallback((columnKey: string, startX: number, startWidth: number) => {
    setActiveColumn(columnKey)
    setIsResizing(true)
    startXRef.current = startX
    startWidthRef.current = startWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeColumn) return

    const diff = e.clientX - startXRef.current
    const newWidth = Math.max(minWidth, startWidthRef.current + diff)

    setColumnWidths(prev => ({
      ...prev,
      [activeColumn]: newWidth
    }))
  }, [activeColumn, minWidth])

  const stopResize = useCallback(() => {
    setActiveColumn(null)
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  // Set up global mouse event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', stopResize)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', stopResize)
      }
    }
  }, [isResizing, handleMouseMove, stopResize])

  const getColumnWidth = useCallback((columnKey: string): number | undefined => {
    return columnWidths[columnKey]
  }, [columnWidths])

  const resetColumnWidths = useCallback(() => {
    setColumnWidths(defaultWidths)
    localStorage.removeItem(`table-column-widths-${tableId}`)
  }, [defaultWidths, tableId])

  return {
    columnWidths,
    isResizing,
    activeColumn,
    startResize,
    getColumnWidth,
    resetColumnWidths
  }
}

