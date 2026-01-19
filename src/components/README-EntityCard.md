# Dynamic Entity Detail Card Component

A powerful, reusable component for displaying and editing entity details with dynamic form generation based on configuration.

## 🚀 Features

- **Dynamic Form Generation**: Forms are generated based on entity configuration
- **Tabbed Interface**: Organize fields into logical tabs
- **Multiple Field Types**: Text, email, phone, select, boolean, date, textarea, URL
- **Edit Mode Toggle**: Switch between view and edit modes
- **CRUD Operations**: Create, Read, Update, Delete with loading states
- **Responsive Design**: Works on all screen sizes
- **TypeScript Support**: Full type safety
- **Material-UI Integration**: Consistent with your theme

## 📁 File Structure

```
src/
├── components/
│   └── EntityDetailCard.tsx          # Main component
├── configs/
│   └── entityConfigs.ts           # Entity configurations
└── app/[lang]/(protected)/(admin)/
    ├── admin/entity-demo/page.tsx   # Demo page
    └── admin/company/company-details/[id]/page.tsx  # Company example
```

## 🎯 Quick Start

### 1. Basic Usage

```tsx
import EntityDetailCard from '@/components/EntityDetailCard'
import { companyEntityConfig } from '@/configs/entityConfigs'

const MyComponent = () => {
  const [companyData, setCompanyData] = useState({
    code: 'COMP001',
    name: 'Acme Corp',
    email: 'contact@acme.com'
  })

  const handleSave = async (data) => {
    // Save to API
    console.log('Saving:', data)
  }

  const config = {
    ...companyEntityConfig,
    onSave: handleSave,
    onDelete: async (id) => console.log('Delete:', id),
    onRefresh: async () => console.log('Refresh'),
    onBack: () => console.log('Back')
  }

  return (
    <EntityDetailCard
      config={config}
      data={companyData}
      onDataChange={setCompanyData}
    />
  )
}
```

### 2. Using Pre-configured Entities

```tsx
import { getEntityConfig } from '@/configs/entityConfigs'

const config = getEntityConfig('company') // or 'user', 'agency', 'bank'
```

## ⚙️ Configuration

### Entity Configuration Structure

```typescript
interface EntityConfig {
  id: string                    // Unique identifier
  title: string                 // Main title
  subtitle?: string            // Subtitle
  icon?: React.ReactNode       // Optional icon
  tabs?: EntityTab[]          // Tabbed interface
  fields?: EntityField[]       // Simple field list
  showEdit?: boolean          // Show edit button
  showSave?: boolean          // Show save button
  showRefresh?: boolean       // Show refresh button
  showDelete?: boolean        // Show delete button
  onSave?: (data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onRefresh?: () => Promise<void>
  onBack?: () => void
}
```

### Field Types

```typescript
type FieldType = 
  | 'text'      // Text input
  | 'email'     // Email input with validation
  | 'phone'     // Phone input
  | 'number'    // Number input
  | 'select'    // Dropdown select
  | 'boolean'   // Switch/toggle
  | 'date'      // Date picker
  | 'url'       // URL input
  | 'textarea'  // Multi-line text
```

### Field Configuration

```typescript
interface EntityField {
  key: string                    // Data key
  label: string                 // Display label
  type: FieldType              // Field type
  value?: any                  // Current value
  options?: { value: any; label: string }[]  // For select fields
  required?: boolean           // Required field
  disabled?: boolean           // Disabled state
  placeholder?: string         // Placeholder text
  tooltip?: string            // Help text
  tab?: string                // Tab assignment
  order?: number              // Display order
}
```

## 📝 Examples

### 1. Simple Entity (No Tabs)

```typescript
const simpleConfig: EntityConfig = {
  id: 'product',
  title: 'Product Details',
  fields: [
    {
      key: 'name',
      label: 'Product Name',
      type: 'text',
      required: true,
      order: 1
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      order: 2
    },
    {
      key: 'active',
      label: 'Active',
      type: 'boolean',
      order: 3
    }
  ]
}
```

### 2. Tabbed Entity

```typescript
const tabbedConfig: EntityConfig = {
  id: 'customer',
  title: 'Customer Details',
  tabs: [
    {
      id: 'personal',
      title: 'Personal Information',
      defaultExpanded: true,
      fields: [
        { key: 'firstName', label: 'First Name', type: 'text', required: true },
        { key: 'lastName', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true }
      ]
    },
    {
      id: 'address',
      title: 'Address',
      fields: [
        { key: 'street', label: 'Street', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'zipCode', label: 'ZIP Code', type: 'text' }
      ]
    }
  ]
}
```

### 3. Select Field with Options

```typescript
{
  key: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ]
}
```

## 🎨 Styling

The component uses Material-UI components and follows your theme configuration:

- **Cards**: Material-UI Card with consistent styling
- **Forms**: Responsive grid layout
- **Buttons**: Theme-consistent button variants
- **Icons**: Material-UI icons
- **Typography**: Follows your typography scale

## 🔧 Advanced Usage

### Custom Field Rendering

You can extend the component to support custom field types by modifying the `renderField` function in `EntityDetailCard.tsx`.

### API Integration

```typescript
const handleSave = async (data: any) => {
  try {
    setLoading(true)
    await apiClient.put(`/entities/${entityId}`, data)
    setSnackbar({ open: true, message: 'Saved successfully!', severity: 'success' })
  } catch (error) {
    setSnackbar({ open: true, message: 'Save failed!', severity: 'error' })
  } finally {
    setLoading(false)
  }
}
```

### Error Handling

```typescript
<EntityDetailCard
  config={config}
  data={data}
  loading={loading}
  error={error}
  onDataChange={handleDataChange}
/>
```

## 🧪 Testing

Visit `/admin/entity-demo` to see the component in action with different entity types:

- **Company**: Complex entity with tabs and multiple field types
- **User**: User management with permissions
- **Agency**: Simple entity with basic fields
- **Bank**: Financial entity with specific fields

## 🚀 Next Steps

1. **Add New Entity Types**: Create new configurations in `entityConfigs.ts`
2. **Custom Field Types**: Extend the component for specialized fields
3. **Validation**: Add form validation rules
4. **Permissions**: Integrate with your permission system
5. **Bulk Operations**: Add support for bulk editing

## 📚 API Reference

### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `EntityConfig` | Entity configuration |
| `data` | `any` | Entity data |
| `loading?` | `boolean` | Loading state |
| `error?` | `string` | Error message |
| `onDataChange?` | `(data: any) => void` | Data change handler |

### Events

| Event | Type | Description |
|-------|------|-------------|
| `onSave` | `(data: any) => Promise<void>` | Save handler |
| `onDelete` | `(id: string) => Promise<void>` | Delete handler |
| `onRefresh` | `() => Promise<void>` | Refresh handler |
| `onBack` | `() => void` | Back navigation |

---

**Happy coding! 🎉**
