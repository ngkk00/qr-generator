import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

function App() {
  const [text, setText] = useState("https://example.com");

  const downloadQR = () => {
    const canvas = document.getElementById("qr-gen");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qr-code.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="container">
      <h1>Free QR Code Generator</h1>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text or URL"
        className="input-box"
      />

      <div className="qr-box">
        <QRCodeCanvas id="qr-gen" value={text} size={200} />
      </div>

      <button className="download-btn" onClick={downloadQR}>
        📥 Download QR Code
      </button>

      <footer>
        <p>
          ⚠️ Disclaimer: Do not generate QR codes for sensitive or confidential
          data.
        </p>
      </footer>
    </div>
  );
}

export default App;
