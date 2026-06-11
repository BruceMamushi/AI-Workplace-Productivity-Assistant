import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai-tools.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { CheckCircle, FileText, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — AI Workplace" },
      { name: "description", content: "Summarize meeting notes with AI." },
    ],
  }),
  component: MeetingSummarizer,
});

function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof summarizeMeeting>> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const summarizeMeetingFn = useServerFn(summarizeMeeting);

  const handleSummarize = async () => {
    if (!notes.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await summarizeMeetingFn({ data: { notes } });
      setResult(data);
    } catch (err) {
      toast.error("Failed to summarize meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <FileText className="h-6 w-6 text-primary" />
          Meeting Notes Summarizer
        </h1>
        <p className="text-muted-foreground">
          Paste your meeting notes to extract key points, action items, and decisions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Paste your meeting notes here</Label>
            <Textarea
              id="notes"
              placeholder={`Example:\nJohn: We need to finish the design review by Friday.\nSarah: I'll handle the user research.\nAlex: Budget approval is pending from finance.\n...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
            />
          </div>

          <Button
            onClick={handleSummarize}
            disabled={isLoading || !notes.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Summarize Meeting
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {result.actionItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.actionItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border">
                        <div className="h-3 w-3 rounded-sm bg-primary/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{item.task}</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.owner && (
                            <Badge variant="secondary" className="text-xs">
                              {item.owner}
                            </Badge>
                          )}
                          {item.deadline && (
                            <Badge variant="outline" className="text-xs">
                              {item.deadline}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Decisions Made</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.decisions.map((decision, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{decision}</span>
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
