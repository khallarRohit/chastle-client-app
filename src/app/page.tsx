import { HeaderAuth } from "@/components/header/header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      
      {/* Header Section */}
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-10">
        <div className="flex items-center gap-2 font-bold text-xl">
          ♟️ Chastle
        </div>

        <nav className="flex items-center gap-4">
          {/* 👇 Replaced static buttons with the smart component */}
          <HeaderAuth />
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Welcome to Chess App
        </h1>
        <p className="mt-4 text-muted-foreground">
          Play, learn, and master the game of kings.
        </p>
      </main>

    </div>
  );
}