'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface TableColumn {
  id: string
  label: string
  visible: boolean
}

export interface TableInfo {
  tableId: string
  tableName: string
  columns: TableColumn[]
  order: number
  pathname: string
}

interface TableColumnVisibilityContextType {
  registerTable: (tableId: string, tableName: string, columns: Omit<TableColumn, 'visible'>[], order?: number, pathname?: string) => void
  unregisterTable: (tableId: string, pathname?: string) => void
  unregisterTablesByPathname: (pathname: string) => void
  updateColumnVisibility: (tableId: string, columnId: string, visible: boolean, pathname?: string) => void
  getTableInfo: (tableId: string, pathname?: string) => TableInfo | undefined
  getAllTables: (pathname?: string) => TableInfo[]
  isColumnVisible: (tableId: string, columnId: string, pathname?: string) => boolean
}

const TableColumnVisibilityContext = createContext<TableColumnVisibilityContextType | undefined>(undefined)

export const useTableColumnVisibility = () => {
  const context = useContext(TableColumnVisibilityContext)
  if (!context) {
    throw new Error('useTableColumnVisibility must be used within TableColumnVisibilityProvider')
  }
  return context
}

interface TableColumnVisibilityProviderProps {
  children: React.ReactNode
}

export const TableColumnVisibilityProvider: React.FC<TableColumnVisibilityProviderProps> = ({ children }) => {
  const [tables, setTables] = useState<Map<string, TableInfo>>(new Map())

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tableColumnVisibility')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const tablesMap = new Map<string, TableInfo>()
        Object.entries(parsed).forEach(([tableId, tableInfo]: [string, any]) => {
          tablesMap.set(tableId, tableInfo)
        })
        setTables(tablesMap)
      } catch (err) {
        console.error('Failed to load table column visibility from localStorage:', err)
      }
    }
  }, [])

  // Save to localStorage whenever tables change
  useEffect(() => {
    const toStore: Record<string, TableInfo> = {}
    tables.forEach((tableInfo, tableId) => {
      toStore[tableId] = tableInfo
    })
    localStorage.setItem('tableColumnVisibility', JSON.stringify(toStore))
  }, [tables])

  const registerTable = useCallback((tableId: string, tableName: string, columns: Omit<TableColumn, 'visible'>[], order: number = 999, pathname: string = '') => {
    setTables(prev => {
      const newMap = new Map(prev)
      // Use pathname:tableId as the key to scope tables by route
      const scopedTableId = pathname ? `${pathname}:${tableId}` : tableId
      const existing = newMap.get(scopedTableId)
      
      // If table exists, merge columns but preserve visibility state
      if (existing) {
        const columnMap = new Map(existing.columns.map(col => [col.id, col]))
        
        // Update existing columns and add new ones
        columns.forEach(col => {
          const existingCol = columnMap.get(col.id)
          if (existingCol) {
            // Preserve visibility state
            columnMap.set(col.id, { ...col, visible: existingCol.visible })
          } else {
            // New column defaults to visible
            columnMap.set(col.id, { ...col, visible: true })
          }
        })
        
        // Remove columns that are no longer in the definition
        const newColumnIds = new Set(columns.map(col => col.id))
        const columnsToKeep = Array.from(columnMap.values()).filter(col => newColumnIds.has(col.id))
        
        newMap.set(scopedTableId, {
          tableId,
          tableName,
          columns: columnsToKeep,
          order: existing.order !== undefined ? existing.order : order,
          pathname
        })
      } else {
        // New table - all columns visible by default
        newMap.set(scopedTableId, {
          tableId,
          tableName,
          columns: columns.map(col => ({ ...col, visible: true })),
          order,
          pathname
        })
      }
      
      return newMap
    })
  }, [])

  const unregisterTable = useCallback((tableId: string, pathname: string = '') => {
    setTables(prev => {
      const newMap = new Map(prev)
      const scopedTableId = pathname ? `${pathname}:${tableId}` : tableId
      newMap.delete(scopedTableId)
      return newMap
    })
  }, [])

  const unregisterTablesByPathname = useCallback((pathname: string) => {
    setTables(prev => {
      const newMap = new Map(prev)
      // Remove all tables with this pathname
      const keysToDelete: string[] = []
      newMap.forEach((table, key) => {
        if (table.pathname === pathname || key.startsWith(`${pathname}:`)) {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => newMap.delete(key))
      return newMap
    })
  }, [])

  const updateColumnVisibility = useCallback((tableId: string, columnId: string, visible: boolean, pathname: string = '') => {
    setTables(prev => {
      const newMap = new Map(prev)
      const scopedTableId = pathname ? `${pathname}:${tableId}` : tableId
      const table = newMap.get(scopedTableId)
      if (table) {
        const updatedColumns = table.columns.map(col =>
          col.id === columnId ? { ...col, visible } : col
        )
        newMap.set(scopedTableId, {
          ...table,
          columns: updatedColumns
        })
      }
      return newMap
    })
  }, [])

  const getTableInfo = useCallback((tableId: string, pathname: string = '') => {
    const scopedTableId = pathname ? `${pathname}:${tableId}` : tableId
    return tables.get(scopedTableId)
  }, [tables])

  const getAllTables = useCallback((pathname: string = '') => {
    if (!pathname) {
      // If no pathname provided, return all tables (for backward compatibility)
      return Array.from(tables.values()).sort((a, b) => a.order - b.order)
    }
    // Filter tables by pathname
    return Array.from(tables.values())
      .filter(table => table.pathname === pathname)
      .sort((a, b) => a.order - b.order)
  }, [tables])

  const isColumnVisible = useCallback((tableId: string, columnId: string, pathname: string = '') => {
    const scopedTableId = pathname ? `${pathname}:${tableId}` : tableId
    const table = tables.get(scopedTableId)
    if (!table) return true // Default to visible if table not registered
    const column = table.columns.find(col => col.id === columnId)
    return column?.visible ?? true // Default to visible if column not found
  }, [tables])

  return (
    <TableColumnVisibilityContext.Provider
      value={{
        registerTable,
        unregisterTable,
        unregisterTablesByPathname,
        updateColumnVisibility,
        getTableInfo,
        getAllTables,
        isColumnVisible
      }}
    >
      {children}
    </TableColumnVisibilityContext.Provider>
  )
}

