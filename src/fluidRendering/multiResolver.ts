/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// eslint-disable-next-line import/no-internal-modules
import { IRequest } from "@fluidframework/core-interfaces";
import { IResolvedUrl, IUrlResolver } from "@fluidframework/driver-definitions";
import { LocalResolver } from "@fluidframework/local-driver";
import { FRSUrlResolver } from "./frsUrlResolver";
import { RouteOptions } from "./types";

interface IMultiUrlResolver extends IUrlResolver {
    createCreateNewRequest(fileName: string): IRequest;
}

function getUrlResolver(options: RouteOptions): IMultiUrlResolver {
    switch (options.mode) {
        case "frs":
            return new FRSUrlResolver("frs.office-int.com", options.tenantId, options.authToken);

        default: // Local
            return new LocalResolver();
    }
}

export class MultiUrlResolver implements IUrlResolver {
    private readonly urlResolver: IMultiUrlResolver;
    constructor(
        private readonly rawUrl: string,
        private readonly documentId: string,
        options: RouteOptions) {
        this.urlResolver = getUrlResolver(options);
    }

    async getAbsoluteUrl(resolvedUrl: IResolvedUrl, relativeUrl: string): Promise<string> {
        let url = relativeUrl;
        if (url.startsWith("/")) {
            url = url.substr(1);
        }
        return `${this.rawUrl}/${this.documentId}/${url}`;
    }

    async resolve(request: IRequest): Promise<IResolvedUrl | undefined> {
        return this.urlResolver.resolve(request);
    }

    public async createRequestForCreateNew(
        fileName: string,
    ): Promise<IRequest> {
        return this.urlResolver.createCreateNewRequest(fileName);
    }
}