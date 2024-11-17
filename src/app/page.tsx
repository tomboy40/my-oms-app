import { SearchInterface } from "~/app/_components/interfaces/search-interface";

export default async function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Interface Management</h1>
        <SearchInterface />
      </div>
    </main>
  );
}
