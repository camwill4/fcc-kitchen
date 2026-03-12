import { useRef } from 'react'
import { ArrowRight, Home } from 'lucide-react'
import useStore from '../store/useStore'
import PRODUCTS, { CATEGORIES } from '../data/products'

const TIER_LABELS = { low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High' }

export default function CountForm({ onNavigate }) {
  const { volumeTier, counts, setCount, products } = useStore()
  const PRODUCTS = products
  const inputRefs = useRef({})

  const totalItems = PRODUCTS.length
  const countedItems = Object.values(counts).filter((v) => v !== '' && v !== undefined).length

  const handleKey = (e, currentId) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      const ids = PRODUCTS.map((p) => p.id)
      const idx = ids.indexOf(currentId)
      const next = ids[idx + 1]
      if (next && inputRefs.current[next]) {
        inputRefs.current[next].focus()
        inputRefs.current[next].select()
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Enter Count</h1>
          <p className="text-text-muted text-sm mt-1">
            How much do you have on hand right now?
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Volume</p>
          <p className="text-sm font-bold text-amber">{TIER_LABELS[volumeTier]}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 space-y-1.5">
        <div className="flex justify-between text-xs text-text-muted">
          <span>{countedItems} of {totalItems} counted</span>
          <span>{Math.round((countedItems / totalItems) * 100)}%</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-orange rounded-full transition-all duration-300"
            style={{ width: `${(countedItems / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-8">
        {CATEGORIES.map((category) => {
          const items = PRODUCTS.filter((p) => p.category === category)
          if (items.length === 0) return null

          const catCounted = items.filter(
            (p) => counts[p.id] !== undefined && counts[p.id] !== ''
          ).length

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="category-header mb-0">{category}</h2>
                <span className="text-xs text-text-muted">
                  {catCounted}/{items.length}
                </span>
              </div>

              <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
                {items.map((product, idx) => {
                  const par = product.pars[volumeTier]
                  const onHand = parseFloat(counts[product.id]) || 0
                  const isLow = counts[product.id] !== undefined &&
                    counts[product.id] !== '' &&
                    onHand < par

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${
                        idx < items.length - 1 ? 'border-b border-border' : ''
                      } ${isLow ? 'bg-orange/5' : ''}`}
                    >
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {[product.detail, product.unit].filter(Boolean).join(' · ')}
                        </p>
                      </div>

                      {/* Par Target */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-text-muted">par</p>
                        <p className={`text-xs font-semibold ${isLow ? 'text-orange' : 'text-amber'}`}>
                          {product.unit === 'each' && product.parUnit === 'case' && product.eachsPerCase
                            ? `${par * product.eachsPerCase} ea`
                            : par}
                        </p>
                        {product.unit === 'each' && product.parUnit === 'case' && product.eachsPerCase && (
                          <p className="text-xs text-text-muted opacity-60">{par} case</p>
                        )}
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseFloat(counts[product.id]) || 0
                            setCount(product.id, Math.max(0, cur - 1))
                          }}
                          className="w-7 h-7 rounded-lg bg-surface-2 border border-border text-text-muted hover:border-orange hover:text-orange transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          −
                        </button>
                        <input
                          ref={(el) => (inputRefs.current[product.id] = el)}
                          type="number"
                          min="0"
                          step="0.25"
                          placeholder="0"
                          value={counts[product.id] ?? ''}
                          onChange={(e) => setCount(product.id, e.target.value)}
                          onKeyDown={(e) => handleKey(e, product.id)}
                          className="count-input"
                          inputMode="decimal"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = parseFloat(counts[product.id]) || 0
                            setCount(product.id, cur + 1)
                          }}
                          className="w-7 h-7 rounded-lg bg-surface-2 border border-border text-text-muted hover:border-orange hover:text-orange transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                        {counts[product.id] !== undefined && counts[product.id] !== '' && (
                          <div className="shrink-0 text-left" style={{minWidth: '2.5rem'}}>
                            <span className="text-xs text-text-muted">{product.unit}</span>
                            {product.unit === 'each' && product.eachsPerCase && (
                              <p className="text-xs text-text-muted opacity-60 leading-tight">
                                {product.eachsPerCase}/case
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button className="primary-btn flex-1 flex items-center justify-center gap-2" onClick={() => onNavigate('order')}>
          Generate Order Sheet <ArrowRight size={15} />
        </button>
        <button className="secondary-btn flex items-center gap-2" onClick={() => onNavigate('dashboard')}>
          <Home size={14} /> Home
        </button>
      </div>
    </div>
  )
}
