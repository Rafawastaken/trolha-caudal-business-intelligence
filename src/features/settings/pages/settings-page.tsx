import { PageHeader } from '@/components/layout/page-header'

import { AboutCard } from '../components/about-card'
import { AccountCard } from '../components/account-card'
import { AppearanceCard } from '../components/appearance-card'
import { DataConnectionCard } from '../components/data-connection-card'
import { PreferencesCard } from '../components/preferences-card'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Definições"
        description="Conta, aparência e preferências da aplicação"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AccountCard className="lg:col-span-2" />
        <AppearanceCard />
        <PreferencesCard />
        <DataConnectionCard />
        <AboutCard />
      </div>
    </div>
  )
}
