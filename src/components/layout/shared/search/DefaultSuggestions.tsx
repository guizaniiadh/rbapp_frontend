// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

type DefaultSuggestionsType = {
  sectionLabel: string
  items: {
    label: string
    href: string
    icon?: string
  }[]
}

// Curated suggestions aligned with Bank Reconciliation Admin
const defaultSuggestions: DefaultSuggestionsType[] = [
  {
    sectionLabel: 'Administration',
    items: [
      { label: 'Tableau de bord', href: '/home', icon: 'tabler-smart-home' },
      { label: 'Journaux', href: '/admin/logs', icon: 'tabler-file-text' },
      { label: 'Piste d’audit', href: '/admin/audit-trail', icon: 'tabler-history' }
    ]
  },
  {
    sectionLabel: 'Rapprochement',
    items: [
      { label: 'Transactions', href: '/reconciliation/transactions', icon: 'tabler-arrows-shuffle' },
      { label: 'Rapprochement bancaire', href: '/apps/reconciliation/bank', icon: 'tabler-file-check' }
    ]
  },
  {
    sectionLabel: 'Paramètres',
    items: [
      { label: 'Paramètres généraux', href: '/admin/parameters/general', icon: 'tabler-adjustments' },
      { label: 'Paramètres de rapprochement', href: '/admin/parameters/reconciliation', icon: 'tabler-settings-cog' }
    ]
  },
  {
    sectionLabel: 'Banques',
    items: [
      { label: 'Comptes bancaires', href: '/admin/banques/comptes-bancaires', icon: 'tabler-building-bank' }
    ]
  },
  {
    sectionLabel: 'Documents',
    items: [
      { label: 'Documents client', href: '/documents/customer', icon: 'tabler-file' },
      { label: 'Écritures client', href: '/documents/customer-ledger-entries', icon: 'tabler-list-details' },
      { label: 'Écritures bancaires', href: '/documents/bank-ledger-entries', icon: 'tabler-list' }
    ]
  },
  {
    sectionLabel: 'Utilisateurs et rôles',
    items: [
      { label: 'Utilisateurs', href: '/apps/user/list', icon: 'tabler-users' },
      { label: 'Rôles', href: '/apps/roles', icon: 'tabler-shield' },
      { label: 'Permissions', href: '/apps/permissions', icon: 'tabler-key' }
    ]
  },
  {
    sectionLabel: 'Système',
    items: [
      { label: 'Santé du système', href: '/admin/system-health', icon: 'tabler-heart-rate-monitor' },
      { label: 'Explorateur API', href: '/admin/api-explorer', icon: 'tabler-api' },
      { label: 'Base de données', href: '/admin/database', icon: 'tabler-database' }
    ]
  }
]

const DefaultSuggestions = ({ setOpen }: { setOpen: (value: boolean) => void }) => {
  // Hooks
  const { lang: locale } = useParams()
  const isFr = locale === 'fr'

  const sectionKpis: Record<string, { label: string; value: string }[]> = {
    'Popular Searches': [
      { label: isFr ? 'Tendances' : 'Trends', value: '↑ 12%' },
      { label: isFr ? 'Recherches' : 'Searches', value: '2.1k' }
    ],
    Apps: [
      { label: isFr ? 'Actives' : 'Active', value: '7' },
      { label: isFr ? 'Mises à jour' : 'Updates', value: '3' }
    ],
    Pages: [
      { label: isFr ? 'Visites' : 'Visits', value: '15.4k' },
      { label: isFr ? 'Conversion' : 'Conversion', value: '3.2%' }
    ],
    'Forms & Charts': [
      { label: isFr ? 'Formulaires' : 'Forms', value: '24' },
      { label: isFr ? 'Graphiques' : 'Charts', value: '12' }
    ]
  }

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase text-textDisabled tracking-[0.8px]'>
            {section.sectionLabel}
          </p>
          {sectionKpis[section.sectionLabel] && (
            <div className='flex gap-2 flex-wrap'>
              {sectionKpis[section.sectionLabel].map((kpi, k) => (
                <span key={k} className='inline-flex items-center gap-1 text-xs border rounded px-2 py-1'>
                  <i className='tabler-chart-dots text-sm' />
                  <span className='text-textSecondary'>{kpi.label}:</span>
                  <span className='font-medium'>{kpi.value}</span>
                </span>
              ))}
            </div>
          )}
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale as Locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
