"use client";

import React, { useState, useRef } from "react";
import { QA_SCENARIOS, StepStatus } from "@/lib/test-scenarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEconomy } from "@/context/EconomyContext";
import { MoveLeft, Printer, Send, Trash2 } from "lucide-react";

export default function QATestingPage() {
  const { toast } = useToast();
  const { clearProgress } = useEconomy();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [testerName, setTesterName] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState("");
  const [observations, setObservations] = useState("");
  
  // Initialize results state with empty values for each scenario
  const [results, setResults] = useState<Record<string, { id: string, issueLog: string, steps: { number: number, status: StepStatus }[] }>>(
    QA_SCENARIOS.reduce((acc, s) => ({
      ...acc,
      [s.id]: {
        id: s.id,
        issueLog: "",
        steps: s.steps.map(step => ({ number: step.number, status: "" }))
      }
    }), {})
  );

  const handleStepChange = (scenarioId: string, stepNum: number, status: StepStatus) => {
    setResults(prev => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        steps: prev[scenarioId].steps.map(step => 
          step.number === stepNum ? { ...step, status } : step
        )
      }
    }));
  };

  const handleIssueLogChange = (scenarioId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        issueLog: value
      }
    }));
  };

  const handlePrint = () => window.print();

  const handleClearGameProgress = () => {
    if (confirm("Are you sure you want to clear all game progress for a fresh test state?")) {
        clearProgress();
        toast({ title: "Progress Cleared", description: "Local game state has been reset to defaults." });
    }
  };

  const handleSubmit = async () => {
    if (!testerName || !duration) {
        toast({ 
            title: "Missing Information", 
            description: "Please enter Tester Name and Duration before submitting.",
            variant: "destructive"
        });
        return;
    }

    const payload = {
        testerName, 
        testDate,
        durationMin: Number(duration), 
        observations,
        scenarios: Object.values(results)
    };
    
    try {
        const res = await fetch("/api/qa/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            toast({ title: "Success", description: "Test scenarios saved to database." });
        } else {
            const data = await res.json();
            throw new Error(data.error || "Failed to submit");
        }
    } catch (error: any) {
        toast({ 
            title: "Submission Failed", 
            description: error.message,
            variant: "destructive"
        });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 overflow-y-auto" ref={printRef}>
      <div className="max-w-4xl mx-auto space-y-8 print-container">
        {/* Navigation - Hidden during print */}
        <div className="flex justify-between items-center print:hidden">
            <Button variant="ghost" onClick={() => window.location.href = '/'} className="text-gray-400 hover:text-white">
                <MoveLeft className="mr-2 h-4 w-4" /> Back to Game
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearGameProgress}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear Game Progress (Fresh State)
            </Button>
        </div>

        {/* Header - Top 15% */}
        <Card className="bg-gray-950 border-gray-800 border-2">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-3xl font-bold tracking-tighter text-red-600 uppercase italic">
              INDUSTRIALIST QA <span className="text-gray-600 ml-2 font-normal text-sm">System ID: {new Date().getTime().toString(16)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 font-bold">Tester Name</label>
              <Input 
                placeholder="Required" 
                className="bg-black border-gray-700 focus:border-red-600" 
                value={testerName} 
                onChange={e => setTesterName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 font-bold">Date</label>
              <Input 
                type="date" 
                className="bg-black border-gray-700 focus:border-red-600" 
                value={testDate} 
                onChange={e => setTestDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 font-bold">Duration (min)</label>
              <Input 
                type="number" 
                placeholder="Required"
                className="bg-black border-gray-700 focus:border-red-600" 
                value={duration} 
                onChange={e => setDuration(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Tables - Middle 50% */}
        <div className="space-y-12">
            {QA_SCENARIOS.map((scenario) => (
            <Card key={scenario.id} className="bg-gray-950 border-gray-800 border-2 break-inside-avoid shadow-xl">
                <CardHeader className="bg-gray-900/50 border-b border-gray-800">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-yellow-500">{scenario.id}: {scenario.title}</CardTitle>
                        <p className="text-sm text-gray-400 mt-1 italic">{scenario.context}</p>
                    </div>
                    <div className="bg-red-900/20 text-red-500 text-[10px] px-2 py-1 border border-red-900/50 rounded uppercase font-bold">
                        Variant {scenario.variant}
                    </div>
                </div>
                </CardHeader>
                <CardContent className="pt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left mb-6 border-collapse">
                        <thead>
                        <tr className="border-b-2 border-gray-800 text-xs uppercase text-gray-500 font-bold">
                            <th className="pb-3 pr-4 w-12 text-center">Step</th>
                            <th className="pb-3 pr-4">Action to Perform</th>
                            <th className="pb-3 pr-4">Expected Result</th>
                            <th className="pb-3 w-32 text-center">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scenario.steps.map(step => (
                            <tr key={step.number} className="border-b border-gray-800/50 group hover:bg-gray-900/30 transition-colors">
                            <td className="py-4 pr-4 text-center font-mono text-gray-500">{step.number}</td>
                            <td className="py-4 pr-4 text-sm leading-relaxed">{step.action}</td>
                            <td className="py-4 pr-4 text-sm text-gray-400 italic">{step.expected}</td>
                            <td className="py-4 text-center">
                                <div className="flex justify-center gap-1">
                                    {["✓", "✗", "~"].map((status) => (
                                    <button 
                                        key={status} 
                                        onClick={() => handleStepChange(scenario.id, step.number, status as StepStatus)}
                                        className={`w-8 h-8 flex items-center justify-center border transition-all font-bold ${
                                            results[scenario.id].steps.find(s => s.number === step.number)?.status === status
                                            ? status === "✓" ? "bg-green-600 border-green-400 text-white scale-110" :
                                                status === "✗" ? "bg-red-600 border-red-400 text-white scale-110" :
                                                "bg-yellow-600 border-yellow-400 text-black scale-110"
                                            : "bg-black border-gray-700 text-gray-500 hover:border-gray-500"
                                        }`}
                                    >
                                        {status}
                                    </button>
                                    ))}
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs uppercase text-gray-500 font-bold flex items-center">
                        Issue Log <span className="ml-2 font-normal text-[10px] lowercase text-gray-600 italic">(Explain any ✗ or ~ marks)</span>
                    </label>
                    <div className="relative">
                        <Textarea 
                            placeholder="Detail any technical failures or UX friction encountered..." 
                            className="bg-black border-gray-800 focus:border-red-600 min-h-[100px] resize-none leading-8 bg-[linear-gradient(transparent_31px,#1f2937_32px)] bg-[length:100%_32px]" 
                            value={results[scenario.id].issueLog}
                            onChange={e => handleIssueLogChange(scenario.id, e.target.value)}
                        />
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>

        {/* General Observations - Bottom 35% */}
        <Card className="bg-gray-950 border-gray-800 border-2 break-inside-avoid shadow-2xl">
            <CardHeader className="bg-gray-900/50 border-b border-gray-800">
                <CardTitle className="text-xl text-red-500 uppercase tracking-widest">General Observations</CardTitle>
                <p className="text-xs text-gray-500 italic">Record UI confusion, visual glitches, or unexpected behaviors not tied to a specific step.</p>
            </CardHeader>
            <CardContent className="pt-6">
                <Textarea 
                  className="h-48 bg-black border-gray-800 focus:border-red-600 resize-none font-mono text-sm" 
                  placeholder="START TYPING..."
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                />
            </CardContent>
        </Card>

        {/* Action Buttons (Hidden during print) */}
        <div className="flex flex-col md:flex-row gap-4 pt-8 pb-16 print:hidden">
            <Button onClick={handleSubmit} variant="default" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-14 text-lg uppercase tracking-tighter transition-all hover:scale-[1.02]">
                <Send className="mr-3 h-5 w-5" /> Submit to Audit Database
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1 border-gray-700 hover:bg-gray-900 h-14 text-lg uppercase tracking-tighter font-bold transition-all">
                <Printer className="mr-3 h-5 w-5" /> Print / Export to Physical PDF
            </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
            body {
                background: white !important;
                color: black !important;
                overflow: visible !important;
                height: auto !important;
            }
            .print\\:hidden {
                display: none !important;
            }
            .break-inside-avoid {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .print-container {
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            /* Dark mode override for print */
            div[class*="bg-gray-950"], div[class*="bg-gray-900"], div[class*="bg-black"] {
                background: white !important;
                border-color: #000 !important;
                color: black !important;
                box-shadow: none !important;
            }
            textarea, input {
                background: white !important;
                color: black !important;
                border-color: #ccc !important;
            }
            h2, h3, span, p, label, th, td {
                color: black !important;
            }
            .text-red-600, .text-yellow-500, .text-red-500 {
                color: black !important;
                text-decoration: underline !important;
            }
            table tr {
                border-bottom-color: #eee !important;
            }
            /* Force dotted lines to show in print for issue log if desired, 
               or just keep as standard textarea */
        }
      `}</style>
    </div>
  );
}
