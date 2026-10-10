import { useEffect, useRef, useState } from 'react'
import {
  AudioLines,
  LayoutDashboard,
  Mic,
  ReceiptText,
  Package,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  ChevronDown,
  MoreHorizontal,
  LogOut,
  FlaskConical,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { exitPreview } from '@/features/preview/preview-slice'
import { Dialog } from '@/components/common/dialog'
import { Button } from '@/components/ui/button'
const navigation = [
  { path: '/', title: 'Dashboard', icon: LayoutDashboard },
  { path: '/voice', title: 'Voice Assistant', icon: Mic },
  { path: '/transactions', title: 'Transactions', icon: ReceiptText },
  { path: '/inventory', title: 'Inventory', icon: Package },
  { path: '/reports', title: 'Reports', icon: ChartNoAxesCombined },
  { path: '/settings', title: 'Settings', icon: Settings },
]
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="KasuwaVoice home">
      <span className="brand-mark">
        <AudioLines size={23} />
      </span>
      <span>
        Kasuwa<span className="brand-voice">Voice</span>
      </span>
    </Link>
  )
}
export function AppLayout() {
  const preview = useAppSelector((state) => state.preview)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    main.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname])
  const [menu, setMenu] = useState<'more' | 'profile' | 'exit' | null>(null)
  const name = preview.enabled ? preview.profile.fullName : 'Your workspace'
  function leave() {
    dispatch(exitPreview())
    setMenu(null)
    navigate('/login')
  }
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand light />
        <div className="business-card">
          <span className="shop-symbol" aria-hidden="true">
            ▦
          </span>
          <div>
            <strong>{preview.business.name || 'Your business'}</strong>
            <span>{preview.enabled ? 'Preview workspace' : 'Business services offline'}</span>
          </div>
        </div>
        <p className="nav-caption">YOUR WORKSPACE</p>
        <nav aria-label="Main navigation" className="side-nav">
          {navigation.map(({ path, title, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'}>
              <Icon size={20} aria-hidden="true" />
              <span>{title}</span>
              {path === '/voice' && <span className="new-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="voice-tip">
            <AudioLines size={26} />
            <h3>
              A little less typing.
              <br />A lot more business.
            </h3>
            <p>
              Speak It. Record It.
              <br />
              Grow Your Business.
            </p>
            <Link to="/voice">
              Meet your voice assistant <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="sidebar-foot">Made for the way you trade.</p>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="desktop-greeting">
            <span className="status-dot" />
            Your everyday business companion
          </div>
          <div className="topbar-right">
            <span className="header-date">
              {new Date().toLocaleDateString('en-NG', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <button
              className="profile-button"
              onClick={() => setMenu('profile')}
              aria-label="Open profile menu"
            >
              <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
              <span className="profile-name">{name.split(' ')[0]}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
          </div>
        </header>
        {preview.enabled && (
          <div className="preview-banner">
            <FlaskConical size={17} aria-hidden="true" />
            <p>
              <strong>UI preview</strong>
              <span> Sample records and local edits only. Nothing is saved to an account.</span>
            </p>
            <button onClick={() => setMenu('exit')}>Exit preview</button>
          </div>
        )}
        <main id="main" ref={main} tabIndex={-1} className="workspace">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>KasuwaVoice</span>
          <span>Small steps. Stronger business.</span>
        </footer>
      </div>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {navigation.slice(0, 4).map(({ path, title, icon: Icon }, index) => (
          <NavLink key={path} to={path} end={path === '/'}>
            <Icon size={21} aria-hidden="true" />
            <span>{['Home', 'Voice', 'Records', 'Stock'][index] || title}</span>
          </NavLink>
        ))}
        <button onClick={() => setMenu('more')} aria-label="More navigation">
          <MoreHorizontal size={22} />
          <span>More</span>
        </button>
      </nav>
      {menu === 'more' && (
        <Dialog title="More from KasuwaVoice" onClose={() => setMenu(null)}>
          <nav className="dialog-menu" aria-label="Additional navigation">
            {navigation.slice(4).map(({ path, title, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setMenu(null)}>
                <Icon size={20} />
                {title}
              </Link>
            ))}
          </nav>
        </Dialog>
      )}
      {menu === 'profile' && (
        <Dialog title="Your workspace" onClose={() => setMenu(null)}>
          <p className="muted">
            {preview.enabled
              ? `${name} · preview profile`
              : 'You are not signed in. Authentication is not connected yet.'}
          </p>
          <div className="dialog-menu">
            <Link to="/settings" onClick={() => setMenu(null)}>
              <Settings size={20} />
              Settings
            </Link>
            {preview.enabled ? (
              <button onClick={() => setMenu('exit')}>
                <LogOut size={20} />
                Exit preview
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenu(null)}>
                Go to sign in
              </Link>
            )}
          </div>
        </Dialog>
      )}
      {menu === 'exit' && (
        <Dialog title="Leave the preview?" onClose={() => setMenu(null)}>
          <p className="muted">
            Your sample records and any edits made in this preview will be cleared. They have not
            been saved to a real account.
          </p>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setMenu(null)}>
              Keep exploring
            </Button>
            <Button variant="danger" onClick={leave}>
              Leave and clear preview
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}
