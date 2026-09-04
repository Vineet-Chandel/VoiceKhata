import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/firebase/firebase"
import { Header } from "@/components/ui/Navbar/header";
import { Footer } from "@/components/ui/Footer";
import { HeroSection } from "@/components/ui/Hero/hero-section";
import { LogosSection } from "@/components/ui/Hero/logos-section";
import { DisplayCardsDemo } from "../ui/Feature_Section/feature-section";
import Budget from "@/components/ui/Feature_Section/budget";
import { CircularTestimonialsDemo } from "@/components/ui/Testimonials/testomonials";
import GetStarted from "@/components/ui/Get Started/getstarted";
import { FaqsSection } from "@/components/ui/FAQS/faqs";

export default function Page() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsLoggedIn(!!firebaseUser)
      setAuthChecked(true)
    })
    return () => unsubscribe()
  }, [])

  if (!authChecked) return null
  if (isLoggedIn) return <Navigate to="/dashboard" replace />

  return (
    <>
      <Header />

      <main className="grow">

        {/* HERO */}
        <section id="home">
          <HeroSection />
          <LogosSection />
        </section>

        {/* FEATURES */}
        <section id="features" className="py-10">
          <div className="place-content-center p-4">
            <DisplayCardsDemo />
            <Budget />
          </div>
        </section>

        {/* GET STARTED */}
        <section id="getstarted" className="py-1">
          <GetStarted />
        </section>

        {/* FAQS — FIX: py-10 → pt-10 pb-4 so footer sits closer */}
        <section id="FAQS" className="pt-8 pb-8">
          <FaqsSection />
        </section>

        {/* ABOUT US — FIX: py-10 → pt-4 so gap between FAQs and footer is tight */}
        <section id="about" className="pt-4 pb-10">
          <Footer />
        </section>

      </main>
    </>
  )
}