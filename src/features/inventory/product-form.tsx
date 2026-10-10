import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Product } from '@/types/business'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
const schema = z
  .object({
    name: z.string().trim().min(2, 'Enter a product name.').max(100),
    unit: z.enum(['bag', 'carton', 'crate', 'piece', 'bottle', 'kg']),
    stock: z
      .number({ error: 'Enter a stock quantity.' })
      .finite()
      .min(0, 'Stock cannot be negative.')
      .max(1_000_000),
    unitPrice: z
      .number({ error: 'Enter a unit price.' })
      .finite()
      .positive('Price must be greater than zero.')
      .max(1_000_000_000),
    lowStockAt: z.number({ error: 'Enter a low-stock threshold.' }).finite().min(0).max(1_000_000),
  })
  .refine((value) => value.unit === 'kg' || Number.isInteger(value.stock), {
    path: ['stock'],
    message: 'Use a whole number for this product unit.',
  })
type Values = z.infer<typeof schema>
export function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product
  onSave: (values: Values) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: initial ?? { name: '', unit: 'piece', stock: 0, lowStockAt: 5 },
  })
  return (
    <form className="form-stack" noValidate onSubmit={handleSubmit(onSave)}>
      <p className="note">Changes are stored only in the current UI preview.</p>
      <Field label="Product name" error={errors.name?.message}>
        {(props) => (
          <input
            {...props}
            {...register('name')}
            placeholder="For example, Mama Gold Rice · 50kg"
            maxLength={100}
          />
        )}
      </Field>
      <Field label="Product unit" error={errors.unit?.message}>
        {(props) => (
          <select {...props} {...register('unit')}>
            {['bag', 'carton', 'crate', 'piece', 'bottle', 'kg'].map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        )}
      </Field>
      <div className="form-grid">
        <Field label="Stock quantity" error={errors.stock?.message}>
          {(props) => (
            <input
              {...props}
              {...register('stock', { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
            />
          )}
        </Field>
        <Field label="Unit price (₦)" error={errors.unitPrice?.message}>
          {(props) => (
            <input
              {...props}
              {...register('unitPrice', { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              placeholder="0.00"
            />
          )}
        </Field>
      </div>
      <Field
        label="Low-stock threshold"
        error={errors.lowStockAt?.message}
        hint="Highlight the product when stock reaches this quantity."
      >
        {(props) => (
          <input
            {...props}
            {...register('lowStockAt', { valueAsNumber: true })}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
          />
        )}
      </Field>
      <div className="dialog-actions">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save preview changes' : 'Add preview product'}</Button>
      </div>
    </form>
  )
}
