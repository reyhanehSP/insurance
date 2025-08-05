"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import VantaWavesBackground from "./components/vanta";
import VoiceToTextWithApi from "./components/vioceToText";

export default function Home() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <VantaWavesBackground />
      <main className="relative z-10 ">
        <VoiceToTextWithApi />
      </main>
    </QueryClientProvider>
  );
}
