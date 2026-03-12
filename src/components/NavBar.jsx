import { LayoutDashboard, ClipboardList, ShoppingCart, Settings } from 'lucide-react'
import useStore from '../store/useStore'

const TIER_LABELS = { low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High' }
const TIER_COLORS = {
  low:       'text-text-muted',
  medium:    'text-amber',
  high:      'text-orange',
  very_high: 'text-orange-glow',
}

export default function NavBar({ page, onNavigate }) {
  const { volumeTier } = useStore()

  return (
    <header className="sticky top-0 z-50 bg-base/90 backdrop-blur border-b border-border">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 group"
        >
          <span className="text-orange font-bold text-lg leading-none">FC</span>
          <span className="text-text-muted text-sm font-medium group-hover:text-text-primary transition-colors">
            Inventory
          </span>
        </button>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`nav-btn ${page === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard size={15} />
            Home
          </button>
          <button
            onClick={() => onNavigate('count')}
            className={`nav-btn ${page === 'count' ? 'active' : ''}`}
          >
            <ClipboardList size={15} />
            Count
          </button>
          <button
            onClick={() => onNavigate('order')}
            className={`nav-btn ${page === 'order' ? 'active' : ''}`}
          >
            <ShoppingCart size={15} />
            Order
          </button>
          <button
            onClick={() => onNavigate('manage')}
            className={`nav-btn ${page === 'manage' ? 'active' : ''}`}
          >
            <Settings size={15} />
            Manage
          </button>
        </nav>

        {/* Tier Badge */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-text-muted">Week:</span>
          <span className={`font-semibold ${TIER_COLORS[volumeTier]}`}>
            {TIER_LABELS[volumeTier]}
          </span>
        </div>
      </div>
    </header>
  )
}
