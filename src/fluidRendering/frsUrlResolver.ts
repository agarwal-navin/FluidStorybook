/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { parse } from "url";
import { IRequest } from "@fluidframework/core-interfaces";
import { CreateNewHeader, IFluidResolvedUrl, IUrlResolver, IResolvedUrl } from "@fluidframework/driver-definitions";

export class FRSUrlResolver implements IUrlResolver {
    constructor(
        private readonly hostUrl: string,
        private readonly tenantId: string,
        private readonly frsAccessToken: string,
    ) { }

    public async resolve(request: IRequest): Promise<IResolvedUrl> {
        const url = new URL(request.url);
        const fullPath = url.pathname.substr(1);
        const documentId = fullPath.split("/")[0];

        return {
            endpoints: {
                storageUrl: `https://historian.${this.hostUrl}/repos/${this.tenantId}`,
                deltaStorageUrl: `https://alfred.${this.hostUrl}/deltas/${this.tenantId}/${documentId}`,
                ordererUrl: `https://alfred.${this.hostUrl}`,
            },
            tokens: { jwt: this.frsAccessToken },
            type: "fluid",
            url: `fluid://alfred.${this.hostUrl}/${this.tenantId}/${fullPath}`,
        };
    }

    public async getAbsoluteUrl(resolvedUrl: IResolvedUrl, relativeUrl: string): Promise<string> {
        const fluidResolvedUrl = resolvedUrl as IFluidResolvedUrl;

        const parsedUrl = parse(fluidResolvedUrl.url);
        const [, , documentId] = parsedUrl.pathname?.split("/");
        if (documentId === undefined) {
            throw new Error("Document id should be available");
        }

        let url = relativeUrl;
        if (url.startsWith("/")) {
            url = url.substr(1);
        }

        return `https://alfred.${this.hostUrl}/${this.tenantId}/${documentId}/${url}`;
    }

    public createCreateNewRequest(fileName: string): IRequest {
        const createNewRequest: IRequest = {
            url: `https://alfred.${this.hostUrl}/${fileName}`,
            headers: {
                [CreateNewHeader.createNew]: true,
            },
        };
        return createNewRequest;
    }
}
