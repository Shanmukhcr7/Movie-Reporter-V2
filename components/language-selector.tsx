"use client"

import { useState, useEffect } from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LANGUAGES = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi (हिंदी)" },
    { code: "te", name: "Telugu (తెలుగు)" },
    { code: "ta", name: "Tamil (தமிழ்)" },
    { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
    { code: "ml", name: "Malayalam (മലയാളം)" },
]

export function LanguageSelector() {
    const [currentLang, setCurrentLang] = useState("en")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Initialize Google Translate Script
        const addScript = document.createElement("script")
        addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        addScript.async = true
        document.body.appendChild(addScript)

        // @ts-ignore
        window.googleTranslateElementInit = () => {
            // @ts-ignore
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: "en",
                    includedLanguages: "en,hi,te,ta,kn,ml",
                    autoDisplay: false
                },
                "google_translate_element"
            )
        }
    }, [])

    const changeLanguage = (langCode: string) => {
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement
        if (select) {
            select.value = langCode
            select.dispatchEvent(new Event("change"))
            setCurrentLang(langCode)
        }
    }

    if (!mounted) return null

    return (
        <>
            <div id="google_translate_element" className="hidden" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Languages className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {LANGUAGES.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={currentLang === lang.code ? "bg-accent" : ""}
                        >
                            {lang.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
