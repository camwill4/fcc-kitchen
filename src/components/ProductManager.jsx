import { useState, useRef } from 'react'
import { Pencil, Trash2, Plus, ChevronDown, ChevronUp, Search, RotateCcw, Check, X, Mail, Settings2, Download, Upload } from 'lucide-react'
import useStore from '../store/useStore'

const BLANK = {
  id: '',
  name: '',
  detail: '',
  unit: 'case',
  eachsPerCase: null,
  parUnit: 'case',
  vendor: 'Sysco',
  category: 'Meat',
  pars: { low: 0, medium: 0, high: 0, very_high: 0 },
}

function generateId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
}

function ceilQuarter(n) {
  return Math.ceil(n / 0.25) * 0.25
}

function derivePars(medium) {
  const m = parseFloat(medium) || 0
  return {
    low:       ceilQuarter(m * 0.65),
    medium:    m,
    high:      ceilQuarter(m * 1.35),
    very_high: ceilQuarter(m * 1.65),
  }
}

function ProductRow({ product, onSave, onDelete }) {
  const { vendors, categories } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(product)

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }))
  const setPar = (tier, value) =>
    setDraft((d) => ({
      ...d,
      pars: tier === 'medium'
        ? derivePars(value)
        : { ...d.pars, [tier]: parseFloat(value) || 0 },
    }))

  const handleSave = () => {
    onSave(product.id, draft)
    setOpen(false)
  }

  const handleCancel = () => {
    setDraft(product)
    setOpen(false)
  }

  return (
    <div className={`border-b border-border last:border-0 ${open ? 'bg-surface-2' : ''}`}>
      {/* Row Summary */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
          <p className="text-xs text-text-muted truncate">
            {[product.detail, product.unit, product.vendor].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-xs text-text-muted">
          <span className="hidden sm:inline">med par</span>
          <span className="font-semibold text-amber">{product.pars.medium}</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-orange transition-colors"
        >
          {open ? <ChevronUp size={15} /> : <Pencil size={15} />}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${product.name}"?`)) onDelete(product.id)
          }}
          className="p-1.5 rounded-lg hover:bg-surface text-text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Edit Form */}
      {open && (
        <div className="px-4 pb-5 space-y-4 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Name</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Case details, or volume/weight of packaging</label>
              <input
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.detail}
                onChange={(e) => set('detail', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Unit</label>
              <select
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.unit}
                onChange={(e) => set('unit', e.target.value)}
              >
                <option value="case">case</option>
                <option value="each">each</option>
              </select>
            </div>
            {draft.unit === 'each' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs text-text-muted">Eachs per case</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 12"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                    value={draft.eachsPerCase ?? ''}
                    onChange={(e) => set('eachsPerCase', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-muted">Par unit</label>
                  <div className="flex rounded-xl border border-border overflow-hidden">
                    {['each', 'case'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => set('parUnit', u)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          (draft.parUnit ?? 'case') === u
                            ? 'bg-orange text-white'
                            : 'bg-surface text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted opacity-60">
                    {(draft.parUnit ?? 'case') === 'each'
                      ? 'Pars are in individual units — order sheet converts to cases'
                      : 'Pars are in cases — count entered in eachs'}
                  </p>
                </div>
              </>
            )}
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Vendor</label>
              <select
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.vendor}
                onChange={(e) => set('vendor', e.target.value)}
              >
                {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Category</label>
              <select
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Par Levels */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-xs text-text-muted">Par Levels</p>
              <p className="text-xs text-text-muted opacity-60">— set Medium first, others auto-adjust</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'low',       label: 'Low',       hint: '65%' },
                { key: 'medium',    label: 'Medium',    hint: 'baseline' },
                { key: 'high',      label: 'High',      hint: '135%' },
                { key: 'very_high', label: 'Very High', hint: '165%' },
              ].map(({ key, label, hint }) => (
                <div key={key} className="space-y-1">
                  <label className={`text-xs block text-center ${key === 'medium' ? 'text-orange font-semibold' : 'text-text-muted'}`}>
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    className={`w-full rounded-xl border px-2 py-2 text-sm text-center font-semibold focus:outline-none transition-colors
                      ${key === 'medium'
                        ? 'border-orange/50 bg-orange/5 text-orange focus:border-orange'
                        : 'border-border bg-surface text-amber focus:border-orange'
                      }`}
                    value={draft.pars[key]}
                    onChange={(e) => setPar(key, e.target.value)}
                  />
                  <p className="text-xs text-text-muted text-center opacity-50">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={handleSave} className="primary-btn text-sm py-2">
              Save
            </button>
            <button onClick={handleCancel} className="secondary-btn text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddProductForm({ onSave, onCancel }) {
  const { vendors, categories } = useStore()
  const [draft, setDraft] = useState({ ...BLANK })

  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }))
  const setPar = (tier, value) =>
    setDraft((d) => ({
      ...d,
      pars: tier === 'medium'
        ? derivePars(value)
        : { ...d.pars, [tier]: parseFloat(value) || 0 },
    }))

  const handleSave = () => {
    if (!draft.name.trim()) return
    onSave({ ...draft, id: generateId(draft.name) })
  }

  return (
    <div className="bg-surface rounded-2xl border border-orange/50 p-5 space-y-4 shadow-orange-glow">
      <p className="text-sm font-semibold text-orange">New Product</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Name *</label>
          <input
            className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            placeholder="e.g. Chicken Leg Meat"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Case details, or volume/weight of packaging</label>
          <input
            className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            placeholder="e.g. 4/10lb per case"
            value={draft.detail}
            onChange={(e) => set('detail', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Unit</label>
          <select
            className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            value={draft.unit}
            onChange={(e) => set('unit', e.target.value)}
          >
            <option value="case">case</option>
            <option value="each">each</option>
          </select>
        </div>
        {draft.unit === 'each' && (
          <>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Eachs per case</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 12"
                className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
                value={draft.eachsPerCase ?? ''}
                onChange={(e) => set('eachsPerCase', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Par unit</label>
              <div className="flex rounded-xl border border-border overflow-hidden">
                {['each', 'case'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => set('parUnit', u)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      (draft.parUnit ?? 'case') === u
                        ? 'bg-orange text-white'
                        : 'bg-base text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted opacity-60">
                {(draft.parUnit ?? 'case') === 'each'
                  ? 'Pars are in individual units — order sheet converts to cases'
                  : 'Pars are in cases — count entered in eachs'}
              </p>
            </div>
          </>
        )}
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Vendor</label>
          <select
            className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            value={draft.vendor}
            onChange={(e) => set('vendor', e.target.value)}
          >
            {VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted">Category</label>
          <select
            className="w-full rounded-xl border border-border bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            value={draft.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-xs text-text-muted">Par Levels</p>
          <p className="text-xs text-text-muted opacity-60">— set Medium first, others auto-adjust</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'low',       label: 'Low',       hint: '65%' },
            { key: 'medium',    label: 'Medium',    hint: 'baseline' },
            { key: 'high',      label: 'High',      hint: '135%' },
            { key: 'very_high', label: 'Very High', hint: '165%' },
          ].map(({ key, label, hint }) => (
            <div key={key} className="space-y-1">
              <label className={`text-xs block text-center ${key === 'medium' ? 'text-orange font-semibold' : 'text-text-muted'}`}>
                {label}
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                className={`w-full rounded-xl border px-2 py-2 text-sm text-center font-semibold focus:outline-none transition-colors
                  ${key === 'medium'
                    ? 'border-orange/50 bg-orange/5 text-orange focus:border-orange'
                    : 'border-border bg-base text-amber focus:border-orange'
                  }`}
                value={draft.pars[key]}
                onChange={(e) => setPar(key, e.target.value)}
              />
              <p className="text-xs text-text-muted text-center opacity-50">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} className="primary-btn text-sm py-2">
          Add Product
        </button>
        <button onClick={onCancel} className="secondary-btn text-sm py-2">
          Cancel
        </button>
      </div>
    </div>
  )
}

function EditableList({ title, items, onAdd, onRename, onDelete, emails, onEmailChange }) {
  const [open, setOpen] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    if (!newValue.trim()) return
    onAdd(newValue.trim())
    setNewValue('')
  }

  const startEdit = (idx) => {
    setEditingIndex(idx)
    setEditValue(items[idx])
  }

  const commitEdit = (idx) => {
    if (editValue.trim() && editValue.trim() !== items[idx]) {
      onRename(items[idx], editValue.trim())
    }
    setEditingIndex(null)
  }

  const cancelEdit = () => setEditingIndex(null)

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-2 transition-colors"
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{items.length} items</span>
          {open ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border">
          {items.map((item, idx) => (
            <div key={item} className="flex items-center gap-2 px-4 py-2.5 border-b border-border last:border-0">
              {editingIndex === idx ? (
                <>
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border border-orange bg-surface-2 px-3 py-1.5 text-sm text-text-primary focus:outline-none"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(idx)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button onClick={() => commitEdit(idx)} className="p-1.5 rounded-lg text-text-muted hover:text-orange transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={cancelEdit} className="p-1.5 rounded-lg text-text-muted hover:text-orange transition-colors">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-text-primary">{item}</span>
                    <button onClick={() => startEdit(idx)} className="p-1.5 rounded-lg text-text-muted hover:text-orange transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item}"? Products assigned to it will keep the value but it won't appear in the dropdown.`)) {
                          onDelete(item)
                        }
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {emails && onEmailChange && (
                    <div className="flex items-center gap-2 pb-1">
                      <Mail size={11} className="text-text-muted shrink-0" />
                      <input
                        type="email"
                        placeholder="Order email address..."
                        className="flex-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange transition-colors"
                        value={emails[item] ?? ''}
                        onChange={(e) => onEmailChange(item, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add new */}
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-orange transition-colors"
              placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange/10 border border-orange/30 text-orange text-sm font-medium hover:bg-orange/20 transition-colors"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductManager() {
  const {
    products, updateProduct, addProduct, deleteProduct, resetProducts,
    vendors, categories,
    addVendor, renameVendor, deleteVendor,
    addCategory, renameCategory, deleteCategory,
    vendorEmails, setVendorEmail,
    emailjsConfig, setEmailjsConfig,
    importData,
  } = useStore()

  const importRef = useRef(null)
  const [emailjsOpen, setEmailjsOpen] = useState(false)

  const handleExport = () => {
    const data = { version: 1, products, vendors, categories, vendorEmails, emailjsConfig }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fcc-inventory-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.products || !data.vendors || !data.categories) {
          alert('Invalid backup file.')
          return
        }
        if (confirm('This will replace all current data with the imported file. Continue?')) {
          importData(data)
        }
      } catch {
        alert('Could not read file. Make sure it\'s a valid FCC backup.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCategory === 'All' || p.category === filterCategory
    return matchSearch && matchCat
  })

  const grouped = categories.map((cat) => ({
    category: cat,
    items: filtered.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0)

  // also catch products whose category isn't in the list
  const uncategorized = filtered.filter((p) => !categories.includes(p.category))

  const handleAdd = (product) => {
    addProduct(product)
    setAdding(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Manage Products</h1>
          <p className="text-text-muted text-sm mt-1">{products.length} products across {categories.length} categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-amber transition-colors"
          >
            <Download size={12} /> Export
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-amber transition-colors"
          >
            <Upload size={12} /> Import
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <button
            onClick={() => {
              if (confirm('Reset all products to the original defaults? This cannot be undone.')) {
                resetProducts()
              }
            }}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-orange transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Vendors & Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <EditableList
          title="Vendors"
          items={vendors}
          onAdd={addVendor}
          onRename={renameVendor}
          onDelete={deleteVendor}
          emails={vendorEmails}
          onEmailChange={setVendorEmail}
        />
        <EditableList
          title="Categories"
          items={categories}
          onAdd={addCategory}
          onRename={renameCategory}
          onDelete={deleteCategory}
        />
      </div>

      {/* EmailJS Settings */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        <button
          onClick={() => setEmailjsOpen(!emailjsOpen)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-text-muted" />
            <span className="text-sm font-semibold text-text-primary">EmailJS Settings</span>
          </div>
          <div className="flex items-center gap-2">
            {emailjsConfig.publicKey && emailjsConfig.serviceId && emailjsConfig.templateId
              ? <span className="text-xs text-amber">configured</span>
              : <span className="text-xs text-text-muted">not configured</span>
            }
            {emailjsOpen ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
          </div>
        </button>
        {emailjsOpen && (
          <div className="border-t border-border px-4 py-4 space-y-3">
            <p className="text-xs text-text-muted">
              Find these values in your <span className="text-amber">EmailJS dashboard</span>. Your template should include variables: <span className="text-amber font-mono">{'{{vendor_name}}'}</span>, <span className="text-amber font-mono">{'{{week_volume}}'}</span>, <span className="text-amber font-mono">{'{{order_list}}'}</span>, <span className="text-amber font-mono">{'{{to_email}}'}</span>.
            </p>
            {[
              { key: 'publicKey',  label: 'Public Key',   placeholder: 'e.g. user_xxxxxxxxxxxx' },
              { key: 'serviceId',  label: 'Service ID',   placeholder: 'e.g. service_xxxxxxx' },
              { key: 'templateId', label: 'Template ID',  placeholder: 'e.g. template_xxxxxxx' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-text-muted">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-orange transition-colors"
                  value={emailjsConfig[key]}
                  onChange={(e) => setEmailjsConfig({ [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="w-full rounded-xl border border-border bg-surface pl-8 pr-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-orange transition-colors"
            placeholder="Search products or vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-muted focus:outline-none focus:border-orange transition-colors"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add Product */}
      {adding ? (
        <AddProductForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 w-full rounded-2xl border border-dashed border-border hover:border-orange text-text-muted hover:text-orange transition-colors py-3 px-4 text-sm font-medium"
        >
          <Plus size={15} /> Add New Product
        </button>
      )}

      {/* Product Groups */}
      <div className="space-y-6">
        {grouped.map(({ category, items }) => (
          <section key={category}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="category-header mb-0">{category}</h2>
              <span className="text-xs text-text-muted">{items.length} items</span>
            </div>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
              {items.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onSave={updateProduct}
                  onDelete={deleteProduct}
                />
              ))}
            </div>
          </section>
        ))}

        {uncategorized.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="category-header mb-0 text-text-muted">Uncategorized</h2>
              <span className="text-xs text-text-muted">{uncategorized.length} items</span>
            </div>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
              {uncategorized.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onSave={updateProduct}
                  onDelete={deleteProduct}
                />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  )
}
