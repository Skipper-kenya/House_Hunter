import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CompareBar } from "@/components/listing/CompareBar";
import { TooltipProvider } from "@/components/ui/overlay";
import { useStore } from "@/lib/store";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { Search } from "@/pages/Search";

/* Charting and the long-tail pages load on demand — recharts alone is most of
   the bundle, and the landing and search paths should not pay for it. */
const ListingDetail = lazy(() =>
  import("@/pages/ListingDetail").then((m) => ({ default: m.ListingDetail })),
);
const Saved = lazy(() =>
  import("@/pages/Saved").then((m) => ({ default: m.Saved })),
);
const Compare = lazy(() =>
  import("@/pages/Compare").then((m) => ({ default: m.Compare })),
);
const Neighbourhoods = lazy(() =>
  import("@/pages/Neighbourhoods").then((m) => ({ default: m.Neighbourhoods })),
);
const Agents = lazy(() =>
  import("@/pages/Agents").then((m) => ({ default: m.Agents })),
);
const AgentDetail = lazy(() =>
  import("@/pages/Agents").then((m) => ({ default: m.AgentDetail })),
);
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const MortgagePage = lazy(() =>
  import("@/pages/MortgagePage").then((m) => ({ default: m.MortgagePage })),
);
const ListProperty = lazy(() =>
  import("@/pages/ListProperty").then((m) => ({ default: m.ListProperty })),
);

function RouteFallback() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="skeleton h-9 w-72 rounded-md" />
      <div className="skeleton mt-4 h-5 w-96 rounded-md" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Scroll to the top on navigation, but leave search alone — changing a
 *  filter updates the URL and should not yank the page back up. */
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== "/search") window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  const { theme } = useStore();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (
        e.key === "/" &&
        !/input|textarea/i.test((e.target as HTMLElement)?.tagName ?? "")
      ) {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={400}>
      <a
        href="#main"
        className="bg-brand text-on-brand sr-only rounded-md px-4 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <ScrollReset />
      <Header onOpenCommand={() => setCommandOpen(true)} />

      <main id="main" className="min-h-[60vh]">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/neighbourhoods" element={<Neighbourhoods />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mortgage" element={<MortgagePage />} />
            <Route path="/list-your-property" element={<ListProperty />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CompareBar />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <Toaster
        position="bottom-right"
        theme={theme}
        richColors
        closeButton
        toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
      />
    </TooltipProvider>
  );
}
