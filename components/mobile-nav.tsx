"use client"

import Link from "next/link"
import { Film, Menu, Search, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AwardWinnersDropdown } from "@/components/award-winners-dropdown"

export function MobileNav() {
    const { theme, toggleTheme } = useTheme()
    const { user, signOut } = useAuth()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                <SheetHeader className="p-4 border-b text-left">
                    <SheetTitle className="flex items-center gap-2">
                        <Film className="h-6 w-6" />
                        <span>Movie Reporter</span>
                    </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-65px)]">
                    <div className="flex flex-col py-4">
                        <Link
                            href="/"
                            className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Home
                        </Link>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="movies-world" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-accent hover:text-accent-foreground">
                                    Movies World
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/30">
                                    <div className="flex flex-col">
                                        <Link href="/celebrities" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Celebrity Profiles
                                        </Link>
                                        <Link href="/movies-info" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Movies Info
                                        </Link>
                                        <Link href="/top-boxoffice" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Top Box Office
                                        </Link>
                                        <Link href="/upcoming-releases" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Upcoming Releases
                                        </Link>
                                        <Link href="/ott-releases" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            OTT Releases
                                        </Link>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Link href="/movies" className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            Reviews & Ratings
                        </Link>
                        <Link href="/news" className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            News
                        </Link>
                        <Link href="/blogs" className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            Blogs
                        </Link>
                        <Link href="/polls" className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            Polls
                        </Link>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="vote-enroll" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-accent hover:text-accent-foreground">
                                    Vote Enroll
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/30">
                                    <div className="flex flex-col">
                                        {["Tollywood", "Bollywood", "Kollywood", "Sandalwood", "Hollywood", "Mollywood", "Pan India"].map((industry) => (
                                            <Link
                                                key={industry}
                                                href={`/vote-enroll?industry=${industry.toLowerCase().replace(" ", "-")}`}
                                                className="px-8 py-2 text-sm hover:text-primary transition-colors"
                                            >
                                                {industry}
                                            </Link>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="award-winners" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-accent hover:text-accent-foreground">
                                    Award Winners
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/30">
                                    <div className="flex flex-col">
                                        <AwardWinnersDropdown isMobile />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <Link href="/weekly-magazine" className="px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            Magazine
                        </Link>

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="about" className="border-b-0">
                                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline hover:bg-accent hover:text-accent-foreground">
                                    About
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/30">
                                    <div className="flex flex-col">
                                        <Link href="/about" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            About Us
                                        </Link>
                                        <Link href="/help" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Help For Us
                                        </Link>
                                        <Link href="/promotion" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Contact for Promotion
                                        </Link>
                                        <Link href="/copyright" className="px-8 py-2 text-sm hover:text-primary transition-colors">
                                            Copyright Policy
                                        </Link>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="p-4 border-t mt-auto">
                        <div className="flex items-center justify-between px-4">
                            <Label htmlFor="theme-mode" className="text-sm font-medium">Dark Mode</Label>
                            <Switch
                                id="theme-mode"
                                checked={theme === "dark"}
                                onCheckedChange={toggleTheme}
                            />
                        </div>
                        {user && (
                            <div className="px-4 mt-4">
                                <Button variant="destructive" className="w-full" onClick={() => signOut()}>
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
