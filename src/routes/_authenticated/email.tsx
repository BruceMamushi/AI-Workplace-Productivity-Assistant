import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai-tools.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Copy, Loader2, Mail, Wand2 } from "lucide-react";
import runnerIcon from "../../assets/runner-icon.png";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — AI Workplace" },
      { name: "description", content: "Generate professional emails with AI." },
    ],
  }),
  component: EmailGenerator,
});

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [audience, setAudience] = useState<string>("colleague");
  const [keyPoints, setKeyPoints] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateEmailFn = useServerFn(generateEmail);

  const handleGenerate = async () => {
    if (!purpose.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await generateEmailFn({
        data: {
          purpose,
          tone: tone as "professional" | "friendly" | "formal" | "casual" | "assertive",
          audience: audience as "boss" | "colleague" | "client" | "team" | "external",
          keyPoints: keyPoints || undefined,
        },
      });
      setResult(data.content);
    } catch (err) {
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          <Mail className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          <span className="min-w-0">Smart Email Generator</span>
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Generate professional emails tailored to your audience and tone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compose Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of the email</Label>
            <Input
              id="purpose"
              placeholder="e.g., Requesting a deadline extension for the Q3 report"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="assertive">Assertive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boss">Boss / Manager</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="external">External Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyPoints">Key points to include (optional)</Label>
            <Textarea
              id="keyPoints"
              placeholder="List specific points, dates, or requests to include..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !purpose.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Email
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="min-w-0 truncate text-base">Generated Email</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap break-words rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground sm:p-4">
              {result}
            </div>
          </CardContent>
        </Card>
      )}

      <AiDisclaimer />
    </div>
  );
}
