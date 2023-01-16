import type { Wallet } from "@near-wallet-selector/core";
import { providers } from "near-api-js";
import type { CodeResult } from "near-api-js/lib/providers/provider";
import { env } from "../env/client.mjs";
import { deserialize, serialize } from "./serde";
import { Gas } from "near-units";

/**
 * Check if current account is considered as an authority in the
 * contract.
 *
 * @param account_id - The account to check for.
 * @param url - The URL of the RPC node to query.
 * @returns
 */
export const checkIsAuthority = async (
  account_id: string,
  url: string
): Promise<boolean> => {
  const provider = new providers.JsonRpcProvider({ url });

  const { result } = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: env.NEXT_PUBLIC_CONTRACT_ID,
    method_name: "check_if_authority",
    args_base64: serialize({ account_id }),
    finality: "optimistic",
  });

  return deserialize<boolean>(result);
};

/**
 * Get the trust score for a given source.
 *
 * @param entry_id - The source to check the trust score for.
 * @param url - The URL of the RPC node to query.
 * @returns
 */
export const getTrust = async (
  entry_id: string,
  url: string
): Promise<number> => {
  const provider = new providers.JsonRpcProvider({ url });

  const { result } = await provider.query<CodeResult>({
    request_type: "call_function",
    account_id: env.NEXT_PUBLIC_CONTRACT_ID,
    method_name: "get_verification",
    args_base64: serialize({ entry_id }),
    finality: "optimistic",
  });

  return deserialize<number>(result);
};

/**
 * Submit a verification (either trusted or not trusted) for the provided source.
 *
 * @param entry_id - The source to submit a verification for.
 * @param trusted - The trusted value.
 * @param signerId - The signer of the transaction.
 * @param wallet - The wallet to use to sign and send the transaction.
 * @returns
 */
export const submitVerification = async (
  entry_id: string,
  trusted: boolean,
  signerId: string,
  wallet: Wallet
): Promise<void> => {
  try {
    await wallet.signAndSendTransaction({
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
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to submit the verification with error: ${error}`);
  }
};

/**
 * Pin a verification (either trusted or not trusted) for the provided source.
 *
 * @param entry_id - The source to pin a verification for.
 * @param trusted - The trusted value.
 * @param signerId - The signer of the transaction.
 * @param wallet - The wallet to use to sign and send the transaction.
 * @returns
 */
export const pinVerification = async (
  entry_id: string,
  trusted: boolean,
  signerId: string,
  wallet: Wallet
): Promise<void> => {
  try {
    await wallet.signAndSendTransaction({
      receiverId: env.NEXT_PUBLIC_CONTRACT_ID,
      signerId,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: "pin_verification",
            args: { entry_id, trusted },
            gas: Gas.parse("30 Tgas").toBigInt().toString(),
            deposit: "1",
          },
        },
      ],
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to pin the verification with error: ${error}`);
  }
};
