"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { RefreshCcw } from "lucide-react"

interface Match {
  id: string
  champion: string
  result: "Ganó" | "Perdió"
  kda: string
  date: string
}

export default function MatchHistory() {
  const summonerName = 'AMO%20LASTET4S'
  const [level, setLevel] = useState(0)
  const [summonerGameName, setSummonerGameName] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [userImage, setUserImage] = useState("")
  const API_KEY: string = process.env.NEXT_PUBLIC_LOL_API_KEY || ''

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${summonerName}/6293`,
        {
          headers: { "X-Riot-Token": API_KEY },
        }
      )
      const data = await response.json()
      const puuid = data.puuid
      setSummonerGameName(data.gameName)

      const matchesResponse = await fetch(
        `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`,
        {
          headers: { "X-Riot-Token": API_KEY },
        }
      )
      const matchIds = await matchesResponse.json()

      const matchDetails = await Promise.all(
        matchIds.length > 0 ? matchIds?.map(async (matchId: string) => {
          const matchData = await fetch(
            `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
              headers: { "X-Riot-Token": API_KEY },
            }
          ).then((res) => res.json())

          const player = matchData?.info?.participants?.find(
            (p: { puuid: string; championName: string; win: boolean; kills: number; deaths: number; assists: number }) => p.puuid === puuid
          )

          return {
            id: matchId,
            champion: player?.championName,
            result: player?.win ? "Ganó" : "Perdió",
            kda: `${player?.kills}/${player?.deaths}/${player?.assists}`,
            date: new Date(matchData?.info?.gameEndTimestamp)?.toLocaleDateString(),
          }
        }, [summonerName, API_KEY]) : []
      )
      const summonerResponse = await fetch(
        `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        {
          headers: { "X-Riot-Token": API_KEY },
        }
      )
      const summoner = await summonerResponse.json()

      setLevel(summoner?.summonerLevel)
      setMatches(matchDetails)
      setUserImage(`https://cdn.discordapp.com/avatars/510225407447007242/cb00c62327b057615818099b662e7802.webp?size=128`)
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
    setLoading(false)
  }, [summonerName, API_KEY])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const filteredMatches = matches.filter((match) => match.champion)
  return (
    <div className="space-y-8">
      <div className="flex w-full">
        <Button
          onClick={fetchMatches}
          disabled={!summonerName || loading}
          variant='link'
          className="bg-transparent border-transparent"
        >
          <span className="flex items-center gap-3"><RefreshCcw className={`${loading ? 'animate-spin' : ''}`} /> Renovar Información</span>
        </Button>
      </div>

      {userImage && (
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={userImage}
            alt="Summoner Icon"
            width={128}
            height={128}
            className="rounded-full border-4 border-blue-600"
          />
          <h2 className="text-2xl font-bold">{summonerGameName}</h2>
          <h3 className="text-xl font-semibold">Nivel: {level}</h3>
        </div>
      )}
      {matches.length > 0 &&
        <div>
          <h3 className="text-xl font-semibold">Partidas perdidas de las últimas {filteredMatches.length}: {matches.filter(match => match.result === "Perdió").length}</h3>
        </div>
      }

      {filteredMatches.length > 0 && (
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Campeón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">KDA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredMatches.map((match) => (
                <tr key={match.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{match.champion}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        match.result === "Ganó" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                      }`}
                    >
                      {match.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{match.kda}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{match.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
