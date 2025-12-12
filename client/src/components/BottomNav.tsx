import { useLocation, Link } from "wouter";
import { Gamepad2, Trophy, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/", icon: Gamepad2, label: t.navPlay, testId: "nav-play" },
    { path: "/leaderboard", icon: Trophy, label: t.navLeaderboard, testId: "nav-leaderboard" },
    { path: "/verify", icon: Shield, label: t.navVerify, testId: "nav-verify" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center h-16 gap-2">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path;
          return (
            <Link
              key={path}
              href={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={testId}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
