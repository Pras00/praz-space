import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch real-time user profile directly from database
  let currentRole = session.role;
  let currentName = session.name;
  let currentEmail = session.email;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        isActive: true,
      },
    });

    if (user) {
      if (!user.isActive) {
        redirect("/login");
      }
      currentRole = user.role;
      currentName = user.name;
      currentEmail = user.email;
    }
  } catch (error) {
    console.warn("Could not fetch latest user from database for layout, using session:", error);
  }

  return (
    <AppShell
      userRole={currentRole}
      userName={currentName}
      userEmail={currentEmail}
    >
      {children}
    </AppShell>
  );
}
