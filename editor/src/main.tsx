import React from "react";
import ReactDOM from "react-dom/client";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { App } from "./app/App";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={150}>
      <App />
    </TooltipProvider>
  </React.StrictMode>,
);
