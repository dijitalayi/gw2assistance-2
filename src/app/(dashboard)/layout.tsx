import { DashboardLayout } from "@/shared/components/DashboardLayout";
import { AuthGuard } from "@/shared/components/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
