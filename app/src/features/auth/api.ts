import { api } from "@/lib/api";
import type { Account } from "./types";


type GetAccountResponse = {
    account: Account
};

export async function getAccount(): Promise<Account>  {
    const response = await api.get<GetAccountResponse>("/api/account");

    const account = response.data.account; 
    if (!account) {
        throw new Error("Missing account")
    }

    return account; 
};
