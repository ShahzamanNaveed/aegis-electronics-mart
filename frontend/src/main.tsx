import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import "./styles.css";
import "./catalog/catalog.css";
import { MartProvider } from "./catalog/state";
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false },
  },
});
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <MartProvider>
          <Layout />
        </MartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
