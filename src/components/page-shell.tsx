import { AppSidebar } from "@/components/app-sidebar";
import { GlobalSearch } from "@/components/global-search";
import { MobileNav } from "@/components/mobile-nav";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export async function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const user = await getSessionUser();

  return (
    <div className={cn("min-h-screen bg-ivory text-ink flex", className)}>
      {user ? <AppSidebar agencyName={user.activeAgencyName} /> : null}

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-5 md:px-10 py-9 md:py-12">
            {children}
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}

function TopBar({
  user,
}: {
  user: Awaited<ReturnType<typeof getSessionUser>>;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-line/70 bg-ivory/80 backdrop-blur-md print:hidden">
      <div className="h-full px-5 md:px-10 flex items-center gap-3">
        {/* Mobile: hamburger opens the nav drawer. Desktop: sidebar covers it. */}
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="flex-1" />
        <GlobalSearch />
        {user ? <NotificationBell /> : null}
        {user ? (
          <UserMenu
            name={user.name}
            email={user.email}
            agencyName={user.activeAgencyName}
            role={user.activeAgencyRole}
          />
        ) : null}
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-ivory print:hidden">
      <div className="px-5 md:px-10 flex h-14 items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} TripCraft</span>
        <span className="tracking-widest uppercase hidden sm:inline">
          Crafted for premium travel
        </span>
      </div>
    </footer>
  );
}
