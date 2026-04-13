import { TopBar } from "@/presentation/components/ui/TopBar"
import { InactivityReloader } from "@/presentation/components/ui/InactivityReloader"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <InactivityReloader />
      {children}
    </>
  )
}