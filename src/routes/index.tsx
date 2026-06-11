import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  FlaskConical,
  ListTodo,
  Mail,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace" },
      { name: "description", content: "Your AI-powered productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    title: "Smart Email Generator",
    description: "Generate professional emails tailored to tone and audience.",
    icon: Mail,
    url: "/email",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Extract key points, actions, and deadlines from meeting notes.",
    icon: NotebookPen,
    url: "/meetings",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  {
    title: "AI Task Planner",
    description: "Prioritize tasks and get smart scheduling suggestions.",
    icon: ListTodo,
    url: "/tasks",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
  {
    title: "Research Assistant",
    description: "Get insights, summaries, and structured research on any topic.",
    icon: FlaskConical,
    url: "/research",
    color: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  },
  {
    title: "AI Chatbot",
    description: "Ask anything about productivity, writing, or workplace tasks.",
    icon: Bot,
    url: "/chat",
    color: "bg-slate-50 text-slate-600 dark:bg-slate-950/30 dark:text-slate-400",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Workplace Productivity Assistant
        </h1>
        <p className="text-muted-foreground">
          Automate your daily work tasks with intelligent AI-powered tools.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.title} to={tool.url} className="group">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${tool.color}`}>
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
