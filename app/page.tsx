import { AppProvider } from "@/lib/store";
import Experience from "@/components/Experience";

export default function Home() {
  return (
    <AppProvider>
      <Experience />
    </AppProvider>
  );
}
