import SummaryForm from "@/components/SummaryForm";

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <SummaryForm />
    </main>
  );
}
