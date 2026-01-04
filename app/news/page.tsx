"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, getDocs, where, Timestamp, startAfter } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { ArticleCard } from "@/components/article-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Newspaper } from "lucide-react"

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const NEWS_LOAD_LIMIT = 12

  useEffect(() => {
    setNews([])
    setLastVisible(null)
    setHasMore(true)
    fetchNews(true)
  }, [categoryFilter])

  const fetchNews = async (isInitial = false) => {
    setLoading(true)
    try {
      const newsRef = collection(db, "artifacts/default-app-id/news")
      const now = Timestamp.now()

      let constraints: any[] = [
        where("scheduledAt", "<=", now),
        orderBy("scheduledAt", "desc"),
        limit(NEWS_LOAD_LIMIT)
      ]

      if (categoryFilter !== "all") {
        // Note: Use a composite index or do client-side filtering if Firestore requires strict index
        // Legacy used explicit filtering in query, assume index exists or will be created
        constraints = [
          where("scheduledAt", "<=", now),
          where("category", "==", categoryFilter),
          orderBy("scheduledAt", "desc"),
          limit(NEWS_LOAD_LIMIT)
        ]
      }

      if (!isInitial && lastVisible) {
        constraints.push(startAfter(lastVisible))
      }

      const newsQuery = query(newsRef, ...constraints)
      const snapshot = await getDocs(newsQuery)

      if (snapshot.empty) {
        setHasMore(false)
      } else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        const newNews = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            type: "news" as const,
            ...data,
            // Map legacy fields to component props if needed
            image: data.imageUrl || data.image,
            publishedAt: data.scheduledAt ? data.scheduledAt.toDate().toISOString() : new Date().toISOString()
          }
        })

        setNews(prev => isInitial ? newNews : [...prev, ...newNews])
      }

    } catch (error) {
      console.error("[v0] Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = news.filter((article) => article.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Latest News</h1>
          <p className="text-muted-foreground">Latest updates from the world of cinema</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Tollywood">Tollywood</SelectItem>
              <SelectItem value="Bollywood">Bollywood</SelectItem>
              <SelectItem value="Kollywood">Kollywood</SelectItem>
              <SelectItem value="Sandalwood">Sandalwood</SelectItem>
              <SelectItem value="Hollywood">Hollywood</SelectItem>
              <SelectItem value="Mollywood">Mollywood</SelectItem>
              <SelectItem value="Pan India">Pan India</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Cricket">Cricket</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Politics">Politics</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length === 0 && loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg" />
            ))
            : filteredNews.map((article) => <ArticleCard key={article.id} {...article} />)}
        </div>

        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No news found</p>
          </div>
        )}

        {hasMore && filteredNews.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button variant="outline" size="lg" onClick={() => fetchNews(false)} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
