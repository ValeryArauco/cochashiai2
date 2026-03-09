import { TopBar } from "@/presentation/components/ui/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
    </>
  )
}