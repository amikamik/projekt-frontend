import React, { useState } from 'react';

// === Nasze dwa endpointy na backendzie ===
const PREVIEW_URL = "https://analiza-danych.onrender.com/api/parse-preview";
const REPORT_URL = "https://analiza-danych.onrender.com/api/generate-report"; // (Tego jeszcze nie użyliśmy)

// === KROK 1: Komponent do wyboru typu zmiennej ===
// To jest mały komponent-pomocnik (rozwijane menu)
function VariableTypeSelector({ columnName, onChange }) {
  return (
    <select onChange={(e) => onChange(columnName, e.target.value)} style={{ width: '100%' }}>
      <option value="pomiń">Pomiń (np. ID, Tekst)</option>
      <option value="ciągła">Ciągła (np. Wiek, Przychód)</option>
      <option value="binarna">Binarna (2 grupy, np. Płeć)</option>
      <option value="nominalna">Kategoryczna (3+ grup, np. Miasto)</option>
    </select>
  );
}

// === KROK 2: Główna aplikacja ===
function App() {
  // --- Stany Aplikacji ---
  const [originalFile, setOriginalFile] = useState(null); // Przechowuje oryginalny plik
  const [previewData, setPreviewData] = useState(null); // Dane do podglądu (kolumny i wiersze)
  const [variableTypes, setVariableTypes] = useState({}); // Przechowuje wybory klienta (np. {"Wiek": "ciągła"})
  
  const [reportHtml, setReportHtml] = useState(""); // Gotowy raport HTML
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Krok 2A: Wgrywanie pliku i pobieranie podglądu ---
  const handleFileChangeAndPreview = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOriginalFile(file);
    setIsLoading(true);
    setError("");
    setPreviewData(null); // Czyścimy stary podgląd
    setReportHtml(""); // Czyścimy stary raport

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Wyślij plik do NOWEGO endpointu /api/parse-preview
      const response = await fetch(PREVIEW_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      setPreviewData(data); // Zapisz dane podglądu (kolumny i wiersze)
      
      // Inicjalizuj stan typów zmiennych (wszystkie domyślnie jako "pomiń")
      const initialTypes = {};
      data.columns.forEach(col => {
        initialTypes[col] = "pomiń";
      });
      setVariableTypes(initialTypes);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja do aktualizowania wyboru klienta
  const handleTypeChange = (columnName, newType) => {
    setVariableTypes(prevTypes => ({
      ...prevTypes,
      [columnName]: newType,
    }));
  };

  // --- Krok 2B: Generowanie właściwego raportu ---
  // (Na razie ta funkcja jest WYŁĄCZONA, dopóki nie naprawimy backendu)
  const handleGenerateReport = async () => {
    alert("Funkcjonalność w trakcie budowy! Musimy najpierw zaktualizować backend, aby przyjmował Twoje typy zmiennych.");
    // W przyszłości ten przycisk zrobi:
    // 1. Weźmie `originalFile` i `variableTypes`
    // 2. Wyśle je oba do `/api/generate-report`
    // 3. Odbierze i wyświetli raport
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1>Automatyczny Generator Raportów Statystycznych 📈</h1>
      <p>Proces generowania raportu składa się z dwóch kroków.</p>

      {/* === SEKCJA KROKU 1: WGRYWANIE PLIKU === */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Krok 1: Wgraj swój plik CSV</h2>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChangeAndPreview} 
        />
        {isLoading && <p style={{ color: 'blue' }}>Wczytywanie podglądu...</p>}
        {error && <p style={{ color: 'red' }}><strong>Błąd:</strong> {error}</p>}
      </div>

      {/* === SEKCJA KROKU 2: WYBÓR TYPÓW ZMIENNYCH === */}
      {previewData && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Krok 2: Zdefiniuj typy swoich zmiennych</h2>
          
          {/* Twoje Ostrzeżenie (Request 4) */}
          <div style={{ padding: '10px', background: '#fff0f0', border: '1px solid red', borderRadius: '5px', margin: '15px 0' }}>
            ⚠️ **Ważna uwaga!** Poprawne wyniki testów statystycznych zależą od poprawnego zdefiniowania typów zmiennych. Błędne zaznaczenie (np. oznaczenie `ID_Działu` jako 'Ciągła') spowoduje wygenerowanie niepoprawnych i bezsensownych analiz.
          </div>

          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '8px' }}>Nazwa Zmiennej (Kolumna)</th>
                <th style={{ padding: '8px', width: '300px' }}>Wybierz Typ Zmiennej</th>
                <th style={{ padding: '8px' }}>Podgląd Danych (pierwsze 5 wierszy)</th>
              </tr>
            </thead>
            <tbody>
              {previewData.columns.map((colName, colIndex) => (
                <tr key={colName}>
                  <td style={{ padding: '8px' }}><strong>{colName}</strong></td>
                  <td style={{ padding: '8px' }}>
                    <VariableTypeSelector columnName={colName} onChange={handleTypeChange} />
                  </td>
                  {/* Pokaż podgląd danych dla tej kolumny */}
                  <td style={{ padding: '8px', fontStyle: 'italic', color: '#555' }}>
                    {previewData.preview_data.map(row => row[colIndex]).slice(0, 5).join(', ')}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Twoje Wskazówki (Request 2) */}
          <div style={{ marginTop: '15px' }}>
            <strong>Wskazówki dotyczące wyboru typu:</strong>
            <ul>
              <li><strong>Ciągła (Ilościowa):</strong> Wybierz, jeśli dane to liczby, dla których można liczyć średnią (np. `Wiek`, `Przychód`, `Wzrost`).</li>
              <li><strong>Binarna (2 grupy):</strong> Wybierz, jeśli dane mają tylko dwie opcje (np. `Płeć` [K/M], `Czy_Aktywny` [Tak/Nie], `0/1`).</li>
              <li><strong>Kategoryczna (3+ grup):</strong> Wybierz, jeśli dane to kategorie bez kolejności (np. `Miasto`, `Kolor`, `ID_Działu`).</li>
              <li><strong>Pomiń (ID / Tekst):</strong> Wybierz dla zmiennych, których nie chcesz analizować (np. `ID_Klienta`, `Opis`, `Email`).</li>
            </ul>
          </div>
          
          <button 
            onClick={handleGenerateReport} 
            style={{ fontSize: '18px', padding: '10px 20px', marginTop: '20px', background: 'green', color: 'white' }}
          >
            Generuj Pełny Raport
          </button>
        </div>
      )}
    </div>
  );
}

export default App;