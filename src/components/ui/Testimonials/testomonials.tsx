import { Globe } from "lucide-react"
import { CircularTestimonials } from "@/components/ui/Testimonials/Circular-testimonials";

const testimonials = [
  {
    quote:
      "I never realized how much I was overspending until I saw everything in one dashboard. The budget alerts genuinely helped me save more every month.",
    name: "Aarav Sharma",
    designation: "B.Tech Student",
    src:
      "https://media.licdn.com/dms/image/v2/D5603AQGUnlh5jRlBJg/profile-displayphoto-scale_200_200/B56Zl7VYihJsAY-/0/1758710828365?e=1773878400&v=beta&t=ebFNMOcuZH82lYVG2Oum28pm7iBRUcsWNz6ycA3xI1k",
  },
  {
    quote:
      "The auto expense tracking from emails is a game changer. I don’t manually enter transactions anymore — it just works.",
    name: "Priya Nair",
    designation: "Marketing Executive",
    src:
      "https://media.licdn.com/dms/image/v2/C5603AQG4uBEP6ytFnQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1516902450493?e=1773878400&v=beta&t=KkiwTahQ6zD6dBzzVP3McdFy2Ze5aTe4EZz3ZLsbuSg",
  },
  {
    quote:
      "The AI insights helped me understand my spending patterns clearly. I’ve reduced unnecessary expenses by nearly 20% in just two months.",
    name: "Rohan Mehta",
    designation: "Software Developer",
    src:
      "https://media.licdn.com/dms/image/v2/D4D03AQHKoH1jXp28lA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1706264902261?e=1773878400&v=beta&t=9pszgFVlNwRFaX11jINSEzLQPvkyDHTuw15YF3NnK8I",
  },
];

export const CircularTestimonialsDemo = () => (
  <section className="relative w-full py-4 px-4 sm:px-6 lg:px-8">
    <div className="flex justify-center">
        <div className="mb-4 mt-10 inline-flex items-center gap-2 rounded-full bg-surface-secondary border border-border px-4 py-1 text-sm text-text-primary">
          <span className="flex items-center gap-2 text-text-primary">
              <Globe className="size-4 text-text-primary" />
              Social Proof
          </span>
        </div>
    </div>
    {/* CENTERED CONTAINER — SAME STYLE AS BUDGET */}
    <div className="relative mx-auto max-w-6xl rounded-3xl border border-border bg-gradient-to-br from-[#0A0A0A] to-[#151515] p-12 overflow-hidden">

      {/* Glow Background */}
      <div className="absolute top-100 right-240 h-96 w-96 rounded-full bg-surface-secondary/20 blur-3xl" />

      <div className="relative z-10">

        {/* Heading */}
        <h2 className="text-center font-medium text-xl md:text-3xl tracking-tight">
          <span className="text-text-secondary">Hear it from our users</span>
          <br />
          <span className="font-semibold text-text-primary">
            Stop using spreadsheets.
          </span>
        </h2>

        {/* Testimonials */}
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-4xl">
            <CircularTestimonials
              testimonials={testimonials}
              autoplay
              colors={{
                name: "#f7f7ff",
                designation: "#e1e1e1",
                testimony: "#f1f1f7",
                arrowBackground: "#F7F7FA",
                arrowForeground: "#141414",
                arrowHoverBackground: "#f7f7ff",
              }}
              fontSizes={{
                name: "28px",
                designation: "18px",
                quote: "18px",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  </section>
);