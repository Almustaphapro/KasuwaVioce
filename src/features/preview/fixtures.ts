// Deliberately separate from services. These records are never loaded without explicit preview opt-in.
import type { Product, Transaction } from '@/types/business'
import { daysAgo } from '@/utils/format'
export function createFixtures(): { products: Product[]; transactions: Transaction[] } {
  const products: Product[] = [
    {
      id: 'rice',
      name: 'Mama Gold Rice · 50kg',
      unit: 'bag',
      stock: 24,
      unitPrice: 82500,
      lowStockAt: 5,
    },
    {
      id: 'oil',
      name: 'Golden Penny Oil · 5L',
      unit: 'carton',
      stock: 4,
      unitPrice: 38000,
      lowStockAt: 5,
    },
    {
      id: 'noodles',
      name: 'Indomie Noodles',
      unit: 'carton',
      stock: 36,
      unitPrice: 8500,
      lowStockAt: 8,
    },
    {
      id: 'sugar',
      name: 'Dangote Sugar · 1kg',
      unit: 'piece',
      stock: 48,
      unitPrice: 2200,
      lowStockAt: 10,
    },
    {
      id: 'malt',
      name: 'Maltina · 33cl',
      unit: 'crate',
      stock: 0,
      unitPrice: 14500,
      lowStockAt: 3,
    },
  ]
  const transactions: Transaction[] = [
    {
      id: 'KV-1048',
      type: 'sale',
      description: 'Mama Gold Rice · 2 bags',
      amount: 165000,
      date: daysAgo(0),
      productId: 'rice',
      quantity: 2,
      source: 'fixture',
    },
    {
      id: 'KV-1047',
      type: 'expense',
      description: 'Delivery to the shop',
      amount: 7500,
      date: daysAgo(0),
      source: 'fixture',
    },
    {
      id: 'KV-1046',
      type: 'sale',
      description: 'Indomie Noodles · 3 cartons',
      amount: 25500,
      date: daysAgo(0),
      productId: 'noodles',
      quantity: 3,
      source: 'fixture',
    },
    {
      id: 'KV-1045',
      type: 'sale',
      description: 'Dangote Sugar · 5 pieces',
      amount: 11000,
      date: daysAgo(0),
      productId: 'sugar',
      quantity: 5,
      source: 'fixture',
    },
    {
      id: 'KV-1044',
      type: 'expense',
      description: 'Shop electricity',
      amount: 5000,
      date: daysAgo(0),
      source: 'fixture',
    },
    ...[98000, 156000, 112500, 189000, 73500, 143000].map(
      (amount, index): Transaction => ({
        id: `KV-${1043 - index}`,
        type: 'sale',
        description: 'Sample market sales',
        amount,
        date: daysAgo(index + 1),
        source: 'fixture',
      }),
    ),
  ]
  return { products, transactions }
}
