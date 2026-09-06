import { Router, Request, Response } from "express"
import axios from "axios"

const router = Router()
const TWELVE_KEY = process.env.TWELVE_DATA_KEY
const TWELVE = "https://api.twelvedata.com"

// ── GET /stock/quote?ticker=RELIANCE ─────────────────────────
router.get("/quote", async (req: Request, res: Response) => {
    const ticker = (req.query.ticker as string)?.toUpperCase()
    if (!ticker) return res.status(400).json({ error: "ticker required" })

    try {
        const [quoteRes, profileRes] = await Promise.all([
            axios.get(`${TWELVE}/quote`, {
                params: { symbol: ticker, exchange: "NSE", apikey: TWELVE_KEY }
            }),
            axios.get(`${TWELVE}/profile`, {
                params: { symbol: ticker, exchange: "NSE", apikey: TWELVE_KEY }
            }),
        ])

        const quote   = quoteRes.data
        const profile = profileRes.data

        // Twelve Data returns status: "error" for invalid tickers
        if (quote.status === "error") {
            return res.status(404).json({ error: quote.message ?? "Ticker not found" })
        }

        res.json({
            ticker,
            name:      quote.name                ?? ticker,
            price:     parseFloat(quote.close)   ?? 0,
            change:    parseFloat(quote.change)  ?? 0,
            pct:       parseFloat(quote.percent_change) ?? 0,
            high:      parseFloat(quote.fifty_two_week?.high ?? quote.high) ?? 0,
            low:       parseFloat(quote.fifty_two_week?.low  ?? quote.low)  ?? 0,
            prevClose: parseFloat(quote.previous_close) ?? 0,
            volume:    parseInt(quote.volume)    ?? 0,
            marketCap: profile?.market_capitalization ?? 0,
            sector:    profile?.sector               ?? null,
            exchange:  quote.exchange                ?? "NSE",
        })
    } catch (err: any) {
        console.error("Stock quote error:", err.message)
        res.status(500).json({ error: "Failed to fetch quote" })
    }
})

// ── GET /stock/search?q=Reliance ─────────────────────────────
router.get("/search", async (req: Request, res: Response) => {
    const q = req.query.q as string
    if (!q) return res.status(400).json({ error: "q required" })

    try {
        const { data } = await axios.get(`${TWELVE}/symbol_search`, {
            params: {
                symbol:      q,
                outputsize:  10,
                apikey:      TWELVE_KEY,
            }
        })

        if (data.status === "error") {
            return res.status(400).json({ error: data.message })
        }

        const hits = (data?.data ?? [])
            .filter((r: any) =>
                ["NSE", "BSE", "NASDAQ", "NYSE"].includes(r.exchange)
            )
            .slice(0, 6)
            .map((r: any) => ({
                ticker:      r.symbol,
                name:        r.instrument_name,
                exchange:    r.exchange,
                type:        r.instrument_type,
                country:     r.country,
                currency:    r.currency,
            }))

        res.json(hits)
    } catch (err: any) {
        console.error("Stock search error:", err.message)
        res.status(500).json({ error: "Failed to search" })
    }
})

// ── GET /stock/history?ticker=RELIANCE&interval=1day&range=30 ─
router.get("/history", async (req: Request, res: Response) => {
    const ticker   = (req.query.ticker as string)?.toUpperCase()
    const interval = (req.query.interval as string) ?? "1day"
    const range    = parseInt(req.query.range as string) ?? 30

    if (!ticker) return res.status(400).json({ error: "ticker required" })

    try {
        const { data } = await axios.get(`${TWELVE}/time_series`, {
            params: {
                symbol:     ticker,
                exchange:   "NSE",
                interval,
                outputsize: range,
                apikey:     TWELVE_KEY,
            }
        })

        if (data.status === "error") {
            return res.status(404).json({ error: data.message ?? "No data found" })
        }

        const history = (data?.values ?? []).map((v: any) => ({
            date:   v.datetime,
            open:   parseFloat(v.open),
            high:   parseFloat(v.high),
            low:    parseFloat(v.low),
            close:  parseFloat(v.close),
            volume: parseInt(v.volume),
        }))

        res.json({ ticker, interval, history })
    } catch (err: any) {
        console.error("Stock history error:", err.message)
        res.status(500).json({ error: "Failed to fetch history" })
    }
})

export default router