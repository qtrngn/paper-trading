import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
  type ChartStateProps = {
    title: string
    description: string
    statLabel: string
    statValue: string
    message: string
  }
  
  export default function ChartState({
    title,
    description,
    statLabel,
    statValue,
    message,
  }: ChartStateProps) {
    return (
      <Card className="chart-card">
        <CardHeader className="chart-header chart-header-bordered">
          <div className="chart-header-copy">
            <CardTitle className="card-title-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
  
          <div className="flex">
            <div className="chart-state-stat">
              <span className="caption-text">{statLabel}</span>
              <span className="chart-state-value">
                {statValue}
              </span>
            </div>
          </div>
        </CardHeader>
  
        <CardContent className="chart-content">
          <div className="empty-state-panel">
            {message}
          </div>
        </CardContent>
      </Card>
    )
  }
