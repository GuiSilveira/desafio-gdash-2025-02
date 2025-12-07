import { Card } from "../../ui/card";

export function SunPositionSkeleton() {
  return (
    <Card className="p-6 rounded-4xl shadow-[0px_8px_24px_rgba(45,52,54,0.04)] dark:shadow-none dark:border dark:border-[#3E4C5E]">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-muted rounded w-32"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    </Card>
  );
}
