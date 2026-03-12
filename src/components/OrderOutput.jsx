import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { ArrowLeft, Home, Copy, Check, Send, Loader } from 'lucide-react'
import useStore from '../store/useStore'
import { VENDORS } from '../data/products'

const TIER_LABELS = { low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High' }

export default function OrderOutput({ onNavigate }) {
  const { volumeTier, counts, products, vendors, vendorEmails, emailjsConfig } = useStore()
  const PRODUCTS = products
  const [showAll, setShowAll] = useState(false)
  const [copiedVendor, setCopiedVendor] = useState(null)
  const [emailStatus, setEmailStatus] = useState({}) // { [vendor]: 'sending' | 'sent' | 'error' }

  const getOrderQty = (product) => {
    const onHand = parseFloat(counts[product.id]) || 0
    const par = product.pars[volumeTier]

    if (product.unit === 'each' && product.eachsPerCase) {
      // par in eachs: compare directly, convert shortage to cases (ceiling)
      if (product.parUnit === 'each') {
        const shortageEachs = Math.max(0, par - onHand)
        return Math.ceil(shortageEachs / product.eachsPerCase)
      }
      // par in cases: convert par to eachs for comparison, output in cases
      if (product.parUnit === 'case') {
        const parEachs = par * product.eachsPerCase
        const shortageEachs = Math.max(0, parEachs - onHand)
        return Math.ceil(shortageEachs / product.eachsPerCase)
      }
    }

    return Math.max(0, +(par - onHand).toFixed(2))
  }

  const getOrderUnit = (product) => {
    if (product.unit === 'each' && product.eachsPerCase) return 'case'
    return product.unit
  }

  const emailjsReady = emailjsConfig.publicKey && emailjsConfig.serviceId && emailjsConfig.templateId

  const sendOrderEmail = async (vendor, items) => {
    const email = vendorEmails[vendor]
    if (!email || !emailjsReady) return
    setEmailStatus((s) => ({ ...s, [vendor]: 'sending' }))
    const orderList = items
      .filter((i) => i.orderQty > 0)
      .map((i) => `${i.orderQty} ${getOrderUnit(i)}  —  ${i.name}${i.detail ? ' (' + i.detail + ')' : ''}`)
      .join('\n')
    try {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        {
          to_email:        email,
          vendor_name:     vendor,
          week_volume:     TIER_LABELS[volumeTier],
          order_list:      orderList,
          restaurant_name: 'Full Circle Diner',
        },
        emailjsConfig.publicKey
      )
      setEmailStatus((s) => ({ ...s, [vendor]: 'sent' }))
      setTimeout(() => setEmailStatus((s) => ({ ...s, [vendor]: null })), 3000)
    } catch {
      setEmailStatus((s) => ({ ...s, [vendor]: 'error' }))
      setTimeout(() => setEmailStatus((s) => ({ ...s, [vendor]: null })), 4000)
    }
  }

  const vendorData = vendors.map((vendor) => {
    const items = PRODUCTS.filter((p) => p.vendor === vendor)
    const orderItems = items
      .map((p) => ({ ...p, orderQty: getOrderQty(p) }))
      .filter((p) => showAll || p.orderQty > 0)
      .sort((a, b) => b.orderQty - a.orderQty)

    const needsOrderCount = items.filter((p) => getOrderQty(p) > 0).length

    return { vendor, orderItems, needsOrderCount, totalItems: items.length }
  }).filter((v) => v.totalItems > 0)

  const totalOrderItems = PRODUCTS.filter((p) => getOrderQty(p) > 0).length

  const copyVendorList = (vendor, items) => {
    const lines = [`${vendor} — ${TIER_LABELS[volumeTier]} Week`, '']
    items
      .filter((i) => i.orderQty > 0)
      .forEach((i) => {
        lines.push(`${i.orderQty} ${i.unit}  ${i.name}${i.detail ? ' (' + i.detail + ')' : ''}`)
      })
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedVendor(vendor)
      setTimeout(() => setCopiedVendor(null), 2000)
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Order Sheet</h1>
          <p className="text-text-muted text-sm mt-1">
            {totalOrderItems} items need ordering this week
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Volume</p>
          <p className="text-sm font-bold text-amber">{TIER_LABELS[volumeTier]}</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
        >
          {showAll ? 'Show only items to order' : 'Show all items'}
        </button>
      </div>

      {/* Vendor Sections */}
      <div className="space-y-6">
        {vendorData.map(({ vendor, orderItems, needsOrderCount }) => {
          if (!showAll && needsOrderCount === 0) return null

          return (
            <section key={vendor}>
              {/* Vendor Header */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <h2 className="vendor-header">{vendor}</h2>
                  {needsOrderCount > 0 && (
                    <span className="text-xs bg-orange/20 text-orange px-2 py-0.5 rounded-full font-medium">
                      {needsOrderCount} items
                    </span>
                  )}
                </div>
                {needsOrderCount > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => copyVendorList(vendor, orderItems)}
                      className="text-xs text-text-muted hover:text-amber transition-colors flex items-center gap-1"
                    >
                      {copiedVendor === vendor ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                    {(() => {
                      const hasEmail = !!vendorEmails[vendor]
                      const status = emailStatus[vendor]
                      const disabled = !hasEmail || !emailjsReady
                      return (
                        <button
                          onClick={() => {
                              const itemCount = orderItems.filter(i => i.orderQty > 0).length
                              if (confirm(`Send ${itemCount} item order to ${vendor} at ${vendorEmails[vendor]}?`)) {
                                sendOrderEmail(vendor, orderItems)
                              }
                            }}
                          disabled={disabled || status === 'sending'}
                          title={!emailjsReady ? 'Configure EmailJS in Manage settings' : !hasEmail ? 'Add email for this vendor in Manage' : 'Send order email'}
                          className={`text-xs flex items-center gap-1 transition-colors ${
                            disabled
                              ? 'text-text-muted opacity-40 cursor-not-allowed'
                              : status === 'sent'
                              ? 'text-amber'
                              : status === 'error'
                              ? 'text-red-400'
                              : 'text-text-muted hover:text-orange'
                          }`}
                        >
                          {status === 'sending' && <><Loader size={12} className="animate-spin" /> Sending</>}
                          {status === 'sent'    && <><Check size={12} /> Sent</>}
                          {status === 'error'   && <>✕ Failed</>}
                          {!status && <><Send size={12} /> Send</>}
                        </button>
                      )
                    })()}
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
                {orderItems.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-text-muted">
                    All stocked — no order needed.
                  </div>
                ) : (
                  orderItems.map((product, idx) => {
                    const isOrder = product.orderQty > 0
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 px-4 py-3.5 ${
                          idx < orderItems.length - 1 ? 'border-b border-border' : ''
                        } ${!isOrder ? 'opacity-40' : ''}`}
                      >
                        {/* Order Qty — prominent */}
                        <div className="w-14 shrink-0 text-right">
                          {isOrder ? (
                            <span className="text-base font-bold text-orange">
                              {product.orderQty}
                            </span>
                          ) : (
                            <span className="text-sm text-text-muted">—</span>
                          )}
                          <p className="text-xs text-text-muted">{getOrderUnit(product)}</p>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-8 bg-border shrink-0" />

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {product.name}
                          </p>
                          {product.detail && (
                            <p className="text-xs text-text-muted truncate">{product.detail}</p>
                          )}
                        </div>

                        {/* On Hand / Par */}
                        <div className="text-right shrink-0 space-y-0.5">
                          <div className="flex gap-3 justify-end text-xs">
                            <span className="text-text-muted">
                              on hand{' '}
                              <span className="text-text-primary font-medium">
                                {parseFloat(counts[product.id]) || 0}
                              </span>
                            </span>
                            <span className="text-text-muted">
                              par{' '}
                              <span className="text-amber font-medium">
                                {product.pars[volumeTier]}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button className="secondary-btn flex-1 flex items-center justify-center gap-2" onClick={() => onNavigate('count')}>
          <ArrowLeft size={14} /> Back to Count
        </button>
        <button className="secondary-btn flex items-center gap-2" onClick={() => onNavigate('dashboard')}>
          <Home size={14} /> Home
        </button>
      </div>
    </div>
  )
}
