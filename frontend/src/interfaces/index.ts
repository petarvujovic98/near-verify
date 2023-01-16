import type { AccountView } from "near-api-js/lib/providers/provider";

export type Submission = {
  entry_id: string;
  trusted: boolean;
};

export type Account = AccountView & {
  account_id: string;
};
