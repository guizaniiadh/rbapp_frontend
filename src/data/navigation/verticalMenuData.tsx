// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'
import type { AuthUser } from '@/redux-store/slices/auth'

const verticalMenuData = (
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
  user?: AuthUser | null
): VerticalMenuDataType[] => {
  // Common menu items for all authenticated users
  const commonMenuItems: VerticalMenuDataType[] = [
        {
          label: 'Reconciliation',
          icon: 'tabler-file-dollar',
          href: '/reconciliation/transactions'
        },
        {
          label: 'Home',
          icon: 'tabler-home',
          href: '/home'
        },
    {
      label: dictionary['navigation'].dashboards,
      icon: 'tabler-smart-home',
      children: [
        {
          label: dictionary['navigation'].crm,
          icon: 'tabler-circle',
          href: '/dashboards/crm'
        }
      ]
    },
    {
      label: dictionary['navigation'].apps,
      icon: 'tabler-apps',
      children: [
        {
          label: dictionary['navigation'].email,
          icon: 'tabler-circle',
          href: '/apps/email'
        },
        {
          label: dictionary['navigation'].chat,
          icon: 'tabler-circle',
          href: '/apps/chat'
        },
        {
          label: dictionary['navigation'].calendar,
          icon: 'tabler-circle',
          href: '/apps/calendar'
        },
        {
          label: dictionary['navigation'].invoice,
          icon: 'tabler-file-description',
          children: [
            {
              label: 'List',
              href: '/apps/invoice/list'
            },
            {
              label: 'Preview',
              href: '/apps/invoice/preview'
            },
            {
              label: 'Edit',
              href: '/apps/invoice/edit'
            },
            {
              label: 'Add',
              href: '/apps/invoice/add'
            }
          ]
        },
        {
          label: dictionary['navigation'].reconciliation,
          icon: 'tabler-file-description',
          children: [
            {
              label: 'List',
              href: '/apps/reconciliation/bank'
            }
          ]
        },
        {
          label: dictionary['navigation'].documents,
          icon: 'tabler-file-text',
          children: [
            {
              label: dictionary['navigation'].customerDocuments,
              href: '/documents/customer'
            },
            {
              label: 'Customer Ledger Entries',
              href: '/documents/customer-ledger-entries'
            },
            {
              label: 'Bank Ledger Entries',
              href: '/documents/bank-ledger-entries'
            },
            {
              label: 'Reconciliation',
              href: '/reconciliation',
              icon: 'tabler-file-check'
            }
          ]
        },
    {
      label: 'Agencies',
      icon: 'tabler-building',
      children: [
        {
          label: 'Agency Reconcile',
          href: '/agencies/[agencyCode]/reconcile'
        }
      ]
    },

        {
          label: dictionary['navigation'].user,
          icon: 'tabler-user',
          children: [
            {
              label: 'List',
              href: '/apps/user/list'
            },
            {
              label: 'View',
              href: '/apps/user/view'
            }
          ]
        },
        {
          label: dictionary['navigation'].roles,
          icon: 'tabler-shield',
          href: '/apps/roles'
        },
        {
          label: dictionary['navigation'].permissions,
          icon: 'tabler-lock',
          href: '/apps/permissions'
        }
      ]
    },
    {
      label: dictionary['navigation'].pages,
      icon: 'tabler-file',
      children: [
        {
          label: dictionary['navigation'].userProfile,
          icon: 'tabler-circle',
          href: '/pages/user-profile'
        },
        {
          label: dictionary['navigation'].accountSettings,
          icon: 'tabler-circle',
          href: '/pages/account-settings'
        },
        {
          label: 'Pricing',
          icon: 'tabler-currency-dollar',
          href: '/pages/pricing'
        },
        {
          label: 'FAQ',
          icon: 'tabler-help',
          href: '/pages/faq'
        },
        {
          label: 'Knowledge Base',
          icon: 'tabler-book',
          href: '/pages/knowledge-base'
        },
        {
          label: 'Maintenance',
          icon: 'tabler-settings',
          href: '/maintenance'
        },
        {
          label: 'Coming Soon',
          icon: 'tabler-clock',
          href: '/coming-soon'
        }
      ]
    },
    {
      label: 'UI',
      icon: 'tabler-layout',
      children: [
        {
          label: 'Typography',
          href: '/ui/typography'
        },
        {
          label: 'Icons',
          href: '/ui/icons'
        },
        {
          label: 'Cards',
          href: '/ui/cards'
        },
        {
          label: 'Components',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components`,
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        },
        {
          label: 'Menu Examples',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/overview`,
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        },
        {
          label: 'Others',
          icon: 'tabler-menu-2',
          children: [
            {
              suffix: {
                label: 'New',
                color: 'info'
              },
              label: 'Item with Badge',
              icon: 'tabler-circle'
            },
            {
              label: 'External Link',
              icon: 'tabler-circle',
              href: 'https://pixinvent.com',
              target: '_blank',
              suffix: <i className='tabler-external-link text-xl' />
            },
            {
              label: 'Menu Levels',
              icon: 'tabler-circle',
              children: [
                {
                  label: 'Menu Level 2.1',
                  icon: 'tabler-circle'
                },
                {
                  label: 'Menu Level 2.2',
                  icon: 'tabler-circle',
                  children: [
                    {
                      label: 'Menu Level 3.1',
                      icon: 'tabler-circle'
                    },
                    {
                      label: 'Menu Level 3.2',
                      icon: 'tabler-circle'
                    }
                  ]
                }
              ]
            },
            {
              label: 'Disabled Menu',
              disabled: true
            }
          ]
        }
      ]
    },
    {
      label: 'Forms & Tables',
      icon: 'tabler-layout',
      children: [
        {
          label: 'Form Layouts',
          href: '/forms/form-layouts'
        },
        {
          label: 'Form Validation',
          href: '/forms/form-validation'
        },
        {
          label: 'Form Wizard',
          href: '/forms/form-wizard'
        },
        {
          label: 'React Table',
          href: '/react-table'
        },
        {
          label: 'Form Elements',
          icon: 'tabler-checkbox',
          href: `${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements`,
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        }
      ]
    },
    {
      label: 'Charts & Misc',
      icon: 'tabler-chart-pie',
      children: [
        {
          label: 'Apex Charts',
          href: '/charts/apex-charts'
        },
        {
          label: 'Recharts',
          href: '/charts/recharts'
        },
        {
          label: 'Chart.js',
          href: '/charts/chartjs'
        },
        {
          label: 'Access Control',
          href: '/access-control'
        },
        {
          label: 'Documentation',
          icon: 'tabler-book-2',
          href: process.env.NEXT_PUBLIC_DOCS_URL || '#',
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        },
        {
          label: 'Raise Support',
          icon: 'tabler-lifebuoy',
          href: 'https://pixinvent.ticksy.com',
          target: '_blank',
          suffix: <i className='tabler-external-link text-xl' />
        }
      ]
    }
  ]

  // Admin-only menu items
  const adminMenuItems: VerticalMenuDataType[] = [
    {
      label: 'Admin',
      icon: 'tabler-shield-lock',
      children: [
        {
          label: 'Users',
          icon: 'tabler-users',
          href: '/apps/user/list'
        },
        {
          label: 'Roles',
          icon: 'tabler-shield',
          href: '/apps/roles'
        },
        {
          label: 'Permissions',
          icon: 'tabler-key',
          href: '/apps/permissions'
        },
        {
          label: 'Settings',
          icon: 'tabler-settings',
          href: '/apps/settings'
        },
        {
          label: 'Logs',
          icon: 'tabler-file-text',
          href: '/admin/logs'
        },
        {
          label: 'Audit Trail',
          icon: 'tabler-history',
          href: '/admin/audit-trail'
        }
      ]
    },
    {
      label: 'Banques',
      icon: 'tabler-building-bank',
      children: [
        {
          label: 'Comptes bancaires',
          icon: 'tabler-circle',
          href: '/admin/banques/comptes-bancaires'
        }
      ]
    },
    {
      label: 'Parameters',
      icon: 'tabler-settings',
      children: [
        {
          label: 'General Parameters',
          icon: 'tabler-circle',
          href: '/admin/parameters/general'
        },
        {
          label: 'Reconciliation Parameters',
          icon: 'tabler-circle',
          href: '/admin/parameters/reconciliation'
        }
      ]
    },
    {
      label: 'Analytics',
      icon: 'tabler-chart-bar',
      children: [
        {
          label: 'Dashboard',
          icon: 'tabler-chart-line',
          href: '/dashboards/analytics'
        }
      ]
    },
    {
      label: 'System',
      icon: 'tabler-server',
      children: [
        {
          label: 'System Health',
          icon: 'tabler-heart-rate-monitor',
          href: '/admin/system-health'
        },
        {
          label: 'API Explorer',
          icon: 'tabler-api',
          href: '/admin/api-explorer'
        },
        {
          label: 'Database',
          icon: 'tabler-database',
          href: '/admin/database'
        }
      ]
    }
  ]

  // Return appropriate menu based on user role
  if (user?.is_superuser) {
    return [...commonMenuItems, ...adminMenuItems]
  }

  return commonMenuItems
}

export default verticalMenuData
