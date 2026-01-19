// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const horizontalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): HorizontalMenuDataType[] => [
  // This is how you will normally render submenu
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-smart-home',
    children: [
      // This is how you will normally render menu item
      {
        label: dictionary['navigation'].crm,
        icon: 'tabler-chart-pie-2',
        href: '/dashboards/crm'
      }
    ]
  },
  {
    label: dictionary['navigation'].apps,
    icon: 'tabler-mail',
    children: [
      {
        label: 'Banques',
        icon: 'tabler-building-bank',
        children: [
          {
            label: 'Comptes bancaires',
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
            href: '/admin/parameters/general'
          },
          {
            label: 'Reconciliation Parameters',
            href: '/admin/parameters/reconciliation'
          }
        ]
      },
      {
        label: dictionary['navigation'].reconciliation,
        icon: 'tabler-file-description',
        children: [
          {
            label: dictionary['navigation'].bank,
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
        label: dictionary['navigation'].logistics,
        icon: 'tabler-truck',
        children: [
          {
            label: dictionary['navigation'].dashboard,
            href: '/apps/logistics/dashboard'
          },
          {
            label: dictionary['navigation'].fleet,
            href: '/apps/logistics/fleet'
          }
        ]
      },
      {
        label: dictionary['navigation'].email,
        icon: 'tabler-mail',
        href: '/apps/email',
        exactMatch: false,
        activeUrl: '/apps/email'
      },
      {
        label: dictionary['navigation'].chat,
        icon: 'tabler-message-circle-2',
        href: '/apps/chat'
      },
      {
        label: dictionary['navigation'].calendar,
        icon: 'tabler-calendar',
        href: '/apps/calendar'
      },
      {
        label: dictionary['navigation'].kanban,
        icon: 'tabler-copy',
        href: '/apps/kanban'
      },
      {
        label: dictionary['navigation'].invoice,
        icon: 'tabler-file-description',
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/invoice/list'
          },
          {
            label: dictionary['navigation'].preview,
            icon: 'tabler-circle',
            href: '/apps/invoice/preview/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/preview'
          },
          {
            label: dictionary['navigation'].edit,
            icon: 'tabler-circle',
            href: '/apps/invoice/edit/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/edit'
          },
          {
            label: dictionary['navigation'].add,
            icon: 'tabler-circle',
            href: '/apps/invoice/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].user,
        icon: 'tabler-user',
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/user/list'
          },
          {
            label: dictionary['navigation'].view,
            icon: 'tabler-circle',
            href: '/apps/user/view'
          }
        ]
      },
      {
        label: dictionary['navigation'].rolesPermissions,
        icon: 'tabler-lock',
        children: [
          {
            label: dictionary['navigation'].roles,
            icon: 'tabler-circle',
            href: '/apps/roles'
          },
          {
            label: dictionary['navigation'].permissions,
            icon: 'tabler-circle',
            href: '/apps/permissions'
          }
        ]
      }
    ]
  },
  {
    label: dictionary['navigation'].pages,
    icon: 'tabler-file',
    children: [
      {
        label: dictionary['navigation'].userProfile,
        icon: 'tabler-user-circle',
        href: '/pages/user-profile'
      },
      {
        label: dictionary['navigation'].accountSettings,
        icon: 'tabler-settings',
        href: '/pages/account-settings'
      },
      {
        label: dictionary['navigation'].faq,
        icon: 'tabler-help-circle',
        href: '/pages/faq'
      },
      {
        label: dictionary['navigation'].pricing,
        icon: 'tabler-currency-dollar',
        href: '/pages/pricing'
      },
      {
        label: dictionary['navigation'].miscellaneous,
        icon: 'tabler-file-info',
        children: [
          {
            label: dictionary['navigation'].comingSoon,
            icon: 'tabler-circle',
            href: '/pages/misc/coming-soon',
            target: '_blank'
          },
          {
            label: dictionary['navigation'].underMaintenance,
            icon: 'tabler-circle',
            href: '/pages/misc/under-maintenance',
            target: '_blank'
          },
          {
            label: dictionary['navigation'].pageNotFound404,
            icon: 'tabler-circle',
            href: '/pages/misc/404-not-found',
            target: '_blank'
          },
          {
            label: dictionary['navigation'].notAuthorized401,
            icon: 'tabler-circle',
            href: '/pages/misc/401-not-authorized',
            target: '_blank'
          }
        ]
      },
      {
        label: dictionary['navigation'].authPages,
        icon: 'tabler-shield-lock',
        children: [
          {
            label: dictionary['navigation'].login,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].loginV1,
                icon: 'tabler-circle',
                href: '/pages/auth/login-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].loginV2,
                icon: 'tabler-circle',
                href: '/pages/auth/login-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: dictionary['navigation'].register,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].registerV1,
                icon: 'tabler-circle',
                href: '/pages/auth/register-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].registerV2,
                icon: 'tabler-circle',
                href: '/pages/auth/register-v2',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].registerMultiSteps,
                icon: 'tabler-circle',
                href: '/pages/auth/register-multi-steps',
                target: '_blank'
              }
            ]
          },
          {
            label: dictionary['navigation'].verifyEmail,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].verifyEmailV1,
                icon: 'tabler-circle',
                href: '/pages/auth/verify-email-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].verifyEmailV2,
                icon: 'tabler-circle',
                href: '/pages/auth/verify-email-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: dictionary['navigation'].forgotPassword,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].forgotPasswordV1,
                icon: 'tabler-circle',
                href: '/pages/auth/forgot-password-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].forgotPasswordV2,
                icon: 'tabler-circle',
                href: '/pages/auth/forgot-password-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: dictionary['navigation'].resetPassword,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].resetPasswordV1,
                icon: 'tabler-circle',
                href: '/pages/auth/reset-password-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].resetPasswordV2,
                icon: 'tabler-circle',
                href: '/pages/auth/reset-password-v2',
                target: '_blank'
              }
            ]
          },
          {
            label: dictionary['navigation'].twoSteps,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].twoStepsV1,
                icon: 'tabler-circle',
                href: '/pages/auth/two-steps-v1',
                target: '_blank'
              },
              {
                label: dictionary['navigation'].twoStepsV2,
                icon: 'tabler-circle',
                href: '/pages/auth/two-steps-v2',
                target: '_blank'
              }
            ]
          }
        ]
      },
      {
        label: dictionary['navigation'].wizardExamples,
        icon: 'tabler-dots',
        children: [
          {
            label: dictionary['navigation'].checkout,
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/checkout'
          },
          {
            label: dictionary['navigation'].propertyListing,
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/property-listing'
          },
          {
            label: dictionary['navigation'].createDeal,
            icon: 'tabler-circle',
            href: '/pages/wizard-examples/create-deal'
          }
        ]
      },
      {
        label: dictionary['navigation'].dialogExamples,
        icon: 'tabler-square',
        href: '/pages/dialog-examples'
      },
      {
        label: dictionary['navigation'].widgetExamples,
        icon: 'tabler-chart-bar',
        children: [
          {
            label: dictionary['navigation'].basic,
            href: '/pages/widget-examples/basic'
          },
          {
            label: dictionary['navigation'].advanced,
            icon: 'tabler-circle',
            href: '/pages/widget-examples/advanced'
          },
          {
            label: dictionary['navigation'].statistics,
            icon: 'tabler-circle',
            href: '/pages/widget-examples/statistics'
          },
          {
            label: dictionary['navigation'].charts,
            icon: 'tabler-circle',
            href: '/pages/widget-examples/charts'
          },
          {
            label: dictionary['navigation'].actions,
            href: '/pages/widget-examples/actions'
          }
        ]
      },
      {
        label: dictionary['navigation'].frontPages,
        icon: 'tabler-files',
        children: [
          {
            label: dictionary['navigation'].landing,
            href: '/front-pages/landing-page',
            target: '_blank',
            excludeLang: true
          },
          {
            label: dictionary['navigation'].pricing,
            href: '/front-pages/pricing',
            target: '_blank',
            excludeLang: true
          },
          {
            label: dictionary['navigation'].payment,
            href: '/front-pages/payment',
            target: '_blank',
            excludeLang: true
          },
          {
            label: dictionary['navigation'].checkout,
            href: '/front-pages/checkout',
            target: '_blank',
            excludeLang: true
          },
          {
            label: dictionary['navigation'].helpCenter,
            href: '/front-pages/help-center',
            target: '_blank',
            excludeLang: true
          }
        ]
      }
    ]
  },
  {
    label: dictionary['navigation'].others,
    icon: 'tabler-dots',
    children: [
      {
        label: dictionary['navigation'].raiseSupport,
        icon: 'tabler-lifebuoy',
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank',
        href: 'https://pixinvent.ticksy.com'
      },
      {
        label: dictionary['navigation'].documentation,
        icon: 'tabler-book-2',
        suffix: <i className='tabler-external-link text-xl' />,
        target: '_blank',
        href: `${process.env.NEXT_PUBLIC_DOCS_URL}`
      },
      {
        suffix: {
          label: 'New',
          color: 'info'
        },
        label: dictionary['navigation'].itemWithBadge,
        icon: 'tabler-notification'
      },
      {
        label: dictionary['navigation'].externalLink,
        icon: 'tabler-link',
        href: 'https://pixinvent.com',
        target: '_blank',
        suffix: <i className='tabler-external-link text-xl' />
      },
      {
        label: dictionary['navigation'].menuLevels,
        icon: 'tabler-menu-2',
        children: [
          {
            label: dictionary['navigation'].menuLevel2,
            icon: 'tabler-circle'
          },
          {
            label: dictionary['navigation'].menuLevel2,
            icon: 'tabler-circle',
            children: [
              {
                label: dictionary['navigation'].menuLevel3,
                icon: 'tabler-circle'
              },
              {
                label: dictionary['navigation'].menuLevel3,
                icon: 'tabler-circle'
              }
            ]
          }
        ]
      },
      {
        label: dictionary['navigation'].disabledMenu,
        disabled: true
      }
    ]
  }
]

export default horizontalMenuData
