/**
 * Frontend Application Entry Point
 * 
 * Mounts the main React application element (<App />) to the DOM root.
 * Also imports the global styles (index.css) including Tailwind directives.
 */
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
