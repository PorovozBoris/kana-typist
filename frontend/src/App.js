import { useEffect } from "react";
import "@/App.css";

function App() {
  useEffect(() => {
    // The deliverable is a single standalone HTML file (vanilla JS, no frameworks).
    // We redirect the React preview to it so the app is viewable in the hosted env.
    window.location.replace("/typing.html");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, serif",
        color: "#4a4a4a",
        background: "#f5f4f0",
      }}
      data-testid="redirect-screen"
    >
      <p>Loading Kana Typist…</p>
    </div>
  );
}

export default App;
