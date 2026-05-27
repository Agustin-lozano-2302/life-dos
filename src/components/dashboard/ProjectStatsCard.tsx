import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ProjectTask } from '@/types/projects'
import type { Project } from '@/types/projects'

const STATUS_COLORS: Record<string, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
}

interface ProjectStatsCardProps {
  projects: Project[]
  doneTasks: ProjectTask[]
}

export function ProjectStatsCard({ projects, doneTasks }: ProjectStatsCardProps) {
  const statusCounts = {
    active: projects.filter((p) => p.status === 'active').length,
    paused: projects.filter((p) => p.status === 'paused').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  }

  const chartData = [
    { name: 'Active', value: statusCounts.active, fill: STATUS_COLORS.in_progress },
    { name: 'Paused', value: statusCounts.paused, fill: STATUS_COLORS.review },
    { name: 'Done', value: statusCounts.completed, fill: STATUS_COLORS.done },
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projects</h3>
      <div className="mb-3 flex gap-4 text-sm">
        <div>
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-400">{doneTasks.length}</p>
          <p className="text-xs text-muted-foreground">tasks closed</p>
        </div>
      </div>
      {projects.length > 0 && (
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={chartData} barSize={24}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
