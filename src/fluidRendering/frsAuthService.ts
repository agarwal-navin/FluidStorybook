/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import axios from "axios";
import { v4 as uuid } from "uuid";
import { getRandomName } from "@fluidframework/server-services-client";

export function generateUser() {
    const randomUser = {
        id: uuid(),
        name: getRandomName(" ", true),
    };

    return randomUser;
}

interface IAuthDetails {
    tenantId: string;
    authToken: string;
}

export class FRSAuthenticationService {
    private authDetails: IAuthDetails | undefined;
    constructor(
        private readonly documentId: string,
        private readonly user: any = generateUser(),
    ) {}

    public async getAuthDetails(): Promise<IAuthDetails> {
        if (this.authDetails === undefined) {
            const tokenServer = "https://authfluidwindows.azurewebsites.net/api/FRSToken";
            const requestConfig = {
                params: { documentId: this.documentId, user: JSON.stringify(this.user) },
            };
            const response = await axios.get(tokenServer, requestConfig);
            if (response.status !== 200) {
                throw new Error("Could not fetch token from server");
            }
            this.authDetails = {
                tenantId: response.data.tenantId,
                authToken: response.data.token,
            };
        }

        return this.authDetails;
    }
}
