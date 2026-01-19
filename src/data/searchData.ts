type SearchData = {
  id: string
  name: string
  url: string
  excludeLang?: boolean
  icon: string
  section: string
  shortcut?: string
}

const data: SearchData[] = [
  // Administration
  { id: 'adm-1', name: 'Tableau de bord', url: '/home', icon: 'tabler-smart-home', section: 'Administration' },
  { id: 'adm-2', name: 'Journaux', url: '/admin/logs', icon: 'tabler-file-text', section: 'Administration' },
  { id: 'adm-3', name: 'Piste d’audit', url: '/admin/audit-trail', icon: 'tabler-history', section: 'Administration' },

  // Rapprochement
  { id: 'rec-1', name: 'Transactions', url: '/reconciliation/transactions', icon: 'tabler-arrows-shuffle', section: 'Rapprochement' },
  { id: 'rec-2', name: 'Rapprochement bancaire', url: '/apps/reconciliation/bank', icon: 'tabler-file-check', section: 'Rapprochement' },

  // Paramètres
  { id: 'par-1', name: 'Paramètres généraux', url: '/admin/parameters/general', icon: 'tabler-adjustments', section: 'Paramètres' },
  { id: 'par-2', name: 'Paramètres de rapprochement', url: '/admin/parameters/reconciliation', icon: 'tabler-settings-cog', section: 'Paramètres' },

  // Banques
  { id: 'bnk-1', name: 'Comptes bancaires', url: '/admin/banques/comptes-bancaires', icon: 'tabler-building-bank', section: 'Banques' },

  // Documents
  { id: 'doc-1', name: 'Documents client', url: '/documents/customer', icon: 'tabler-file', section: 'Documents' },
  { id: 'doc-2', name: 'Écritures client', url: '/documents/customer-ledger-entries', icon: 'tabler-list-details', section: 'Documents' },
  { id: 'doc-3', name: 'Écritures bancaires', url: '/documents/bank-ledger-entries', icon: 'tabler-list', section: 'Documents' },

  // Utilisateurs et rôles
  { id: 'usr-1', name: 'Utilisateurs', url: '/apps/user/list', icon: 'tabler-users', section: 'Utilisateurs et rôles' },
  { id: 'usr-2', name: 'Rôles', url: '/apps/roles', icon: 'tabler-shield', section: 'Utilisateurs et rôles' },
  { id: 'usr-3', name: 'Permissions', url: '/apps/permissions', icon: 'tabler-key', section: 'Utilisateurs et rôles' },

  // Système
  { id: 'sys-1', name: 'Santé du système', url: '/admin/system-health', icon: 'tabler-heart-rate-monitor', section: 'Système' },
  { id: 'sys-2', name: 'Explorateur API', url: '/admin/api-explorer', icon: 'tabler-api', section: 'Système' },
  { id: 'sys-3', name: 'Base de données', url: '/admin/database', icon: 'tabler-database', section: 'Système' },

  // Outils
  { id: 'tool-1', name: 'Calculatrice 3D Desmos', url: '/pages/desmos-3d', icon: 'tabler-cube', section: 'Outils' }
]

export default data
