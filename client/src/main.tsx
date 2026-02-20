import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('🚀 RealSourcing Frontend (Pure React + RESTful API)');
console.log('📡 API Proxy: /api → http://47.99.205.136:3001');
console.log('🌍 Environment:', import.meta.env.MODE);

createRoot(document.getElementById("root")!).render(<App />);
