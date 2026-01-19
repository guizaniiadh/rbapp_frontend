'use client'

import { TableCell, Box } from '@mui/material'
import type { TableCellProps } from '@mui/material'
import { useRef, useState } from 'react'

interface ResizableTableCellProps extends TableCellProps {
  columnKey: string
  onResizeStart: (columnKey: string, startX: number, startWidth: number, tableType: 'bank' | 'customer') => void
  columnWidth?: number
  resizable?: boolean
  tableType?: 'bank' | 'customer'
}

export const ResizableTableCell = ({
  columnKey,
  onResizeStart,
  columnWidth,
  resizable = true,
  tableType = 'bank',
  children,
  sx,
  ...props
}: ResizableTableCellProps) => {
  const cellRef = useRef<HTMLTableCellElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !cellRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startWidth = cellRef.current.offsetWidth
    
    onResizeStart(columnKey, startX, startWidth, tableType)
  }

  return (
    <TableCell
      ref={cellRef}
      sx={{
        position: 'relative',
        ...(columnWidth && { width: `${columnWidth}px`, minWidth: `${columnWidth}px` }),
        ...sx
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      {resizable && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '6px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 1,
            backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
            transition: 'background-color 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            }
          }}
        />
      )}
    </TableCell>
  )
}

