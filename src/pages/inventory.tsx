import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, Plus, Search, Pencil, AlertTriangle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { saveProduct } from '@/features/preview/preview-slice'
import { ProductForm } from '@/features/inventory/product-form'
import { PageHeading, EmptyState, PreviewGate } from '@/components/common/page'
import { Dialog } from '@/components/common/dialog'
import { Button } from '@/components/ui/button'
import { money } from '@/utils/format'
import type { Product } from '@/types/business'
export function InventoryPage() {
  const { enabled, products } = useAppSelector((state) => state.preview)
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [notice, setNotice] = useState('')
  const stock = params.get('stock') || 'all'
  const adding = params.get('new') === 'product'
  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (stock === 'all' ||
        (stock === 'low' ? product.stock <= product.lowStockAt : product.stock === 0)),
  )
  function close() {
    setEditing(null)
    setParams(stock === 'all' ? {} : { stock })
  }
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="KNOW WHAT’S ON YOUR SHELVES"
        title="Inventory"
        description="Your products, prices, and stock. A clearer picture of your shop."
        actions={
          <Button disabled={!enabled} onClick={() => setParams({ new: 'product' })}>
            <Plus size={18} />
            Add product
          </Button>
        }
      />
      <PreviewGate />
      {notice && (
        <p role="status" className="success-notice">
          {notice}
        </p>
      )}
      <div className="inventory-summary">
        <div>
          <Package size={23} />
          <span>
            <strong>{enabled ? products.length : '—'}</strong> product lines
          </span>
        </div>
        <div>
          <AlertTriangle size={23} />
          <span>
            <strong>
              {enabled
                ? products.filter((product) => product.stock <= product.lowStockAt).length
                : '—'}
            </strong>{' '}
            need a stock check
          </span>
        </div>
        <p>Quantities are tracked in each product’s own unit.</p>
      </div>
      <section className="panel">
        <div className="filter-bar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input
              placeholder="Find a product…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Stock filter</span>
            <select
              value={stock}
              onChange={(event) =>
                setParams(event.target.value === 'all' ? {} : { stock: event.target.value })
              }
            >
              <option value="all">All stock levels</option>
              <option value="low">Low or out of stock</option>
              <option value="out">Out of stock</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-top">
                  <span className={`product-symbol tone-${index % 3}`}>
                    <Package size={25} aria-hidden="true" />
                  </span>
                  <span
                    className={`badge ${product.stock === 0 ? 'expense' : product.stock <= product.lowStockAt ? 'preview' : 'sale'}`}
                  >
                    {product.stock === 0
                      ? 'Out of stock'
                      : product.stock <= product.lowStockAt
                        ? 'Low stock'
                        : 'In stock'}
                  </span>
                </div>
                <h2>{product.name}</h2>
                <p className="muted">Sold by the {product.unit}</p>
                <div className="product-numbers">
                  <div>
                    <span>In stock</span>
                    <strong>
                      {product.stock}{' '}
                      <small>
                        {product.unit}
                        {product.stock !== 1 && product.unit !== 'kg' ? 's' : ''}
                      </small>
                    </strong>
                  </div>
                  <div>
                    <span>Unit price</span>
                    <strong>{money(product.unitPrice)}</strong>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(product)}
                  aria-label={`Edit ${product.name}`}
                >
                  <Pencil size={15} />
                  Edit product
                </Button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              search || stock !== 'all' ? 'No products match your filters' : 'Make yourself at home'
            }
            description={
              enabled
                ? 'Add your first product, or change the search and stock filter.'
                : 'Your real products will appear when inventory services are connected.'
            }
          />
        )}
      </section>
      {enabled && (adding || editing) && (
        <Dialog title={editing ? 'Edit product' : 'Add a product'} onClose={close}>
          <ProductForm
            initial={editing ?? undefined}
            onCancel={close}
            onSave={(values) => {
              dispatch(saveProduct({ ...values, id: editing?.id ?? crypto.randomUUID() }))
              setNotice('Product saved in the preview only.')
              close()
            }}
          />
        </Dialog>
      )}
    </div>
  )
}
