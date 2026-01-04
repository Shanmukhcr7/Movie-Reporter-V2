"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface MovieCardProps {
  id: string
  title: string
  poster: string
  releaseDate: string
  rating?: number
  industry?: string
  isTopBoxOffice?: boolean
  enableInterest?: boolean
  genre?: string | string[]
}

import { useAuth } from "@/lib/auth-context"
import { doc, setDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { Heart } from "lucide-react"
import { useState, useEffect } from "react"

export function MovieCard({ id, title, poster, releaseDate, rating, industry, isTopBoxOffice, enableInterest, genre }: MovieCardProps) {
  const { user } = useAuth()
  const [isInterested, setIsInterested] = useState(false)

  useEffect(() => {
    if (user && enableInterest) {
      // Check local storage or fetch (fetching per card is expensive but simplest for port)
      // Optimization: Pass in a Set of interested IDs from parent
      const checkInterest = async () => {
        try {
          const docRef = doc(db, `artifacts/default-app-id/users/${user.uid}/interests/${id}`)
          const snap = await getDoc(docRef)
          if (snap.exists()) setIsInterested(true)
        } catch (e) {
          console.error("Error checking interest", e)
        }
      }
      checkInterest()
    }
  }, [user, id, enableInterest])

  const toggleInterest = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.info("Please login to save interest")
      return
    }

    try {
      const ref = doc(db, `artifacts/default-app-id/users/${user.uid}/interests/${id}`)
      if (isInterested) {
        await deleteDoc(ref)
        setIsInterested(false)
        toast.info("Removed from interests")
      } else {
        await setDoc(ref, {
          movieId: id,
          title,
          posterUrl: poster,
          releaseDate: releaseDate ? Timestamp.fromDate(new Date(releaseDate)) : null,
          addedAt: Timestamp.now()
        })
        setIsInterested(true)
        toast.success("Added to interests")
      }
    } catch (error) {
      toast.error("Failed to update interest")
    }
  }

  return (
    <Link href={`/movie/${id}`}>
      <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur relative">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={poster || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isTopBoxOffice && <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">Top Box Office</Badge>}
          {industry && <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur">{industry}</Badge>}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
            {enableInterest && (
              <button onClick={toggleInterest} className={`text-foreground/80 hover:text-red-500 transition-colors ${isInterested ? "text-red-500 fill-current" : ""}`}>
                <Heart className={`h-5 w-5 ${isInterested ? "fill-current" : ""}`} />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{releaseDate ? new Date(releaseDate).toLocaleDateString() : 'TBD'}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {genre && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {Array.isArray(genre) ? genre.join(", ") : genre}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
