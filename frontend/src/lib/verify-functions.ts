import { Wallet } from "@near-wallet-selector/core";
import { providers } from "near-api-js";
import { CodeResult } from "near-api-js/lib/providers/provider";
import { env } from "../env/client.mjs";
import { deserialize, serialize } from "./serde";
import { Gas } from "near-units";

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
    console.error(`Failed to submit the verification with error: ${error}`);
  }
};
