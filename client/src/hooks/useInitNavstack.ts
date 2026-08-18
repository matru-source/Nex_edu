import { useEffect } from "react";
import { useNavigationStore, type NavStack } from "../state/global";

export default function useInitNavStackOnce(init: NavStack[]) {
  
  const navStack = useNavigationStore((state) => state.navStack);
  const safeSetNavStack = useNavigationStore((state) => state.safeSetNavStack);

  useEffect(() => {
    if (navStack.length === 0 && init.length > 0) {
      safeSetNavStack(init);
    }
  }, [navStack.length, init, safeSetNavStack]);
}
