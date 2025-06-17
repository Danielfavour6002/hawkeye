"use client";

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { promptBasedAnomalyExplanation } from '@/ai/flows/prompt-based-anomaly-explanation';
import type { AnomalyExplanation } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnomalyDetectorPage() {
  const [description, setDescription] = useState<string>('');
  const [result, setResult] = useState<AnomalyExplanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a network behavior description.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const aiResponse = await promptBasedAnomalyExplanation({ networkBehaviorDescription: description });
      setResult(aiResponse);
    } catch (error) {
      console.error("Error calling Anomaly AI:", error);
      toast({
        title: "AI Analysis Failed",
        description: "Could not get an explanation from the AI. Please try again later.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <AppShell pageTitle="Anomaly AI Detector">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Describe Network Behavior</CardTitle>
            <CardDescription>
              Enter a detailed description of the network traffic or behavior you want to analyze for anomalies.
              The AI model, trained on the NSL-KDD dataset, will provide an assessment.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid w-full gap-2">
                <Label htmlFor="behavior-description">Network Behavior Description</Label>
                <Textarea
                  id="behavior-description"
                  placeholder="e.g., 'Multiple failed login attempts from IP 1.2.3.4 followed by a large data transfer to an unknown external IP.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="resize-none"
                  aria-label="Network Behavior Description"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Analyzing...' : 'Analyze Behavior'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-1 h-fit"> {/* h-fit to make it not stretch full height if content is small */}
          <CardHeader>
            <CardTitle>AI Analysis Result</CardTitle>
            <CardDescription>The AI's assessment of the described behavior.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]"> {/* Minimum height for content area */}
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {!isLoading && result && (
              <div className="space-y-4">
                <div className="flex items-center text-lg font-semibold">
                  {result.isAnomalous ? (
                    <AlertCircle className="w-6 h-6 mr-2 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                  )}
                  Status: {result.isAnomalous ? 'Anomalous' : 'Not Anomalous'}
                </div>
                <div>
                  <h4 className="font-medium mb-1">Explanation:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{result.explanation}</p>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <p className="text-sm text-muted-foreground">Submit a description to see the AI analysis.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
