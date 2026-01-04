"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Search } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { MovieRatingModal } from "@/components/movie-rating-modal"

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchMovies()
  }, [industryFilter])

  /* Parity with legacy fetch:
     - Check scheduledAt <= now
     - Check releaseDate <= now
     - Order by releaseDate desc
     - Hide "Add Rating" if user already rated
  */

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const now = Timestamp.now()
      const moviesRef = collection(db, "artifacts/default-app-id/movies")

      // Basic query constraints
      let constraints: any[] = [
        where("scheduledAt", "<=", now),
        where("releaseDate", "<=", now),
        orderBy("releaseDate", "desc"),
        limit(20) // Increased limit
      ]

      if (industryFilter !== "all") {
        constraints.push(where("industry", "==", industryFilter))
      }

      // Note: Genre filter is usually client-side if array-contains needed with other filters tailored to Firestore limits
      // or simple array-contains if singular. Legacy used client-side for complex multi-filter or simple Firestore.
      // We'll fetch and then client-side filter for genre/search robustness if needed, 
      // but let's try to keep it efficient.

      const moviesQuery = query(moviesRef, ...constraints)
      const snapshot = await getDocs(moviesQuery)

      const moviesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Fetch User Reviews to identify what they've already rated
      let userRatedMovieIds = new Set()
      if (user) {
        const userReviewsQuery = query(
          collection(db, "artifacts/default-app-id/reviews"),
          where("userId", "==", user.uid)
        )
        const userReviewsSnap = await getDocs(userReviewsQuery)
        userReviewsSnap.forEach(doc => userRatedMovieIds.add(doc.data().movieId))
      }


      setMovies(moviesData.map(m => ({
        ...m,
        hasRated: userRatedMovieIds.has(m.id)
      })))

    } catch (error) {
      console.error("[v0] Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side Search & Genre Filtering
  // (Legacy did search on client-side array 'allMoviesData')
  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (Array.isArray(movie.genre) && movie.genre.some((g: string) => g.toLowerCase().includes(searchTerm.toLowerCase())))
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Movie Reviews & Ratings</h1>
          <p className="text-muted-foreground">Rate and review your favorite movies</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="Tollywood">Tollywood</SelectItem>
              <SelectItem value="Bollywood">Bollywood</SelectItem>
              <SelectItem value="Kollywood">Kollywood</SelectItem>
              <SelectItem value="Sandalwood">Sandalwood</SelectItem>
              <SelectItem value="Hollywood">Hollywood</SelectItem>
              <SelectItem value="Mollywood">Mollywood</SelectItem>
              <SelectItem value="Pan India">Pan India</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-xl" />
            ))
            : filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className="group border-border/50 bg-card/50 backdrop-blur overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
              >
                <div onClick={() => setSelectedMovie(movie)} className="cursor-pointer relative aspect-[2/3] overflow-hidden">
                  <Image
                    src={movie.poster || movie.posterUrl || "/placeholder.svg"}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {movie.industry && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-background/80 backdrop-blur rounded text-[10px] font-medium border border-border/20">
                      {movie.industry}
                    </div>
                  )}
                </div>

                <CardContent className="p-3 flex-1 flex flex-col space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1" title={movie.title}>{movie.title}</h3>

                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span className="font-bold">{movie.avgRating?.toFixed(1) || "0.0"}</span>
                    <span className="text-muted-foreground ml-1">({movie.reviewCount || 0})</span>
                  </div>

                  <div className="mt-auto pt-2">
                    {!user ? (
                      <Button size="sm" variant="secondary" className="w-full text-xs h-8" onClick={() => setSelectedMovie(movie)}>
                        Add Rating
                      </Button>
                    ) : movie.hasRated ? (
                      <Button size="sm" variant="outline" className="w-full text-xs h-8 opacity-50 cursor-not-allowed" disabled>
                        Rated
                      </Button>
                    ) : (
                      <Button size="sm" className="w-full text-xs h-8" onClick={() => setSelectedMovie(movie)}>
                        Add Rating
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {!loading && filteredMovies.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No movies found matching your criteria</p>
          </div>
        )}

        {!loading && filteredMovies.length >= 20 && (
          <div className="flex justify-center mt-10">
            <Button variant="outline" onClick={() => fetchMovies()} disabled>
              Load More (Pagination TODO)
            </Button>
          </div>
        )}
      </main>

      {/* Movie Rating Modal */}
      {selectedMovie && (
        <MovieRatingModal
          movie={selectedMovie}
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          user={user}
        />
      )}
    </div>
  )
}
