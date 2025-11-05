import React, { useState } from 'react';

// === TO JEST ADRES TWOJEGO BACKENDU ===
// Upewnij się, że jest poprawny!
const RENDER_API_URL = "https://analiza-danych.onrender.com/api/test";
// ======================================

function App() {
  const [message, setMessage] = useState("Czekam na test...");

  const testConnection = () => {
    setMessage("Wysyłam żądanie... (to może potrwać do 50 sekund, jeśli serwer śpi)");
    
    fetch(RENDER_API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Błąd HTTP! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Jeśli się uda, wyświetli komunikat z backendu
        setMessage(`✅ SUKCES! Odpowiedź: ${data.message}`);
      })
      .catch(error => {
        // Jeśli się nie uda, wyświetli błąd
        console.error("Błąd połączenia:", error);
        setMessage(`❌ BŁĄD! Sprawdź konsolę (F12). Prawdopodobnie błąd CORS lub zły URL.`);
      });
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Test Dymny Architektury (Frontend)</h1>
      <button 
        onClick={testConnection} 
        style={{ fontSize: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Kliknij, aby przetestować połączenie z Backendem
      </button>
      
      <h2 style={{ marginTop: '40px' }}>Status połączenia:</h2>
      <p style={{ fontSize: '18px', color: 'blue' }}>
        {message}
      </p>
    </div>
  );
}

export default App;