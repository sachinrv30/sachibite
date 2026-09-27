import { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  RefreshCcw,
  Printer,
  Check,
  Sparkles,
  CircleCheck,
  PackageCheck,
  ListChecks,
} from 'lucide-react';

import { PageLoader } from '../components/Loader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ShoppingList() {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: '',
  });

  const [regenerating, setRegenerating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const { showToast } = useToast();

  // ------------------------------------------------------------
  // LOAD SHOPPING LIST
  // ------------------------------------------------------------

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/shopping-list');
      setList(res.data.data);
    } catch (err) {
      console.error('Shopping list error:', err);
      setError('We could not load your shopping list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ------------------------------------------------------------
  // REGENERATE FROM MEAL PLAN
  // ------------------------------------------------------------

  const regenerate = async () => {
    setRegenerating(true);

    try {
      const res = await api.post('/shopping-list', {
        availableIngredients: [],
      });

      setList(res.data.data);

      showToast(
        'Shopping list regenerated from your meal plan.',
        'success'
      );
    } catch (err) {
      console.error('Regenerate error:', err);

      showToast(
        'Add meals to your planner first, then regenerate.',
        'error'
      );
    } finally {
      setRegenerating(false);
    }
  };

  // ------------------------------------------------------------
  // TOGGLE PURCHASED
  // ------------------------------------------------------------

  const togglePurchased = async (item) => {
    setProcessingId(item._id);

    try {
      const res = await api.put(
        `/shopping-list/${item._id}`,
        {
          purchased: !item.purchased,
        }
      );

      setList(res.data.data);
    } catch (err) {
      console.error('Toggle purchased error:', err);

      showToast(
        'Could not update this item.',
        'error'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ------------------------------------------------------------
  // DELETE ITEM
  // ------------------------------------------------------------

  const deleteItem = async (item) => {
    setProcessingId(item._id);

    try {
      const res = await api.delete(
        `/shopping-list/${item._id}`
      );

      setList(res.data.data);

      showToast(
        `${item.name} removed from your list.`,
        'info'
      );
    } catch (err) {
      console.error('Delete item error:', err);

      showToast(
        'Could not remove this item.',
        'error'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ------------------------------------------------------------
  // ADD CUSTOM ITEM
  // ------------------------------------------------------------

  const addCustomItem = async (e) => {
    e.preventDefault();

    if (!newItem.name.trim()) {
      showToast(
        'Enter an item name first.',
        'error'
      );

      return;
    }

    setAdding(true);

    try {
      const res = await api.post(
        '/shopping-list/items',
        {
          name: newItem.name.trim(),
          quantity: Math.max(
            1,
            Number(newItem.quantity) || 1
          ),
          unit: newItem.unit.trim(),
        }
      );

      setList(res.data.data);

      setNewItem({
        name: '',
        quantity: 1,
        unit: '',
      });

      showToast(
        'Item added to your shopping list.',
        'success'
      );
    } catch (err) {
      console.error('Add item error:', err);

      showToast(
        'Could not add the item.',
        'error'
      );
    } finally {
      setAdding(false);
    }
  };

  // ------------------------------------------------------------
  // CLEAR PURCHASED ITEMS
  // ------------------------------------------------------------

  const clearPurchased = async () => {
    try {
      const res = await api.delete(
        '/shopping-list/purchased/clear'
      );

      setList(res.data.data);

      showToast(
        'Purchased items cleared.',
        'info'
      );
    } catch (err) {
      console.error('Clear purchased error:', err);

      showToast(
        'Could not clear purchased items.',
        'error'
      );
    }
  };

  // ------------------------------------------------------------
  // GROUP ITEMS BY CATEGORY
  // ------------------------------------------------------------

  const grouped = useMemo(() => {
    if (!list?.items) {
      return {};
    }

    return list.items.reduce((acc, item) => {
      const category = item.category || 'other';

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(item);

      return acc;
    }, {});
  }, [list]);

  // ------------------------------------------------------------
  // STATISTICS
  // ------------------------------------------------------------

  const totalItems = list?.items?.length || 0;

  const purchasedItems =
    list?.items?.filter(
      (item) => item.purchased
    ).length || 0;

  const remainingItems =
    totalItems - purchasedItems;

  const categories =
    Object.keys(grouped).length;

  const progress =
    totalItems > 0
      ? Math.round(
          (purchasedItems / totalItems) * 100
        )
      : 0;

  // ------------------------------------------------------------
  // LOADING
  // ------------------------------------------------------------

  if (loading) {
    return <PageLoader />;
  }

  // ------------------------------------------------------------
  // ERROR
  // ------------------------------------------------------------

  if (error || !list) {
    return (
      <ErrorState
        message={error}
        onRetry={load}
      />
    );
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen">

      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200/70 dark:border-slate-800/70">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-leaf-500/10 blur-3xl" />
        </div>

        <div className="section relative py-10 md:py-14">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-4">
                <ShoppingCart className="w-3.5 h-3.5" />

                SMART SHOPPING
              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-4">
                Your Shopping List
              </h1>

              <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
                Everything you need for your planned meals,
                organized into one simple list.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={regenerate}
                disabled={regenerating}
                className="btn-primary"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${
                    regenerating
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                {regenerating
                  ? 'Generating...'
                  : 'Regenerate from Plan'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="btn-outline"
              >
                <Printer className="w-4 h-4" />

                Print List
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="section py-8 md:py-10">

        {/* ====================================================
            STAT CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <StatCard
            icon={ListChecks}
            label="Total Items"
            value={totalItems}
            description="On your list"
          />

          <StatCard
            icon={CircleCheck}
            label="Purchased"
            value={purchasedItems}
            description="Already checked"
          />

          <StatCard
            icon={PackageCheck}
            label="Remaining"
            value={remainingItems}
            description="Still to buy"
          />

          <StatCard
            icon={ShoppingCart}
            label="Categories"
            value={categories}
            description="Item groups"
          />

        </div>

        {/* ====================================================
            PROGRESS
        ===================================================== */}

        {totalItems > 0 && (
          <div className="card p-5 md:p-6 mb-8 overflow-hidden relative">

            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

              <div>

                <div className="flex items-center gap-2 mb-1">

                  <Sparkles className="w-4 h-4 text-brand-500" />

                  <h2 className="font-display font-semibold">
                    Shopping Progress
                  </h2>

                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400">

                  {purchasedItems === totalItems
                    ? 'Everything is checked off. Nice work!'
                    : `${remainingItems} ${
                        remainingItems === 1
                          ? 'item'
                          : 'items'
                      } remaining`}

                </p>

              </div>

              <div className="text-2xl font-display font-bold">
                {progress}%
              </div>

            </div>

            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-leaf-500 transition-all duration-700 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>
        )}

        {/* ====================================================
            ADD ITEM
        ===================================================== */}

        <section className="card p-5 md:p-6 mb-8">

          <div className="flex items-start gap-3 mb-5">

            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">

              <Plus className="w-5 h-5" />

            </div>

            <div>

              <h2 className="font-display font-semibold text-lg">
                Add a custom item
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add anything else you need for your grocery trip.
              </p>

            </div>

          </div>

          <form
            onSubmit={addCustomItem}
            className="grid grid-cols-1 sm:grid-cols-[1fr_110px_120px_auto] gap-3"
          >

            <input
              className="input"
              placeholder="e.g. Olive oil"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  name: e.target.value,
                })
              }
            />

            <input
              className="input"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  quantity: Math.max(
                    1,
                    Number(e.target.value) || 1
                  ),
                })
              }
            />

            <input
              className="input"
              placeholder="Unit"
              value={newItem.unit}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  unit: e.target.value,
                })
              }
            />

            <button
              type="submit"
              disabled={adding}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />

              {adding
                ? 'Adding...'
                : 'Add Item'}
            </button>

          </form>

        </section>

        {/* ====================================================
            EMPTY STATE
        ===================================================== */}

        {totalItems === 0 ? (

          <div className="card p-8 md:p-12">

            <EmptyState
              icon={ShoppingCart}
              title="Your shopping list is empty"
              description="Add meals to your weekly planner, then regenerate to see what you need to buy."
            />

            <div className="flex justify-center mt-5">

              <button
                type="button"
                onClick={regenerate}
                disabled={regenerating}
                className="btn-primary"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${
                    regenerating
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                {regenerating
                  ? 'Generating...'
                  : 'Generate from Meal Plan'}

              </button>

            </div>

          </div>

        ) : (

          <>

            {/* ==================================================
                CATEGORY GROUPS
            =================================================== */}

            <div className="space-y-5">

              {Object.entries(grouped).map(
                ([category, items]) => {

                  const categoryPurchased =
                    items.filter(
                      (item) => item.purchased
                    ).length;

                  return (
                    <section
                      key={category}
                      className="card overflow-hidden"
                    >

                      {/* CATEGORY HEADER */}

                      <div className="px-5 py-4 md:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">

                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">

                            <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300" />

                          </div>

                          <div className="min-w-0">

                            <h3 className="font-display font-semibold capitalize truncate">
                              {category.replace(
                                '-',
                                ' & '
                              )}
                            </h3>

                            <p className="text-xs text-slate-400 mt-0.5">

                              {items.length}{' '}

                              {items.length === 1
                                ? 'item'
                                : 'items'}

                            </p>

                          </div>

                        </div>

                        <div className="shrink-0 text-xs font-medium text-slate-400">
                          {categoryPurchased}/{items.length}
                        </div>

                      </div>

                      {/* ITEMS */}

                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">

                        {items.map((item) => {

                          const processing =
                            processingId === item._id;

                          return (
                            <li
                              key={item._id}
                              className={`group flex items-center gap-3 px-5 py-4 md:px-6 transition-colors ${
                                item.purchased
                                  ? 'bg-slate-50/60 dark:bg-slate-900/40'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                              }`}
                            >

                              {/* CHECKBOX */}

                              <button
                                type="button"
                                onClick={() =>
                                  togglePurchased(item)
                                }
                                disabled={processing}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                                  item.purchased
                                    ? 'bg-leaf-500 border-leaf-500 scale-105'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400'
                                }`}
                                aria-label={
                                  item.purchased
                                    ? 'Mark as not purchased'
                                    : 'Mark as purchased'
                                }
                              >

                                {item.purchased && (
                                  <Check className="w-3.5 h-3.5 text-white" />
                                )}

                              </button>

                              {/* ITEM INFO */}

                              <div className="flex-1 min-w-0">

                                <div
                                  className={`font-medium text-sm md:text-base capitalize transition-all ${
                                    item.purchased
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {item.name}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1">

                                  {item.custom && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-[10px] font-semibold uppercase tracking-wide">
                                      Custom
                                    </span>
                                  )}

                                </div>

                              </div>

                              {/* QUANTITY */}

                              <div
                                className={`shrink-0 text-sm font-medium ${
                                  item.purchased
                                    ? 'text-slate-400'
                                    : 'text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {item.quantity}{' '}
                                {item.unit || ''}
                              </div>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteItem(item)
                                }
                                disabled={processing}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                aria-label={`Delete ${item.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </li>
                          );
                        })}

                      </ul>

                    </section>
                  );
                }
              )}

            </div>

            {/* ==================================================
                BOTTOM ACTION
            =================================================== */}

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <p className="text-sm text-slate-500 dark:text-slate-400">

                {purchasedItems > 0
                  ? `${purchasedItems} ${
                      purchasedItems === 1
                        ? 'item is'
                        : 'items are'
                    } marked as purchased.`
                  : 'Check items off as you shop.'}

              </p>

              {purchasedItems > 0 && (
                <button
                  type="button"
                  onClick={clearPurchased}
                  className="btn-outline"
                >
                  <Trash2 className="w-4 h-4" />

                  Clear Purchased
                </button>
              )}

            </div>

          </>
        )}

      </main>

      {/* ========================================================
          PRINT STYLES
      ========================================================= */}

      <style>{`
        @media print {
          nav,
          footer,
          button,
          form {
            display: none !important;
          }

          body {
            background: white !important;
          }

          .card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            break-inside: avoid;
          }

          section {
            break-inside: avoid;
          }
        }
      `}</style>

    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="card p-4 md:p-5 card-hover">

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="font-display font-bold text-2xl md:text-3xl mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>

        </div>

        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">

          <Icon className="w-5 h-5" />

        </div>

      </div>

    </div>
  );
}