# Entity Configuration System

A comprehensive system for managing entity configurations that matches your existing structure with multi-language support and flexible field definitions.

## 🚀 Features

- **Multi-language Support**: French, English, Arabic labels and tooltips
- **Flexible Field Types**: String, Number, Boolean, Date, Lookup, Email, Phone, URL, Textarea
- **Tabbed Interface**: Organize fields into logical tabs
- **Audit Fields**: Automatic creation/update tracking
- **Lookup Integration**: Support for entity relationships
- **Show/Hide Controls**: Control field visibility in lists and cards
- **TypeScript Support**: Full type safety

## 📁 File Structure

```
src/
├── components/
│   ├── EntityCard.tsx              # New entity card component
│   └── EntityDetailCard.tsx        # Original entity card component
├── configs/
│   └── entityConfigs.ts           # Entity configurations
└── app/[lang]/(protected)/(admin)/
    └── admin/company/company-details-new/[id]/page.tsx  # Company example
```

## 🎯 Quick Start

### 1. Basic Usage with EntityCard

```tsx
import EntityCard from '@/components/EntityCard'
import { getEntityByName } from '@/configs/entityConfigs'

const MyComponent = () => {
  const entityDefinition = getEntityByName('Company')
  const [companyData, setCompanyData] = useState({
    code: 'COMP001',
    name: 'Acme Corp',
    user_count: 10,
    active_user_count: 8
  })

  const handleSave = async (data) => {
    // Save to API
    console.log('Saving:', data)
  }

  return (
    <EntityCard
      entityDefinition={entityDefinition}
      data={companyData}
      onDataChange={setCompanyData}
      onSave={handleSave}
      onDelete={async (id) => console.log('Delete:', id)}
      onRefresh={async () => console.log('Refresh')}
      onBack={() => console.log('Back')}
    />
  )
}
```

### 2. Using Pre-configured Entities

```tsx
import { getEntityByName } from '@/configs/entityConfigs'

const entityDefinition = getEntityByName('Company') // or any other entity
```

## ⚙️ Configuration Structure

### Entity Definition Structure

```typescript
interface EntityDefinition {
  apiURI: string                    // API endpoint
  titleList: { fr: string; en: string; ar: string }  // List title
  titleForm: { fr: string; en: string; ar: string }  // Form title
  breadcrumb: string[]             // Navigation breadcrumb
  tabs?: EntityTab[]              // Tabbed interface
  fields: EntityField[]           // Field definitions
}
```

### Field Types

```typescript
type FieldType = 
  | 'String'      // Text input
  | 'Number'      // Number input
  | 'Boolean'     // Switch/toggle
  | 'Date'        // Date picker
  | 'Lookup'      // Dropdown with external entity
  | 'Email'       // Email input with validation
  | 'Phone'       // Phone input
  | 'Url'         // URL input
  | 'Textarea'    // Multi-line text
```

### Field Configuration

```typescript
interface EntityField {
  field: string                    // Data key
  label: { fr: string; en: string; ar: string }  // Multi-language labels
  type: FieldType                 // Field type
  value?: any                    // Current value
  options?: { value: any; label: string }[]  // For select fields
  required?: boolean             // Required field
  disabled?: boolean             // Disabled state
  placeholder?: string           // Placeholder text
  tooltip?: { fr: string; en: string; ar: string }  // Multi-language tooltips
  tab?: number                   // Tab assignment
  order?: number                 // Display order
  showList?: boolean             // Show in list view
  showCard?: boolean             // Show in card view
  lookupEntity?: string          // For lookup fields
}
```

## 📝 Examples

### 1. Simple Entity Configuration

```typescript
export const entities = {
  Company: {
    apiURI: 'companies',
    titleList: { fr: 'Liste des sociétés', en: 'Company List', ar: 'قائمة الشركات' },
    titleForm: { fr: 'Fiche Société', en: 'Company Card', ar: 'بطاقة الشركة' },
    breadcrumb: ['Administration'],
    fields: [
      { field: 'code', label: { fr: 'Code', en: 'Code', ar: 'الكود' }, showList: true, showCard: true, type: 'String', tab: 1 },
      { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tab: 1 },
      { field: 'user_count', label: { fr: 'Nombre d\'utilisateurs', en: 'User Count', ar: 'عدد المستخدمين' }, showList: true, showCard: true, type: 'Number', tab: 1 }
    ]
  }
}
```

### 2. Tabbed Entity Configuration

```typescript
export const entities = {
  Vendor: {
    apiURI: 'vendor',
    titleList: { fr: 'Liste des fournisseurs', en: 'Vendor', ar: 'المورد' },
    titleForm: { fr: 'Fiche Fournisseur', en: 'Vendor Card', ar: 'بطاقة المورد' },
    breadcrumb: ['Fournisseur'],
    tabs: [
      { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' }, open: true }, 
      { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'المحاسبة' }, open: false }
    ],
    fields: [
      { field: 'no', label: { fr: 'N°', en: 'No.', ar: 'الرقم' }, showList: true, showCard: true, type: 'String', tab: 1 },
      { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String', tab: 1 },
      { field: 'phoneNo', label: { fr: 'N° téléphone', en: 'Phone No.', ar: 'رقم الهاتف' }, showList: true, showCard: true, type: 'String', tab: 1 },
      { field: 'globalDimension1Code', label: { fr: 'Code axe principal 1', en: 'Global Dimension 1 Code', ar: 'كود البعد العالمي 1' }, showList: false, showCard: true, type: 'String', tab: 2 }
    ]
  }
}
```

### 3. Lookup Field Configuration

```typescript
{
  field: 'territoryCode',
  label: { fr: 'Code secteur', en: 'Territory Code', ar: 'كود المنطقة' },
  showList: false,
  showCard: true,
  type: 'Lookup',
  lookupEntity: 'Territory',
  tab: 1
}
```

### 4. Boolean Field Configuration

```typescript
{
  field: 'pricesIncludingVAT',
  label: { fr: 'Prix TTC', en: 'Prices Including VAT', ar: 'الأسعار شاملة الضريبة' },
  showList: false,
  showCard: true,
  type: 'Boolean',
  tab: 1
}
```

## 🔧 Common Field Definitions

### Reusable Field Components

```typescript
// Common field definitions
const noField = { 
  field: 'code', 
  label: { fr: 'Code', en: 'Code', ar: 'الكود' }, 
  showList: true, 
  showCard: true, 
  type: 'String', 
  tooltip: { fr: '', en: '', ar: '' }, 
  tab: 1 
}

const nameField = { 
  field: 'name', 
  label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, 
  showList: true, 
  showCard: true, 
  type: 'String', 
  tooltip: { fr: '', en: '', ar: '' }, 
  tab: 1 
}

const auditFields = [
  { field: 'createdAt', label: { fr: 'Créé Le', en: 'Created At', ar: 'تاريخ الإنشاء' }, showList: false, showCard: false, type: 'String' },
  { field: 'createdBy', label: { fr: 'Créé Par', en: 'Created By', ar: 'أنشأ بواسطة' }, showList: false, showCard: false, type: 'String' },
  { field: 'updatedAt', label: { fr: 'Modifié Le', en: 'Updated At', ar: 'تاريخ التعديل' }, showList: false, showCard: false, type: 'String' },
  { field: 'updatedBy', label: { fr: 'Modifié Par', en: 'Updated By', ar: 'عدل بواسطة' }, showList: false, showCard: false, type: 'String' }
]

const defaultFields = {
  noName: [noField, nameField]
}
```

## 🌐 Multi-language Support

### Language Configuration

```typescript
// Current language (can be from context or props)
const currentLanguage = 'fr' // 'fr' | 'en' | 'ar'

// Get localized label
const label = field.label[currentLanguage as keyof typeof field.label] || field.label.fr

// Get localized tooltip
const tooltip = field.tooltip?.[currentLanguage as keyof typeof field.tooltip] || field.tooltip?.fr || ''
```

### Language Switching

```typescript
// In your component
const [currentLanguage, setCurrentLanguage] = useState('fr')

// Update language
const switchLanguage = (lang: 'fr' | 'en' | 'ar') => {
  setCurrentLanguage(lang)
}
```

## 🎨 Styling Integration

### Material-UI Integration

The component uses Material-UI components and follows your theme:

- **Cards**: Material-UI Card with consistent styling
- **Forms**: Responsive grid layout
- **Buttons**: Theme-consistent button variants
- **Icons**: Material-UI icons
- **Typography**: Follows your typography scale

### Theme Integration

```typescript
// The component automatically uses your Vuexy theme:
// - Montserrat font for all text
// - Vuexy colors for buttons and accents
// - Consistent spacing and border radius
// - Material-UI components with theme integration
```

## 🔧 Advanced Usage

### Custom Field Rendering

You can extend the component to support custom field types by modifying the `renderField` function in `EntityCard.tsx`.

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
<EntityCard
  entityDefinition={entityDefinition}
  data={data}
  loading={loading}
  error={error}
  onDataChange={handleDataChange}
  onSave={handleSave}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
  onBack={handleBack}
/>
```

## 🧪 Testing

Visit `/admin/company/company-details-new/[id]` to see the component in action with the Company entity.

## 🚀 Next Steps

1. **Add New Entity Types**: Create new configurations in `entityConfigs.ts`
2. **Custom Field Types**: Extend the component for specialized fields
3. **Validation**: Add form validation rules
4. **Permissions**: Integrate with your permission system
5. **Bulk Operations**: Add support for bulk editing

## 📚 API Reference

### EntityCard Props

| Prop | Type | Description |
|------|------|-------------|
| `entityDefinition` | `EntityDefinition` | Entity configuration |
| `data` | `any` | Entity data |
| `loading?` | `boolean` | Loading state |
| `error?` | `string` | Error message |
| `onDataChange?` | `(data: any) => void` | Data change handler |
| `onSave?` | `(data: any) => Promise<void>` | Save handler |
| `onDelete?` | `(id: string) => Promise<void>` | Delete handler |
| `onRefresh?` | `() => Promise<void>` | Refresh handler |
| `onBack?` | `() => void` | Back navigation |

### Helper Functions

| Function | Type | Description |
|----------|------|-------------|
| `getEntities()` | `() => object` | Get all entity configurations |
| `getEntityByName(name)` | `(string) => EntityDefinition \| null` | Get entity by name |

---

**Happy coding! 🎉**
