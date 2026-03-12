import { ClipboardList, ShoppingCart, RotateCcw, TrendingUp } from 'lucide-react'
import useStore from '../store/useStore'
import PRODUCTS from '../data/products'

const TIERS = [
  {
    id: 'low',
    label: 'Low',
    sub: 'Slow week',
    desc: '65% of standard par',
    color: 'text-text-muted',
  },
  {
    id: 'medium',
    label: 'Medium',
    sub: 'Standard week',
    desc: '100% — baseline par',
    color: 'text-amber',
  },
  {
    id: 'high',
    label: 'High',
    sub: 'Busy week',
    desc: '135% of standard par',
    color: 'text-orange',
  },
  {
    id: 'very_high',
    label: 'Very High',
    sub: 'Peak service',
    desc: '165% of standard par',
    color: 'text-orange-glow',
  },
]

export default function Dashboard({ onNavigate }) {
  const { volumeTier, setVolumeTier, counts, resetCounts, products } = useStore()
  const PRODUCTS = products

  const totalItems = PRODUCTS.length
  const countedItems = Object.values(counts).filter((v) => v !== '' && v !== undefined).length
  const pct = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0

  const needsOrder = PRODUCTS.filter((prod) => {
    const onHand = parseFloat(counts[prod.id]) || 0
    const par = prod.pars[volumeTier]
    return par - onHand > 0
  }).length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl tracking-wide" style={{ fontFamily: "'Righteous', cursive" }}>Full Circle Diner</h1>
        <p className="text-text-muted mt-1 text-sm">Inventory & Order Manager</p>
      </div>

      {/* Volume Tier Selector */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          This Week's Expected Volume
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setVolumeTier(tier.id)}
              className={`tier-card text-left ${volumeTier === tier.id ? 'active' : ''}`}
            >
              <span className={`text-xl font-bold ${tier.color}`}>{tier.label}</span>
              <span className="text-text-primary text-sm font-medium">{tier.sub}</span>
              <span className="text-text-muted text-xs">{tier.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats Bento */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card">
          <p className="text-text-muted text-xs mb-1">Items Counted</p>
          <p className="text-2xl font-bold text-text-primary">{countedItems}</p>
          <p className="text-text-muted text-xs mt-0.5">of {totalItems} total</p>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card">
          <p className="text-text-muted text-xs mb-1">Count Progress</p>
          <p className="text-2xl font-bold text-amber">{pct}%</p>
          <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-amber rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-5 border border-border shadow-card">
          <p className="text-text-muted text-xs mb-1">Items to Order</p>
          <p className="text-2xl font-bold text-orange">{needsOrder}</p>
          <p className="text-text-muted text-xs mt-0.5">at {TIERS.find(t=>t.id===volumeTier)?.label} par</p>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="flex flex-col sm:flex-row gap-3">
        <button className="primary-btn flex-1 flex items-center justify-center gap-2" onClick={() => onNavigate('count')}>
          <ClipboardList size={16} /> Enter Count
        </button>
        <button className="secondary-btn flex-1 flex items-center justify-center gap-2" onClick={() => onNavigate('order')}>
          <ShoppingCart size={16} /> View Order Sheet
        </button>
      </section>

      {/* Reset */}
      {countedItems > 0 && (
        <section className="flex justify-center">
          <button
            onClick={() => {
              if (confirm('Reset all counts for a new week?')) resetCounts()
            }}
            className="text-xs text-text-muted hover:text-orange transition-colors underline underline-offset-2"
          >
            <span className="flex items-center gap-1"><RotateCcw size={11} /> Reset all counts (start new week)</span>
          </button>
        </section>
      )}
    </div>
  )
}
