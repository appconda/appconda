import { Account, Client } from "@appconda/web-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { createContext, useContext } from "react";

export const query = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: false
        }
    },
});

const AppcondaContext = createContext<any>(null);

export interface IAppcondaSdk {
    account: Account;
}
export function AppcondaProvider({ endPoint, project, children }) {
    const client = new Client().setEndpoint(endPoint).setProject(project)
    const sdk = {
        account: new Account(client)
    }
    return (
        <QueryClientProvider client={query}>
            <AppcondaContext.Provider value={sdk}>
                {children}
            </AppcondaContext.Provider>
        </QueryClientProvider>
    );

}

export function useAppcondaSdk(): IAppcondaSdk {
    return useContext(AppcondaContext);
}
