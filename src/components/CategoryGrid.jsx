// ─────────────────────────────────────────────
//  CategoryGrid.jsx
//  The 10-category picker shown on Home page.
//  Props:
//    onSelect(categoryLabel) — called when a card is clicked
//    activeCategory — highlights the selected one
// ─────────────────────────────────────────────
import { CATEGORIES } from '../data/workers'

export default function CategoryGrid({ onSelect, activeCategory }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
      {CATEGORIES.map(cat => (
        <div
          key={cat.label}
          onClick={() => onSelect(cat.label)}
          className={`bg-white rounded-xl p-4 text-center cursor-pointer border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
            activeCategory === cat.label
              ? 'border-orange-500 bg-orange-50'
              : 'border-transparent hover:border-orange-400'
          }`}
        >
          <span className="text-3xl block mb-2">{cat.emoji}</span>
          <span className="text-xs font-semibold text-gray-800">{cat.label}</span>
        </div>
      ))}
    </div>
  )
}
