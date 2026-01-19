import type { ParameterTypeInfo, ParameterValueType } from '@/types/conventionParameter'

export const PARAMETER_TYPES: Record<ParameterValueType, ParameterTypeInfo> = {
  string: {
    type: 'string',
    label: 'Text',
    description: 'Simple text value',
    icon: '📝',
    placeholder: 'Enter text value',
    validation: (value: string) => value.trim().length > 0,
    formatValue: (value: string) => value.trim(),
    examples: ['"Hello World"', '"Company Name"', '"Description"']
  },
  number: {
    type: 'number',
    label: 'Number',
    description: 'Decimal number value',
    icon: '🔢',
    placeholder: 'Enter decimal number (e.g., 7.99)',
    validation: (value: string) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)),
    formatValue: (value: string) => parseFloat(value),
    examples: ['7.99', '3.14', '100.5']
  },
  integer: {
    type: 'integer',
    label: 'Integer',
    description: 'Numeric value (integer or float)',
    icon: '🔢',
    placeholder: 'Enter number (e.g., 3 or 3.5)',
    validation: (value: string) => {
      const num = parseFloat(value)
      return !isNaN(num) && isFinite(num)
    },
    formatValue: (value: string) => parseFloat(value),
    examples: ['3', '7.5', '100.99']
  },
  boolean: {
    type: 'boolean',
    label: 'Boolean',
    description: 'True or false value',
    icon: '✅',
    placeholder: 'Enter true or false',
    validation: (value: string) => {
      const lower = value.toLowerCase().trim()
      return lower === 'true' || lower === 'false'
    },
    formatValue: (value: string) => value.toLowerCase().trim() === 'true',
    examples: ['true', 'false']
  },
  json: {
    type: 'json',
    label: 'JSON',
    description: 'Valid JSON object or array',
    icon: '📋',
    placeholder: 'Enter valid JSON (e.g., {"key": "value"})',
    validation: (value: string) => {
      try {
        JSON.parse(value)
        return true
      } catch {
        return false
      }
    },
    formatValue: (value: string) => JSON.parse(value),
    examples: ['{"key": "value"}', '{"enabled": true}', '{"config": {"timeout": 30}}']
  },
  array: {
    type: 'array',
    label: 'Array',
    description: 'JSON array of values',
    icon: '📋',
    placeholder: 'Enter JSON array (e.g., ["item1", "item2"])',
    validation: (value: string) => {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed)
      } catch {
        return false
      }
    },
    formatValue: (value: string) => JSON.parse(value),
    examples: ['["item1", "item2"]', '[1, 2, 3]', '[{"date": "2025-01-01", "label": "New Year"}]']
  },
  object: {
    type: 'object',
    label: 'Object',
    description: 'JSON object with key-value pairs',
    icon: '📋',
    placeholder: 'Enter JSON object (e.g., {"name": "value"})',
    validation: (value: string) => {
      try {
        const parsed = JSON.parse(value)
        return typeof parsed === 'object' && !Array.isArray(parsed)
      } catch {
        return false
      }
    },
    formatValue: (value: string) => JSON.parse(value),
    examples: ['{"name": "John", "age": 30}', '{"settings": {"theme": "dark"}}']
  }
}

// Helper function to get parameter type info
export const getParameterTypeInfo = (type: ParameterValueType): ParameterTypeInfo => {
  return PARAMETER_TYPES[type]
}

// Helper function to detect parameter type from value
export const detectParameterType = (value: any): ParameterValueType => {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number'
  }
  if (typeof value === 'string') {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return 'array'
      if (typeof parsed === 'object') return 'object'
    } catch {
      // Not JSON, treat as string
    }
    return 'string'
  }
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  
  return 'string' // Default fallback
}

// Helper function to format value for display
export const formatValueForDisplay = (value: any, type: ParameterValueType): string => {
  switch (type) {
    case 'boolean':
      return String(value)
    case 'number':
    case 'integer':
      return String(value)
    case 'string':
      return String(value)
    case 'json':
    case 'array':
    case 'object':
      return JSON.stringify(value, null, 2)
    default:
      return String(value)
  }
}

// Helper function to get input type for HTML input
export const getInputType = (type: ParameterValueType): string => {
  switch (type) {
    case 'number':
    case 'integer':
      return 'number'
    case 'boolean':
      return 'text'
    default:
      return 'text'
  }
}
