"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InsuranceForm from "./components/insurance";
import EmploymentForm from "./components/employmentForm";
import VantaWavesBackground from "./components/vanta";

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
        <InsuranceForm />
      </main>
    </QueryClientProvider>
  );
}
