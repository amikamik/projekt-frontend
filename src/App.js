import React, { useState } from 'react';

// === TO JEST ADRES TWOJEGO BACKENDU ===
const RENDER_API_URL = "https://analiza-danych.onrender.com/api/generate-report";
// ======================================

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [reportHtml, setReportHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Funkcja wywoływana, gdy użytkownik wybierze plik
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setReportHtml(""); // Czyści stary raport
    setError(""); // Czyści stary błąd
  };

  // Funkcja wywoływana, gdy użytkownik kliknie "Generuj Raport"
  const handleGenerateReport = async () => {
    if (!selectedFile) {
      setError("Proszę, wybierz najpierw plik CSV.");
      return;
    }

    setIsLoading(true);
    setError("");
    setReportHtml("");

    // Używamy FormData do wysłania pliku
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Pamiętaj o "usypianiu"! To może potrwać ponad minutę.
      const response = await fetch(RENDER_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status} ${response.statusText}`);
      }

      // Odbieramy odpowiedź jako tekst (który jest kodem HTML)
      const html = await response.text();
      setReportHtml(html);

    } catch (err) {
      console.error("Błąd generowania raportu:", err);
      setError("Nie udało się wygenerować raportu. Sprawdź, czy plik to na pewno CSV. Błąd: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>Automatyczny Generator Raportów Statystycznych 📈</h1>
      <p>Wgraj swój plik CSV, aby otrzymać pełną analizę danych.</p>
      
      <div style={{ margin: '20px 0' }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleGenerateReport} 
          disabled={isLoading}
          style={{ fontSize: '16px', marginLeft: '10px' }}
        >
          {isLoading ? "Generowanie..." : "Generuj Raport"}
        </button>
      </div>

      {/* Komunikaty o stanie */}
      {isLoading && <p style={{ color: 'blue' }}><strong>Generowanie raportu...</strong><br/>To może potrwać nawet 2-3 minuty, jeśli serwer musi się obudzić i przetworzyć duże dane. Bądź cierpliwy.</p>}
      {error && <p style={{ color: 'red' }}><strong>Błąd:</strong> {error}</p>}

      <hr style={{ margin: '30px 0' }} />

      {/* Tutaj wyświetlimy raport */}
      <h2>Twój Raport:</h2>
      <div 
        style={{ border: '1px solid #ccc', background: '#f9f9f9' }}
        dangerouslySetInnerHTML={{ __html: reportHtml }} 
      />
    </div>
  );
}

export default App;