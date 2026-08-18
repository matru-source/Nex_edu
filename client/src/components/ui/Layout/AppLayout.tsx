import useAuth from "../../../hooks/useAuth";
import { useInterceptBackButton } from "../../../hooks/useInterceptBackButton";
import useCheckLogin from "../../../hooks/useLoginCheck";
import useRouter from "../../../hooks/useRouter";
import { useSideBarStore } from "../../../state/global";
import AsideLeft from "./AsideLeft";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useInterceptBackButton(() => {
    router.back();
  });
  useCheckLogin();
  useAuth();
  const isCollapsed = useSideBarStore((state) => state.isCollapsed);

  return (
    <main className="flex w-screen h-screen bg-[var(--background)] transition-all duration-300">
      <div className="flex-shrink-0">
        <AsideLeft style={{ width: isCollapsed ? "65px" : "256px" }} />
      </div>
      <div className="flex-1 bg-[var(--background)] w-full h-screen overflow-y-auto scrollbar-sm transition-all duration-300">
        {children}
      </div>
    </main>
  );
}
