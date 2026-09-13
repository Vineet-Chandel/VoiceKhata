"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Dashboard_UI/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Dashboard_UI/chart"

type ChartData = {
  date: string
  balance: number
}

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data }: { data: ChartData[] }) {
  return (
    <Card className="@container/card">

      <CardHeader>

        <CardTitle>Running Balance</CardTitle>

        <CardDescription>
          Track how your balance changes over time
        </CardDescription>

      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >

          <AreaChart data={data}>

            <defs>

              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.05} />
              </linearGradient>

            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              type="category"
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              height={30}
              tick={({ x, y, payload }: any) => {
                const d = new Date(payload?.value)
                const formatted = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={12}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {formatted}
                    </text>
                  </g>
                )
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                `₹${value.toLocaleString()}`
              }
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Area
              dataKey="balance"
              type="monotone"
              stroke="var(--color-balance)"
              strokeWidth={2}
              fill="url(#fillBalance)"
            />

          </AreaChart>

        </ChartContainer>

      </CardContent>

    </Card>
  )
}