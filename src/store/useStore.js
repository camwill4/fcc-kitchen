import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import PRODUCTS_DEFAULT, { CATEGORIES as CATEGORIES_DEFAULT, VENDORS as VENDORS_DEFAULT } from '../data/products'

const useStore = create(
  persist(
    (set) => ({
      volumeTier: 'medium',
      counts: {},
      products: PRODUCTS_DEFAULT,
      vendors: VENDORS_DEFAULT,
      categories: CATEGORIES_DEFAULT,
      vendorEmails: {},
      emailjsConfig: { publicKey: '', serviceId: '', templateId: '' },

      setVolumeTier: (tier) => set({ volumeTier: tier }),

      setCount: (id, value) =>
        set((state) => ({
          counts: { ...state.counts, [id]: value },
        })),

      resetCounts: () => set({ counts: {} }),

      // Products
      updateProduct: (id, fields) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...fields } : p
          ),
        })),

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          counts: Object.fromEntries(
            Object.entries(state.counts).filter(([k]) => k !== id)
          ),
        })),

      resetProducts: () => set({ products: PRODUCTS_DEFAULT }),

      importData: (data) => set({
        products: data.products,
        vendors: data.vendors,
        categories: data.categories,
        vendorEmails: data.vendorEmails ?? {},
        emailjsConfig: data.emailjsConfig ?? { publicKey: '', serviceId: '', templateId: '' },
      }),

      setVendorEmail: (vendor, email) =>
        set((state) => ({
          vendorEmails: { ...state.vendorEmails, [vendor]: email },
        })),

      setEmailjsConfig: (config) =>
        set((state) => ({
          emailjsConfig: { ...state.emailjsConfig, ...config },
        })),

      // Vendors
      addVendor: (name) =>
        set((state) => ({
          vendors: [...state.vendors, name],
        })),

      renameVendor: (oldName, newName) =>
        set((state) => ({
          vendors: state.vendors.map((v) => (v === oldName ? newName : v)),
          products: state.products.map((p) =>
            p.vendor === oldName ? { ...p, vendor: newName } : p
          ),
        })),

      deleteVendor: (name) =>
        set((state) => ({
          vendors: state.vendors.filter((v) => v !== name),
        })),

      // Categories
      addCategory: (name) =>
        set((state) => ({
          categories: [...state.categories, name],
        })),

      renameCategory: (oldName, newName) =>
        set((state) => ({
          categories: state.categories.map((c) => (c === oldName ? newName : c)),
          products: state.products.map((p) =>
            p.category === oldName ? { ...p, category: newName } : p
          ),
        })),

      deleteCategory: (name) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== name),
        })),
    }),
    { name: 'fc-inventory-v1' }
  )
)

export default useStore
