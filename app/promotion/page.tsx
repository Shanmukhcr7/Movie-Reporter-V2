"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Megaphone } from "lucide-react"
import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function PromotionPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await addDoc(collection(db, "artifacts/default-app-id/promotions"), {
        name,
        email,
        company,
        message,
        createdAt: new Date().toISOString(),
      })

      setName("")
      setEmail("")
      setCompany("")
      setMessage("")
      alert("Thank you! We'll get back to you soon.")
    } catch (error) {
      console.error("[v0] Error submitting promotion request:", error)
      alert("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Megaphone className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Promotion Opportunities</h1>
            <p className="text-xl text-muted-foreground">Partner with us to reach millions of movie enthusiasts</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 prose dark:prose-invert max-w-none">
              <h2>Why Promote with Movie Reporter?</h2>
              <ul>
                <li>Reach a large, engaged audience of movie enthusiasts</li>
                <li>Featured placement in our hero banners and weekly magazine</li>
                <li>Targeted exposure across multiple film industries</li>
                <li>Social media integration and sharing capabilities</li>
                <li>Analytics and performance tracking</li>
              </ul>

              <h2>Promotion Options</h2>
              <ul>
                <li>Hero banner placements on homepage</li>
                <li>Featured articles in weekly magazine</li>
                <li>Sponsored content and native advertising</li>
                <li>Event coverage and premiere announcements</li>
                <li>Custom promotional campaigns</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company/Production House</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Promotion Details</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    placeholder="Tell us about what you'd like to promote and your goals..."
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
