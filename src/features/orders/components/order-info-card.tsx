import type { ReactNode } from 'react'
import {
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { OrderDetail } from '../schemas'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Informação do cliente + meta da encomenda. */
export function OrderInfoCard({ order }: { order: OrderDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cliente & detalhes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row icon={<User className="size-4" />} label="Cliente">
          {order.customer}
        </Row>
        {order.email && (
          <Row icon={<Mail className="size-4" />} label="Email">
            {order.email}
          </Row>
        )}
        {order.phone && (
          <Row icon={<Phone className="size-4" />} label="Telefone">
            {order.phone}
          </Row>
        )}
        {order.shippingCity && (
          <Row icon={<MapPin className="size-4" />} label="Envio">
            {order.shippingCity}
          </Row>
        )}
        <Row icon={<CreditCard className="size-4" />} label="Pagamento">
          {order.payment}
        </Row>
        <Row icon={<Calendar className="size-4" />} label="Data">
          {formatDateTime(order.date)}
        </Row>
      </CardContent>
    </Card>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{children}</p>
      </div>
    </div>
  )
}
