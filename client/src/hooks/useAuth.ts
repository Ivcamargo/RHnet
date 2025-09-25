import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        // 401 means not authenticated - this is a valid state, not an error
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  // User is authenticated if we have user data
  // User is not authenticated if we get null (401 response)
  // We're loading if the query is still pending
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
