import Header from "@/components/Header";
import SearchContainer from "@/components/SearchContainer";
import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function Home() {
  return (
    <main className="min-h-screen bg-transparent relative">
      <InteractiveBackground />
      <Header />
      <div className="pt-32 pb-20 px-6 w-full flex flex-col items-center relative z-10">
        <SearchContainer />
      </div>
    </main>
  );
}
