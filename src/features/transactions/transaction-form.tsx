import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Transaction, TransactionKind } from '@/types/business'
import { useAppSelector } from '@/hooks/store'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { localDate } from '@/utils/format'
const schema = z.object({
  type: z.enum(['sale', 'expense']),
  description: z.string().trim().min(2, 'Describe this record in at least 2 characters.').max(160),
  amount: z
    .number({ error: 'Enter an amount.' })
    .finite()
    .positive('Enter an amount greater than zero.')
    .max(1_000_000_000, 'Amount is too large.'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.')
    .refine((value) => value <= localDate(), 'Use today or an earlier date.'),
  productId: z.string(),
  quantity: z
    .number({ error: 'Enter a valid quantity.' })
    .finite()
    .positive('Quantity must be greater than zero.')
    .max(1_000_000),
})
type Values = z.infer<typeof schema>
export function TransactionForm({
  type,
  initial,
  onSave,
  onCancel,
  submitLabel = 'Save preview record',
}: {
  type: TransactionKind
  initial?: Partial<Transaction>
  onSave: (transaction: Omit<Transaction, 'id' | 'source'>) => void
  onCancel: () => void
  submitLabel?: string
}) {
  const products = useAppSelector((state) => state.preview.products)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type,
      description: initial?.description ?? '',
      amount: initial?.amount,
      date: initial?.date ?? localDate(),
      productId: initial?.productId ?? '',
      quantity: initial?.quantity ?? 1,
    },
  })
  return (
    <form
      className="form-stack"
      noValidate
      onSubmit={handleSubmit(({ productId, ...values }) =>
        onSave({ ...values, ...(productId ? { productId } : {}) }),
      )}
    >
      <p className="note">
        Preview only. This saves a local record for this session and does not change stock
        quantities.
      </p>
      <Field label="Record type" error={errors.type?.message}>
        {(props) => (
          <select {...props} {...register('type')}>
            <option value="sale">Sale</option>
            <option value="expense">Expense</option>
          </select>
        )}
      </Field>
      <Field label="Description" error={errors.description?.message}>
        {(props) => (
          <input
            {...props}
            {...register('description')}
            placeholder="For example, two bags of rice"
            maxLength={160}
          />
        )}
      </Field>
      <div className="form-grid">
        <Field label="Total amount (₦)" error={errors.amount?.message}>
          {(props) => (
            <input
              {...props}
              {...register('amount', { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
            />
          )}
        </Field>
        <Field label="Date" error={errors.date?.message}>
          {(props) => <input {...props} {...register('date')} type="date" max={localDate()} />}
        </Field>
      </div>
      <Field label="Related product (optional)" error={errors.productId?.message}>
        {(props) => (
          <select {...props} {...register('productId')}>
            <option value="">No product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field
        label="Quantity"
        hint="Use 1 for a single expense. Total amount is the full value of the record."
        error={errors.quantity?.message}
      >
        {(props) => (
          <input
            {...props}
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
          />
        )}
      </Field>
      <div className="dialog-actions">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
