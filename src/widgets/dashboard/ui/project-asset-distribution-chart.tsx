import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { ProjectAssetPoint } from '@/widgets/dashboard/lib/build-dashboard-chart-data'
import { DashboardChartCard } from '@/widgets/dashboard/ui/dashboard-chart-card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'

const chartConfig = {
  assets: {
    label: '자산 수',
    color: 'rgb(var(--chart-2))',
  },
} satisfies ChartConfig

interface ProjectAssetDistributionChartProps {
  data: ProjectAssetPoint[]
}

const CHART_TICK_STYLE = { fill: 'hsl(215 16% 47%)', fontSize: 12 }

export function ProjectAssetDistributionChart({ data }: ProjectAssetDistributionChartProps) {
  return (
    <DashboardChartCard
      title="프로젝트별 자산 수"
      description="등록 자산 기준 상위 프로젝트"
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickLine={false} axisLine={false} tick={CHART_TICK_STYLE} />
          <YAxis
            type="category"
            dataKey="project"
            tickLine={false}
            axisLine={false}
            width={132}
            tick={CHART_TICK_STYLE}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
              />
            }
          />
          <Bar dataKey="assets" fill="rgb(var(--chart-2))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
    </DashboardChartCard>
  )
}
