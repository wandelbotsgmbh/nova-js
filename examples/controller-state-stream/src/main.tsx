import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createNovaMuiTheme } from "@wandelbots/wandelbots-js-react-components/core"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import "./global.css"

const queryClient = new QueryClient()
const theme = createNovaMuiTheme({})

const rootEl = document.getElementById("root")
if (!rootEl) throw new Error("Missing #root element")

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
