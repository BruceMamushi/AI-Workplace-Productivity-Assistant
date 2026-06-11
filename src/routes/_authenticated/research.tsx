import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai-tools.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { FlaskConical, Lightbulb, Loader2, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — AI Workplace" },
      { name: "description", content: "AI-powered research insights and summaries." },
    ],
  }),
  component: ResearchAssistant,
});

function ResearchAssistant() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<string>("detailed");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof researchTopic>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const researchTopicFn = useServerFn(researchTopic);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await researchTopicFn({
        data: {
          topic,
          depth: depth as "brief" | "detailed" | "comprehensive",
          focus: focus || undefined,
        },
      });
      setResult(data);
    } catch (err) {
      toast.error("Failed to research topic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          <FlaskConical className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          <span className="min-w-0">AI Research Assistant</span>
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Get structured insights, summaries, and next steps on any topic.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Research Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Research topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Trends in remote work productivity for 2024"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief overview</SelectItem>
                  <SelectItem value="detailed">Detailed analysis</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Specific focus areas (optional)</Label>
            <Textarea
              id="focus"
              placeholder="e.g., impact on mental health, best practices, tools and software"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleResearch}
            disabled={isLoading || !topic.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Research Topic
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{result.overview}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          {result.nextSteps && result.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {result.sources && result.sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.sources.map((source, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {source}
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
