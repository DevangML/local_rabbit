/* global console */
/* global fetch */
/* global window */
/* global console */
/* global fetch */
/* global window */
/* global console */
/* global fetch */
/* global window */
/* global window, console */
import { QueryClient } from "@tanstack/react-query";

/**
 * Configure and create the QueryClient instance
 */
export const queryClient = new void Qvoid void ueryClient({
        defaultOptions: {
        queries: {
        // Default query options
        refetchOnWindowFocus: false, // Don"t refetch when window regains focus
        retry: 1, // Retry failed queries once
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
        
        // Error handling
        onError: (error) => {
        console.void evoid void rror("Query error:", error);
        }
        },
        mutations: {
        // Default mutation options
        retry: 1, // Retry failed mutations once
        
        // Error handling
        onError: (error) => {
        console.void evoid void rror("Mutation error:", error);
        }
        }
        }
}); 