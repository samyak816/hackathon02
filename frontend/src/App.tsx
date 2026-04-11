import React, { useState } from 'react';

// 1. Define the exact shape of the data coming back from Flask
interface PredictionResult {
  status: string;
  confidence: number;
}

export default function App() {
  // 2. Set up strongly-typed state variables
  const [symptoms, setSymptoms] = useState<string>("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Your Render Backend URL
  const API_BASE_URL = " https://hackathon02-1.onrender.com";

  // 3. The submit handler, typed for a Form Event
  const handlePredict = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page reload
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: PredictionResult = await response.json();
      setResult(data); // Save successful data
      
    } catch (err) {
      console.error("Connection error:", err);
      setError("Failed to connect to the backend. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading spinner whether it succeeded or failed
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Symptom Checker</h2>
      
      <form onSubmit={handlePredict}>
        <textarea 
          value={symptoms} 
          onChange={(e) => setSymptoms(e.target.value)} 
          placeholder="Describe your symptoms (e.g., headache, mild fever)..." 
          rows={4}
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          required
        />
        <button 
          type="submit" 
          disabled={isLoading || !symptoms.trim()}
          style={{ width: '100%', padding: '10px' }}
        >
          {isLoading ? "Analyzing..." : "Get Prediction"}
        </button>
      </form>

      {/* --- Display Error Message --- */}
      {error && (
        <div style={{ color: 'red', marginTop: '15px' }}>
          {error}
        </div>
      )}

      {/* --- Display Success Result --- */}
      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Diagnosis Result</h3>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Confidence:</strong> {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}