import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { crosswordSchema, type CrosswordInput } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const [crosswordGrid, setCrosswordGrid] = useState<string[][]>([]);
  const [wordPositions, setWordPositions] = useState<any[]>([]);
  const crosswordRef = useRef<HTMLDivElement>(null);

  const form = useForm<CrosswordInput>({
    resolver: zodResolver(crosswordSchema),
    defaultValues: {
      wordList: ""
    }
  });

  const crosswordMutation = useMutation({
    mutationFn: async (data: CrosswordInput) => {
      const res = await apiRequest("POST", "/api/crossword", data);
      return res.json();
    },
    onSuccess: (data) => {
      setCrosswordGrid(data.grid);
      setWordPositions(data.words);
      toast({
        title: "Success",
        description: "Crossword generated successfully!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const downloadPuzzle = () => {
    if (!crosswordRef.current || crosswordGrid.length === 0) return;

    const svgData = `
      <svg width="${crosswordGrid[0].length * 40}" height="${crosswordGrid.length * 40}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .cell { fill: white; stroke: black; stroke-width: 1; }
          .number { font-size: 12px; }
        </style>
        ${crosswordGrid.map((row, i) => 
          row.map((cell, j) => {
            const wordStart = wordPositions.find(w => w.position?.x === j && w.position?.y === i);
            return cell ? `
              <rect x="${j * 40}" y="${i * 40}" width="40" height="40" class="cell"/>
              ${wordStart ? `<text x="${j * 40 + 5}" y="${i * 40 + 12}" class="number">${wordStart.position.number}</text>` : ''}
            ` : '';
          }).join('')
        ).join('')}
      </svg>
    `;

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crossword-puzzle.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        Crossword Generator
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => crosswordMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="wordList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Words (comma-separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="cat, dog, fish, bird" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={crosswordMutation.isPending}
              >
                {crosswordMutation.isPending ? "Generating..." : "Generate Crossword"}
              </Button>
            </form>
          </Form>
        </Card>

        <Card className="p-6">
          {crosswordGrid.length > 0 ? (
            <div className="flex flex-col items-center">
              <div ref={crosswordRef} className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${crosswordGrid[0].length}, 1.5rem)`
              }}>
                {crosswordGrid.map((row, i) => 
                  row.map((cell, j) => {
                    const wordStart = wordPositions.find(
                      w => w.position?.x === j && w.position?.y === i
                    );
                    return (
                      <div 
                        key={`${i}-${j}`}
                        className={`w-6 h-6 border flex items-center justify-center relative
                          ${cell ? 'bg-white' : 'bg-gray-200'}`}
                      >
                        {wordStart && (
                          <span className="absolute text-[8px] top-0 left-0">
                            {wordStart.position.number}
                          </span>
                        )}
                        {cell && <span className="text-sm">{cell}</span>}
                      </div>
                    );
                  })
                )}
              </div>

              <Button
                variant="outline"
                className="mt-4 flex items-center gap-2"
                onClick={downloadPuzzle}
              >
                <Download className="h-4 w-4" />
                Download Empty Puzzle
              </Button>

              <div className="mt-4 w-full">
                <h3 className="font-bold mb-2">Words:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Across</h4>
                    {wordPositions
                      .filter(w => w.position?.direction === "across")
                      .map(w => (
                        <div key={w.id} className="text-sm">
                          {w.position.number}. {w.word}
                        </div>
                      ))
                    }
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Down</h4>
                    {wordPositions
                      .filter(w => w.position?.direction === "down")
                      .map(w => (
                        <div key={w.id} className="text-sm">
                          {w.position.number}. {w.word}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Enter words and generate a crossword to see it here
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}