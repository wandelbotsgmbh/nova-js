"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createNovaMuiTheme,
  LoadingCover,
} from "@wandelbots/wandelbots-js-react-components/core";
import { Suspense, useEffect, useState } from "react";
import { env as runtimeEnv } from "@/runtimeEnv.ts";

const queryClient = new QueryClient();

/**
 * Marks a transition from server to browser rendering.
 * Children will only be rendered once mounted in the browser.
 */
export function ClientLayout({
  env,
  children,
}: Readonly<{
  env: Record<string, string | undefined>;
  children: React.ReactNode;
}>) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    if (!isBrowser) {
      setIsBrowser(true);

      console.log("Runtime ENV from server:\n  ", env);
      Object.assign(runtimeEnv, env);
    }
  }, [isBrowser, env]);

  const theme = createNovaMuiTheme({});

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        {isBrowser ? children : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
