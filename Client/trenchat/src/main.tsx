import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider } from "./Context/App.tsx";
import App from "./App.tsx";
import "./Styles/index.css";
import { App as AntdApp } from "antd";
import { Provider } from "react-redux";
import {store} from "./Redux/store.ts"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AppProvider>
    </Provider>
  </StrictMode>
);