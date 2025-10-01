import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { FaCamera, FaFolderOpen, FaCopy, FaDownload } from "react-icons/fa";

function App() {
  const [mode, setMode] = useState("generate"); // "generate" or "read"
  const [text, setText] = useState("https://example.com");
  const [src, setSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const scannerRef = useRef(null);

  // Generate QR Code
  useEffect(() => {
    if (mode === "generate") {
      QRCode.toDataURL(text, { width: 200 }).then(setSrc).catch(console.error);
    }
  }, [text, mode]);
  useEffect(() => {
    // If user switches mode away from 'read', stop camera
    if (mode !== "read" && scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        scannerRef.current = null;
      }).catch((err) => console.error("Failed to stop camera:", err));
    }
  }, [mode]);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop camera:", err);
      }
    }
  };


  // Copy QR as image
  const handleCopyImage = async () => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy image: ", err);
    }
  };

  // Start camera scan
  const startScanner = async () => {
    await stopCamera(); // stop any existing camera

    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCode.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            setScanResult(decodedText);
            stopCamera(); // stop after successful scan
          },
          (errorMessage) => console.warn(errorMessage)
        );
      } else {
        alert("No camera found.");
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable.");
    }
  };


  // Handle file upload
  const handleFile = async (e) => {
    await stopCamera(); // turn off camera if it’s on

    if (!e.target.files.length) return;
    const file = e.target.files[0];
    const { Html5Qrcode } = await import("html5-qrcode");
    const qrCode = new Html5Qrcode("upload-reader");
    try {
      const result = await qrCode.scanFile(file, true);
      setScanResult(result);
    } catch (err) {
      console.error("File scan failed:", err);
      alert("No QR code found in this image.");
    }
  };


  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>QR Code Tool</h1>

      {/* Mode Selector */}
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setMode("generate")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            borderRadius: "8px",
            background: mode === "generate" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Generate QR
        </button>
        <button
          onClick={() => setMode("read")}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: mode === "read" ? "#007bff" : "#ccc",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Read QR
        </button>
      </div>

      {/* Generate QR Mode */}
      {mode === "generate" && (
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              width: "300px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
          <div style={{ marginTop: "20px" }}>
            {src && (
              <>
                <img
                  src={src}
                  alt="QR Code"
                  style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                />
                <div style={{ marginTop: "10px" }}>
                  <button
                    onClick={handleCopyImage}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#28a745",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    <FaCopy style={{ marginRight: "8px" }} /> Copy QR Code
                  </button>

                  <button
                    onClick={() => {
                      // Generate safe filename
                      let safeName = text
                        .trim()
                        .replace(/[^a-z0-9]/gi, "_") // replace unsafe chars with _
                        .slice(0, 20); // limit length
                      if (!safeName) safeName = "qr_code";

                      const link = document.createElement("a");
                      link.href = src;
                      link.download = `${safeName}_qr.png`;
                      link.click();
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      background: "#17a2b8",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                  >
                    <FaDownload style={{ marginRight: "8px" }} /> Download QR Code
                  </button>

                  {copied && <p style={{ color: "green", marginTop: "10px" }}>Image copied! Paste it anywhere 🚀</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Read QR Mode */}
      {mode === "read" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={startScanner}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              <FaCamera style={{ marginRight: "8px" }} /> Scan with Camera
            </button>
            <label
              onClick={stopCamera} // Stop camera immediately
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                background: "#6c757d",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <FaFolderOpen style={{ marginRight: "8px" }} /> Upload QR Image
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
          </div>

          <div id="reader" style={{ width: "300px", margin: "auto", border: "1px solid #ccc" }}></div>
          <div id="upload-reader"></div>

          {scanResult && (
            <p style={{ marginTop: "20px", fontSize: "18px" }}>
              ✅ QR Code Content:{" "}
              {/^https?:\/\//i.test(scanResult) ? (
                <a href={scanResult} target="_blank" rel="noopener noreferrer">
                  {scanResult}
                </a>
              ) : (
                <strong>{scanResult}</strong>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
