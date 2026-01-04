"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function CopyrightPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Copyright Policy</h1>
            <p className="text-xl text-muted-foreground">Protecting intellectual property rights</p>
          </div>

          <Card>
            <CardContent className="p-8 prose dark:prose-invert max-w-none">
              <h2>Copyright Notice</h2>
              <p>
                All content on Movie Reporter, including but not limited to text, images, graphics, logos, and software,
                is the property of Movie Reporter or its content suppliers and is protected by international copyright
                laws.
              </p>

              <h2>User-Generated Content</h2>
              <p>
                By submitting reviews, comments, or other content to Movie Reporter, you grant us a non-exclusive,
                royalty-free, perpetual license to use, reproduce, modify, and display such content in connection with
                our services.
              </p>

              <h2>Third-Party Content</h2>
              <p>
                Movie images, trailers, and related promotional materials are property of their respective copyright
                holders. We use such materials for editorial and informational purposes only.
              </p>

              <h2>DMCA Compliance</h2>
              <p>
                Movie Reporter respects the intellectual property rights of others. If you believe that your copyrighted
                work has been used in a way that constitutes copyright infringement, please contact us with the
                following information:
              </p>
              <ul>
                <li>Description of the copyrighted work</li>
                <li>Location of the infringing material on our site</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief</li>
                <li>Electronic or physical signature</li>
              </ul>

              <h2>Fair Use</h2>
              <p>
                We believe in fair use of copyrighted materials for purposes of commentary, criticism, news reporting,
                and education. We make every effort to use materials in accordance with fair use principles.
              </p>

              <h2>Contact</h2>
              <p>For copyright-related inquiries, please contact us at copyright@moviereporter.com</p>

              <p className="text-sm text-muted-foreground">Last updated: January 2026</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
