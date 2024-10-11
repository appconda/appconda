import { createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { routeTree } from "./routeTree.gen.ts";
import "./styles/tailwind.css";
import './common/i18n'
import { createTheme, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		// This infers the type of our router and registers it across your entire project
		router: typeof router;
	}
}

const theme = createTheme({
	/** Put your mantine theme override here */
  });
  
const rootElement = document.querySelector("#root") as Element;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<React.StrictMode>
			<MantineProvider theme={theme}>
				<React.Suspense fallback="loading">
					<App router={router} />
				</React.Suspense>
			</MantineProvider>
		</React.StrictMode>
	);
}
