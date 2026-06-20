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

const CHART_TICK = { fontSize: 12 }

export function ProjectAssetDistributionChart({ data }: ProjectAssetDistributionChartProps) {
  return (
    <DashboardChartCard
      title="프로젝트별 자산 수"
      description="등록 자산 기준 상위 프로젝트"
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, left: 8, bottom: 12 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickLine={false} axisLine={false} tick={CHART_TICK} />
          <YAxis
            type="category"
            dataKey="project"
            tickLine={false}
            axisLine={false}
            width={132}
            tick={CHART_TICK}
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
