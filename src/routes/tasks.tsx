import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { planTasks } from "@/lib/ai-tools.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Clock, ListTodo, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — AI Workplace" },
      { name: "description", content: "AI-powered task prioritization and scheduling." },
    ],
  }),
  component: TaskPlanner,
});

function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof planTasks>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const planTasksFn = useServerFn(planTasks);

  const handlePlan = async () => {
    if (!tasks.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await planTasksFn({
        data: { tasks, context: context || undefined },
      });
      setResult(data);
    } catch (err) {
      toast.error("Failed to plan tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
      case "low":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <ListTodo className="h-6 w-6 text-primary" />
          AI Task Planner
        </h1>
        <p className="text-muted-foreground">
          Get your tasks prioritized and scheduled for maximum productivity.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasks">List your tasks (one per line)</Label>
            <Textarea
              id="tasks"
              placeholder={`Finish Q3 report\nReply to client emails\nPrepare presentation\nReview pull requests\nUpdate project timeline`}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional context (optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., I have 4 hours today, the report is due tomorrow, I'm most productive in the morning..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handlePlan}
            disabled={isLoading || !tasks.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Plan & Prioritize
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prioritized Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.prioritizedTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{task.task}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        {task.estimatedTime && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTime}
                          </span>
                        )}
                        {task.suggestedTimeBlock && (
                          <span className="text-xs text-muted-foreground">
                            {task.suggestedTimeBlock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {result.schedule}
                </p>
              </CardContent>
            </Card>
          )}

          {result.tips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Productivity Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <AiDisclaimer />
    </div>
  );
}
