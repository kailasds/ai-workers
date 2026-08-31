import { useOutletContext } from "react-router-dom";
import type { AIWorker } from "@/lib/types";

export function useWorker() {
  return useOutletContext<AIWorker>();
}
