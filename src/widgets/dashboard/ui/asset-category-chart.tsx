import { Cell, Pie, PieChart } from 'recharts'
import type { CategoryBreakdownPoint } from '@/widgets/dashboard/lib/build-dashboard-chart-data'
import { DashboardChartCard } from '@/widgets/dashboard/ui/dashboard-chart-card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/chart'

const CHART_COLORS = [
  'rgb(var(--chart-1))',
  'rgb(var(--chart-2))',
  'rgb(var(--chart-3))',
  'rgb(var(--chart-4))',
  'rgb(var(--chart-5))',
  'rgb(var(--primary))',
  'rgb(var(--info))',
]

interface AssetCategoryChartProps {
  data: CategoryBreakdownPoint[]
}

export function AssetCategoryChart({ data }: AssetCategoryChartProps) {
  const chartConfig = data.reduce<ChartConfig>((config, item, index) => {
    config[item.key] = {
      label: item.category,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }
    return config
  }, {})

  return (
    <DashboardChartCard
      title="카테고리별 자산 분포"
      description="샘플 자산 기준 카테고리 비중"
    >
      <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
        <PieChart margin={{ top: 12, right: 16, left: 16, bottom: 8 }}>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
          <Pie
            data={data}
            dataKey="count"
            nameKey="key"
            innerRadius={48}
            outerRadius={76}
            paddingAngle={2}
            cx="50%"
            cy="42%"
          >
            {data.map((item, index) => (
              <Cell key={item.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <ChartLegend
            verticalAlign="bottom"
            content={<ChartLegendContent nameKey="key" className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2" />}
          />
        </PieChart>
      </ChartContainer>
    </DashboardChartCard>
  )
}
