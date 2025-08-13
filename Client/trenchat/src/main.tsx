import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./Context/App.tsx";
import App from "./App.tsx";
import "./Styles/index.css";
import { App as AntdApp } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <AppProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AppProvider>
  </StrictMode>
);