import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Home, BarChart2, BookOpen } from "lucide-react";

export function MobileLayout({ children, title, showNav = true }: { children: ReactNode, title?: string, showNav?: boolean }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background flex justify-center w-full overflow-hidden" dir="rtl">
      {/* Restrict to mobile width on larger screens to maintain app-like feel */}
      <div className="w-full max-w-md relative bg-background shadow-2xl flex flex-col h-[100dvh]">
        
        {/* Header */}
        {title && (
          <header className="ios-glass z-40 sticky top-0 px-6 py-4 flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground font-serif tracking-wide">{title}</h1>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        {showNav && (
          <nav className="ios-glass z-40 pb-safe relative">
            <div className="flex justify-around items-center px-2 py-3">
              <NavItem href="/" icon={<Home className="w-6 h-6" />} label="العداد" isActive={location === "/"} />
              <NavItem href="/dhikr" icon={<BookOpen className="w-6 h-6" />} label="الأذكار" isActive={location === "/dhikr"} />
              <NavItem href="/stats" icon={<BarChart2 className="w-6 h-6" />} label="الإحصائيات" isActive={location === "/stats"} />
              <NavItem href="/settings" icon={<Settings className="w-6 h-6" />} label="الإعدادات" isActive={location === "/settings"} />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: ReactNode, label: string, isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        flex flex-col items-center justify-center w-16 gap-1 p-1 rounded-xl transition-all duration-300
        ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}
      `}
    >
      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="nav-indicator" 
          className="w-1 h-1 rounded-full bg-primary mt-0.5 absolute bottom-0"
        />
      )}
    </Link>
  );
}
