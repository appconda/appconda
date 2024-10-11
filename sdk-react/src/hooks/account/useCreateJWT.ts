import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppconda } from "../../context/Appconda";
import { Models } from "../../models";


export const useCreateJWT = (projectId: string) => {
    const queryClient = useQueryClient();
    const sdk = useAppconda();
    
    const mutation = useMutation({
        mutationFn: () => {
            return sdk.account.createJWT();
        },
        onSuccess: (data: Models.Jwt) => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['account'] });
        }
    })

    const createJWT = (
        onSuccess: (data: Models.Jwt) => void = void 0
    ) => {
        mutation.mutate(null,
            {
                onSuccess: (data) => {
                    onSuccess(data);
                }
            });
    }
    return {
        createJWT,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}