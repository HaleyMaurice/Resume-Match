import { ResumeMatchDemo } from "@/components/ResumeMatchDemo";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <ResumeMatchDemo />
      </div>
    </main>
  );
}

