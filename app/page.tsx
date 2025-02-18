import MatchHistory from "@/components/match-history"

export default function Page () {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-900 text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Guillermix lista de partidas</h1>
        <MatchHistory />
      </main>
      <footer className="bg-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          © {new Date().getFullYear()} Guillermina
        </div>
      </footer>
    </div>
  )
}

