import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppconda} from "../../context/Appconda";
import { ID } from "@appconda/web-sdk";
import { Models } from '../../models'


/**
 * Hook to create a new account.
 * 
 * This hook allows you to create a new account using the Appconda SDK. 
 * It invalidates the 'account' query to refetch the updated data after a successful account creation.
 * @returns An object containing the `createAccount` function, as well as the mutation state.
 */
export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    const sdk = useAppconda();

    const mutation = useMutation({
        mutationFn: ({ name, email, password }: { name: string, email: string, password: string }) => {

            return sdk.account.create(ID.unique(), email, password, name)
        },
        onSuccess: <Preferences extends Models.Preferences>(data: Models.User<Preferences>) => {
            // Invalidate and refetch

            queryClient.invalidateQueries({ queryKey: ['account'] });
        }
    })

    const createAccount = (
        { name, email, password, organizationId }: {
            /**
             * The name of the account.
             */
            name: string,
            /**
             * The email address of the account.
             */
            email: string,
            /**
             * The password of the account.
             */
            password: string,
            organizationId?: string
        },
        onSuccess: <Preferences extends Models.Preferences>(data: Models.User<Preferences>) => void = void 0
    ) => {
        mutation.mutate({ name, email, password },
            {
                onSuccess: (data) => {
                    onSuccess(data);
                }
            });
    }
    return {
        createAccount,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error as { message: string }
    }
}