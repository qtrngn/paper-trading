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
      <Card className="py-4 sm:py-0">
        <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
  
          <div className="flex">
            <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">{statLabel}</span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {statValue}
              </span>
            </div>
          </div>
        </CardHeader>
  
        <CardContent className="px-2 sm:p-6">
          <div className="flex h-[250px] w-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            {message}
          </div>
        </CardContent>
      </Card>
    )
  }


  