import type { Wallet } from "@near-wallet-selector/core";
import { providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { env } from "../env/client.mjs";
import { deserialize, serialize } from "./serde";
import { Gas } from "near-units";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Check if current account is considered as an authority in the
 * contract.
 *
 * @param account_id - The account to check for.
 * @param url - The URL of the RPC node to query.
 * @returns
 */
export const useCheckIsAuthority = (account_id: string, url: string) => {
  return useQuery({
    enabled: !!account_id && !!url,
    queryKey: ["is-authority", url, account_id],
    queryFn: async () => {
      const provider = new providers.JsonRpcProvider({ url });

      const { result } = await provider.query<CodeResult>({
        request_type: "call_function",
        account_id: env.NEXT_PUBLIC_CONTRACT_ID,
        method_name: "check_if_authority",
        args_base64: serialize({ account_id }),
        finality: "optimistic",
      });

      return deserialize<boolean>(result);
    },
  });
};

/**
 * Get the trust score for a given source.
 *
 * @param entry_id - The source to check the trust score for.
 * @param url - The URL of the RPC node to query.
 * @returns
 */
export const useGetTrust = (entry_id: string, url: string) => {
  return useQuery({
    enabled: !!entry_id && !!url,
    queryKey: ["get-trust", url, entry_id],
    queryFn: async () => {
      const provider = new providers.JsonRpcProvider({ url });

      const { result } = await provider.query<CodeResult>({
        request_type: "call_function",
        account_id: env.NEXT_PUBLIC_CONTRACT_ID,
        method_name: "get_verification",
        args_base64: serialize({ entry_id }),
        finality: "optimistic",
      });

      return deserialize<number>(result);
    },
  });
};

/**
 * Submit a verification (either trusted or not trusted) for the provided source.
 *
 * @returns
 */
export const useSubmitVerification = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      entry_id,
      trusted,
      signerId,
      wallet,
    }: {
      entry_id: string;
      trusted: boolean;
      signerId: string;
      wallet: Wallet;
    }) =>
      wallet.signAndSendTransaction({
        receiverId: env.NEXT_PUBLIC_CONTRACT_ID,
        signerId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "submit_verification",
              args: { entry_id, trusted },
              gas: Gas.parse("30 Tgas").toBigInt().toString(),
              deposit: "1",
            },
          },
        ],
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["get-trust"] });
    },
  });
};

/**
 * Pin a verification (either trusted or not trusted) for the provided source.
 *
 * @returns
 */
export const usePinVerification = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      entry_id,
      trusted,
      signerId,
      wallet,
    }: {
      entry_id: string;
      trusted: boolean;
      signerId: string;
      wallet: Wallet;
    }) =>
      wallet.signAndSendTransaction({
        receiverId: env.NEXT_PUBLIC_CONTRACT_ID,
        signerId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "submit_verification",
              args: { entry_id, trusted },
              gas: Gas.parse("30 Tgas").toBigInt().toString(),
              deposit: "1",
            },
          },
        ],
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["get-trust"] });
    },
  });
};
