import {api} from "@/lib/api";
import type { Account } from "./types";


type GetAccountResponse = {
    account: Account
};

export async function getAccount (idToken: string): Promise<Account>  {
    const response = await api.get<GetAccountResponse>("/api/me/account", {
        headers: { Authorization: `Bearer ${idToken}`},
    });

    const account = response.data.account; 
    if (!account) {
        throw new Error("Missing account")
    }

    return account; 
};
