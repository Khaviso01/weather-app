import type { ReactNode } from "react";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-shell-card">
        <main className="app-shell-main">{children}</main>
      </div>
    </div>
  );
}
