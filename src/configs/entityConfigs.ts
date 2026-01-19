// Common field definitions
const noField = { 
  field: 'code', 
  label: { fr: 'Code', en: 'Code', ar: 'الكود' }, 
  showList: true, 
  showCard: true, 
  type: 'String' as const, 
  tooltip: { fr: '', en: '', ar: '' }, 
  tab: 1 
}

const nameField = { 
  field: 'name', 
  label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, 
  showList: true, 
  showCard: true, 
  type: 'String' as const, 
  tooltip: { fr: '', en: '', ar: '' }, 
  tab: 1 
}

const auditFields = [
  { field: 'createdAt', label: { fr: 'Créé Le', en: 'Created At', ar: 'تاريخ الإنشاء' }, showList: false, showCard: false, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
  { field: 'createdBy', label: { fr: 'Créé Par', en: 'Created By', ar: 'أنشأ بواسطة' }, showList: false, showCard: false, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
  { field: 'updatedAt', label: { fr: 'Modifié Le', en: 'Updated At', ar: 'تاريخ التعديل' }, showList: false, showCard: false, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
  { field: 'updatedBy', label: { fr: 'Modifié Par', en: 'Updated By', ar: 'عدل بواسطة' }, showList: false, showCard: false, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } }
]

const defaultFields = {
  noName: [noField, nameField]
}

// Entities Configuration
export const entities = {
  Company: {
    apiURI: 'companies',
    titleList: { fr: 'Liste des sociétés', en: 'Company List', ar: 'قائمة الشركات' },
    titleForm: { fr: 'Fiche Société', en: 'Company Card', ar: 'بطاقة الشركة' },
    breadcrumb: { 
      fr: ['Administration', 'Entreprises', 'Entreprise'], 
      en: ['Admin', 'Companies', 'Company'], 
      ar: ['الإدارة', 'الشركات', 'الشركة'] 
    },
    tabs: [
      { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' } },
      { id: 2, title: { fr: 'Comptabilité', en: 'Accounting', ar: 'محاسبة' } }
    ],
    fields: [
      // General Section (tab: 1)
      { field: 'code', label: { fr: 'Code', en: 'Code', ar: 'الكود' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'users', label: { fr: 'Utilisateurs', en: 'Users', ar: 'المستخدمين' }, showList: true, showCard: true, type: 'Lookup' as const, tooltip: { fr: '', en: '', ar: '' }, lookupEntity: 'User', tab: 1 },
      { field: 'logo', label: { fr: 'Logo', en: 'Logo', ar: 'الشعار' }, showList: false, showCard: true, type: 'Image' as const, tooltip: { fr: 'Logo de l\'entreprise (optionnel)', en: 'Company logo (optional)', ar: 'شعار الشركة (اختياري)' }, tab: 1, required: false, order: 100 },
      
      // Audit Fields (hidden by default)
      ...auditFields
    ]
  },
  
  User: {
    apiURI: 'users',
    titleList: { fr: 'Liste des utilisateurs', en: 'User List', ar: 'قائمة المستخدمين' },
    titleForm: { fr: 'Fiche Utilisateur', en: 'User Card', ar: 'بطاقة المستخدم' },
    breadcrumb: ['Administration'],
    fields: [
      { field: 'id', label: { fr: 'ID', en: 'ID', ar: 'المعرف' }, showList: true, showCard: false, type: 'Number' as const, tooltip: { fr: '', en: '', ar: '' } },
      { field: 'username', label: { fr: 'Nom d\'utilisateur', en: 'Username', ar: 'اسم المستخدم' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
      { field: 'email', label: { fr: 'Email', en: 'Email', ar: 'البريد الإلكتروني' }, showList: true, showCard: true, type: 'Email' as const, tooltip: { fr: '', en: '', ar: '' } },
      { field: 'first_name', label: { fr: 'Prénom', en: 'First Name', ar: 'الاسم الأول' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
      { field: 'last_name', label: { fr: 'Nom', en: 'Last Name', ar: 'الاسم الأخير' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' } },
      { field: 'is_active', label: { fr: 'Actif', en: 'Active', ar: 'نشط' }, showList: true, showCard: true, type: 'Boolean' as const, tooltip: { fr: '', en: '', ar: '' } }
    ]
  },
  
  Bank: {
    apiURI: 'banks',
    titleList: { fr: 'Liste des banques', en: 'Bank List', ar: 'قائمة البنوك' },
    titleForm: { fr: 'Fiche Banque', en: 'Bank Card', ar: 'بطاقة البنك' },
    breadcrumb: { 
      fr: ['Administration', 'Banques', 'Banque'], 
      en: ['Admin', 'Banks', 'Bank'], 
      ar: ['الإدارة', 'البنوك', 'البنك'] 
    },
    tabs: [
      { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' } },
      { id: 2, title: { fr: 'Informations', en: 'Information', ar: 'معلومات' } },
      { id: 3, title: { fr: 'Configuration', en: 'Configuration', ar: 'الإعدادات' } }
    ],
    fields: [
      // General Section (tab: 1)
      { field: 'code', label: { fr: 'Code', en: 'Code', ar: 'الكود' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'agencies', label: { fr: 'Agences', en: 'Agencies', ar: 'الوكالات' }, showList: true, showCard: true, type: 'Lookup' as const, tooltip: { fr: '', en: '', ar: '' }, lookupEntity: 'Agency', tab: 1 },
      { field: 'logo', label: { fr: 'Logo', en: 'Logo', ar: 'الشعار' }, showList: false, showCard: true, type: 'Image' as const, tooltip: { fr: 'Logo de la banque (optionnel)', en: 'Bank logo (optional)', ar: 'شعار البنك (اختياري)' }, tab: 1, required: false, order: 100 },
      
      // Information Section (tab: 2)
      { field: 'website', label: { fr: 'Site Web', en: 'Website', ar: 'الموقع الإلكتروني' }, showList: true, showCard: true, type: 'Url' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 2 },
      
      // Configuration Section (tab: 3)
      {
        field: 'beginning_balance_label',
        label: { fr: 'Solde initial du relevé', en: 'Beginning balance of ledger entry', ar: ' الرصيد الابتدائي' },
        showList: false,
        showCard: true,
        type: 'String' as const,
        tooltip: {
          fr: 'Libellé utilisé pour identifier le solde initial du relevé dans les écritures bancaires (ex: "SOLDE DÉBUT PÉRIODE")',
          en: 'Label used to identify the beginning balance of the statement in bank ledger entries (e.g., "STATEMENT BEGINNING BALANCE")',
          ar: 'التسمية المستخدمة لتحديد الرصيد الافتتاحي في كشف الحساب داخل الإدخالات المصرفية'
        },
        tab: 3
      },
      {
        field: 'statement_ending_balance_label',
        label: { fr: 'Solde final du relevé', en: 'Statement ending balance', ar: '' },
        showList: false,
        showCard: true,
        type: 'String' as const,
        tooltip: {
          fr: 'Libellé utilisé pour identifier le solde final du relevé dans les écritures bancaires (ex: "SOLDE FIN PÉRIODE")',
          en: 'Label used to identify the statement ending balance in bank ledger entries (e.g., "STATEMENT ENDING BALANCE")',
          ar: ''
        },
        tab: 3
      },
      {
        field: 'balance_label',
        label: { fr: 'Solde', en: 'Balance', ar: '' },
        showList: false,
        showCard: true,
        type: 'String' as const,
        tooltip: {
          fr: 'Libellé utilisé pour identifier la colonne ou la valeur du solde dans les écritures bancaires',
          en: 'Label used to identify the balance column or value in bank ledger entries',
          ar: ''
        },
        tab: 3
      },
      {
        field: 'ending_balance_label',
        label: { fr: 'Solde final', en: 'Ending balance', ar: '' },
        showList: false,
        showCard: true,
        type: 'String' as const,
        tooltip: {
          fr: 'Libellé utilisé pour identifier le solde final dans les écritures bancaires',
          en: 'Label used to identify the ending balance in bank ledger entries',
          ar: ''
        },
        tab: 3
      },
      {
        field: 'total_difference_label',
        label: { fr: 'Total différence', en: 'Total difference', ar: '' },
        showList: false,
        showCard: true,
        type: 'String' as const,
        tooltip: {
          fr: 'Libellé utilisé pour identifier la ligne ou la colonne Total différence dans les rapports de rapprochement',
          en: 'Label used to identify the Total difference row or column in reconciliation reports',
          ar: ''
        },
        tab: 3
      },
      
      // Audit Fields (hidden by default)
      ...auditFields
    ]
  },
  
  Agency: {
    apiURI: 'agencies',
    titleList: { fr: 'Liste des agences', en: 'Agency List', ar: 'قائمة الوكالات' },
    titleForm: { fr: 'Fiche Agence', en: 'Agency Card', ar: 'بطاقة الوكالة' },
    breadcrumb: { 
      fr: ['Administration', 'Agences', 'Agence'], 
      en: ['Admin', 'Agencies', 'Agency'], 
      ar: ['الإدارة', 'الوكالات', 'الوكالة'] 
    },
    tabs: [
      { id: 1, title: { fr: 'Général', en: 'General', ar: 'عام' } }
    ],
    fields: [
      // General Section (tab: 1) - Order: code, name, address, city, bank_id
      { field: 'code', label: { fr: 'Code', en: 'Code', ar: 'الكود' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1, required: true },
      { field: 'name', label: { fr: 'Nom', en: 'Name', ar: 'الاسم' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1, required: true },
      { field: 'address', label: { fr: 'Adresse', en: 'Address', ar: 'العنوان' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'city', label: { fr: 'Ville', en: 'City', ar: 'المدينة' }, showList: true, showCard: true, type: 'String' as const, tooltip: { fr: '', en: '', ar: '' }, tab: 1 },
      { field: 'bank', label: { fr: 'Banque', en: 'Bank', ar: 'البنك' }, showList: true, showCard: true, type: 'Lookup' as const, tooltip: { fr: '', en: '', ar: '' }, lookupEntity: 'Bank', tab: 1, required: true },
      
      // Audit Fields (hidden by default)
      ...auditFields
    ]
  }
}

// Helper function to get entities configuration
export const getEntities = () => {
  return entities
}

// Helper function to get entity by name
export const getEntityByName = (entityName: string) => {
  return entities[entityName as keyof typeof entities] || undefined
}
