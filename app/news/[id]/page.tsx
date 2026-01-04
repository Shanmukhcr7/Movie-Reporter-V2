"use client"

import { useEffect, useState } from "react"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  setDoc,
  Timestamp,
  orderBy
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, Share2, Calendar, User, MessageCircle, Edit, Trash } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useParams } from "next/navigation"

export default function NewsDetailsPage() {
  const params = useParams()
  const [article, setArticle] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [userFeedback, setUserFeedback] = useState<"like" | "dislike" | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, userData } = useAuth()
  const articleId = params.id as string

  useEffect(() => {
    fetchArticleDetails()
  }, [articleId, user])

  const fetchArticleDetails = async () => {
    try {
      const articleDoc = await getDoc(doc(db, "artifacts/default-app-id/news", articleId))

      if (articleDoc.exists()) {
        const articleData = { id: articleDoc.id, ...articleDoc.data() }
        setArticle(articleData)

        // Fetch comments
        const commentsQuery = query(
          collection(db, "artifacts/default-app-id/comments"),
          where("articleId", "==", articleId),
          where("articleType", "==", "news"),
          orderBy("createdAt", "asc")
        )
        const commentsSnapshot = await getDocs(commentsQuery)

        // Enhance comments with usernames if needed (legacy does this)
        // For now, assuming userName is stored in comment like legacy submission does.
        const commentsData = await Promise.all(commentsSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let finalName = data.userName || data.username || data.name || "Anonymous";

          // If name is Anonymous and belongs to current user, use their auth name or profile data
          if ((!finalName || finalName === "Anonymous") && user && data.userId === user.uid) {
            finalName = userData?.username || userData?.displayName || user.displayName || finalName;
          }

          // If name is Anonymous or missing, try to fetch from users collection
          if ((!finalName || finalName === "Anonymous") && data.userId) {
            try {
              const userDoc = await getDoc(doc(db, "artifacts/default-app-id/users", data.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                finalName = userData.username || userData.name || userData.displayName || userData.firstName || finalName;
              }
            } catch (err) {
              console.error("Error fetching user for comment:", err);
            }
          }

          return {
            id: docSnap.id,
            ...data,
            userName: finalName
          };
        }));

        setComments(commentsData)

        // Check if user liked/disliked
        if (user) {
          const feedbackDoc = await getDoc(doc(db, `artifacts/default-app-id/news/${articleId}/feedback`, user.uid))
          if (feedbackDoc.exists()) {
            setUserFeedback(feedbackDoc.data().type)
          } else {
            setUserFeedback(null)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching article details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (type: "like" | "dislike") => {
    if (!user || !article) return

    const feedbackRef = doc(db, `artifacts/default-app-id/news/${articleId}/feedback`, user.uid)
    const newsRef = doc(db, "artifacts/default-app-id/news", articleId)

    try {
      // If clicking same reaction, remove it (toggle off)
      if (userFeedback === type) {
        await setDoc(feedbackRef, { type: null }, { merge: true })
        await updateDoc(newsRef, {
          [`${type}sCount`]: increment(-1)
        })

        setUserFeedback(null)
        // Update local state count optimistically
        setArticle((prev: any) => ({
          ...prev,
          [`${type}sCount`]: Math.max(0, (prev[`${type}sCount`] || 0) - 1)
        }))
        return
      }

      // If switching reaction (e.g. like -> dislike)
      // Decrease old count, increase new count
      const updates: any = {
        [`${type}sCount`]: increment(1)
      }
      if (userFeedback) {
        updates[`${userFeedback}sCount`] = increment(-1)
      }

      await Promise.all([
        setDoc(feedbackRef, { type }, { merge: true }),
        updateDoc(newsRef, updates)
      ])

      // Optimistic update
      setArticle((prev: any) => {
        const newState = { ...prev }
        newState[`${type}sCount`] = (newState[`${type}sCount`] || 0) + 1
        if (userFeedback) {
          newState[`${userFeedback}sCount`] = Math.max(0, (newState[`${userFeedback}sCount`] || 0) - 1)
        }
        return newState
      })
      setUserFeedback(type)

    } catch (error) {
      console.error("[v0] Error handling feedback:", error)
    }
  }

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return

    try {
      const now = Timestamp.now()
      const commentData = {
        articleId: articleId,
        articleType: "news",
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        commentText: newComment, // Legacy uses commentText
        comment: newComment, // Store both for compatibility
        createdAt: now.toDate().toISOString(), // Use string format to match existing type usage or Timestamp if standardizing
        approved: true
      }

      const docRef = await addDoc(collection(db, "artifacts/default-app-id/comments"), commentData)

      // Sync to user private collection (Legacy Parity)
      await setDoc(doc(db, `artifacts/default-app-id/users/${user.uid}/userComments`, docRef.id), {
        ...commentData,
        commentId: docRef.id
      })

      setNewComment("")
      fetchArticleDetails()
    } catch (error) {
      console.error("[v0] Error posting comment:", error)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return

    try {
      const now = Timestamp.now()
      const updates = {
        comment: editText,
        commentText: editText,
        updatedAt: now.toDate().toISOString(),
        approved: true
      }

      await updateDoc(doc(db, "artifacts/default-app-id/comments", commentId), updates)

      // Sync update to user private collection
      if (user) {
        await updateDoc(doc(db, `artifacts/default-app-id/users/${user.uid}/userComments`, commentId), updates)
      }

      setEditingComment(null)
      setEditText("")
      fetchArticleDetails()
    } catch (error) {
      console.error("[v0] Error editing comment:", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDoc(doc(db, "artifacts/default-app-id/comments", commentId))

      // Sync delete to user private collection
      if (user) {
        await deleteDoc(doc(db, `artifacts/default-app-id/users/${user.uid}/userComments`, commentId))
      }

      fetchArticleDetails()
    } catch (error) {
      console.error("[v0] Error deleting comment:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary, // Legacy uses summary or excerpt
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // Could show toast here
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Article not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {article.category && (
              <Badge className="mb-4" variant="secondary">
                {article.category}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{article.title}</h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {(() => {
                    const dateVal = article.scheduledAt || article.publishedAt || article.createdAt;
                    if (!dateVal) return "Unknown Date"
                    if (typeof dateVal.toDate === 'function') return dateVal.toDate().toLocaleDateString()
                    return new Date(dateVal).toLocaleDateString()
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
            <Image src={article.imageUrl || article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
            <Button
              variant={userFeedback === 'like' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeedback('like')}
              disabled={!user}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {article.likesCount || 0}
            </Button>
            <Button
              variant={userFeedback === 'dislike' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFeedback('dislike')}
              disabled={!user}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              {article.dislikesCount || 0}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Summary */}
          {article.summary && (
            <div className="mb-8 p-4 bg-muted/50 rounded-lg border-l-4 border-primary italic">
              {article.summary}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {showFullDescription ? article.content : `${article.content?.substring(0, 800)}...`}
            </p>
            {article.content?.length > 800 && (
              <Button variant="link" className="px-0 mt-4" onClick={() => setShowFullDescription(!showFullDescription)}>
                {showFullDescription ? "Show Less" : "Read More"}
              </Button>
            )}
          </div>

          <Separator className="my-12" />

          {/* Comments Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <MessageCircle className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Comments</h2>
              <Badge variant="secondary">{comments.length}</Badge>
            </div>

            {/* Post Comment */}
            {user ? (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="mb-4"
                  />
                  <Button onClick={handlePostComment} disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-8">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Please login to comment</p>
                </CardContent>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            {comment.userName || comment.username || comment.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const d = comment.createdAt;
                              if (!d) return ""
                              if (typeof d.toDate === 'function') return d.toDate().toLocaleDateString()
                              return new Date(d).toLocaleDateString()
                            })()}
                          </p>
                        </div>
                        {user && user.uid === comment.userId && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingComment(comment.id)
                                setEditText(comment.comment || comment.commentText)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment.id ? (
                        <div className="space-y-3">
                          <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingComment(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm mb-3 whitespace-pre-wrap">{comment.comment || comment.commentText}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}
