# MazdoorConnect — React + Vite + Tailwind

A platform connecting rural workers directly with urban customers.
No middlemen. Fair wages. Transparent payments.

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          ← sticky nav with React Router NavLink
│   ├── WorkerCard.jsx      ← reusable worker card (used on /workers)
│   ├── ContactModal.jsx    ← reusable contact popup
│   └── Toast.jsx           ← global toast notification
│
├── pages/
│   ├── Home.jsx            ← landing page with hero, categories, how it works
│   ├── Workers.jsx         ← searchable, filterable worker listings
│   ├── WorkerProfile.jsx   ← individual worker page (/worker/:id)
│   ├── Register.jsx        ← worker/customer registration with OTP step
│   ├── Dashboard.jsx       ← worker dashboard with jobs & earnings
│   └── About.jsx           ← about page
│
├── data/
│   └── workers.js          ← all worker data (replace with API calls later)
│
├── context/
│   └── ToastContext.jsx    ← global toast state using React Context
│
├── App.jsx                 ← routes setup with React Router
├── main.jsx                ← entry point
└── index.css               ← Tailwind directives + global styles
```

---

## How to Run

**Step 1 — Install dependencies**
```bash
npm install
```

**Step 2 — Start dev server**
```bash
npm run dev
```

Open http://localhost:5173

**Step 3 — Build for production**
```bash
npm run build
```

---

## Key Concepts Used

| Concept | Where | What it does |
|---|---|---|
| `useState` | Register, Dashboard, Workers | Controls form values, filters, toggles |
| `useEffect` | Home (counter animation) | Runs code when component mounts |
| `useMemo` | Workers | Filters workers without re-running on every render |
| `useParams` | WorkerProfile | Reads `:id` from URL `/worker/3` |
| `useSearchParams` | Workers | Reads/writes `?category=Electrician` in URL |
| `useNavigate` | Register | Redirect to dashboard after OTP |
| `NavLink` | Navbar | Auto-highlights active page link |
| `createContext` | ToastContext | Shares toast function across all components |
| `useContext` | Toast, ContactModal | Reads from ToastContext |

---

## Next Steps (Backend Integration)

When you're ready to connect a real backend:

1. Replace `src/data/workers.js` static array with:
```js
const [workers, setWorkers] = useState([])
useEffect(() => {
  fetch('/api/workers').then(r => r.json()).then(setWorkers)
}, [])
```

2. Connect Register form to your API:
```js
await fetch('/api/register', {
  method: 'POST',
  body: JSON.stringify(formData)
})
```

3. Add Twilio for real OTP
4. Add Firebase Auth or JWT for login sessions
5. Deploy frontend on Vercel (free), backend on Railway or Render

---

## Tech Stack

- **React 18** — UI components
- **Vite 5** — fast dev server & build tool
- **Tailwind CSS 3** — utility-first styling
- **React Router 6** — real URL routing
