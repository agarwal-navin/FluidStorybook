/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IProvideRuntimeFactory, IProxyLoaderFactory } from "@fluidframework/container-definitions";
import { Loader } from '@fluidframework/container-loader';
import { FRSAuthenticationService } from "./frsAuthService";
import { getDocumentServiceFactory } from "./multiDocumentServiceFactory";
import { MultiUrlResolver } from "./multiResolver";
import { StorybookCodeLoader } from './storybookCodeLoader';
import { RouteOptions } from "./types";

export async function getLoader(
    factory: IProvideRuntimeFactory,
    documentId: string,
    options: RouteOptions,
) {
    if (options.mode === "frs") {
        const authService = new FRSAuthenticationService(documentId);
        const { tenantId, authToken } = await authService.getAuthDetails();
        options.tenantId = tenantId;
        options.authToken = authToken;
    }

    const urlResolver = new MultiUrlResolver(window.location.origin, documentId, options);

    const codeLoader = new StorybookCodeLoader(factory);
    const documentServiceFactory = getDocumentServiceFactory(documentId);
    const loader = new Loader(
        urlResolver,
        documentServiceFactory,
        codeLoader,
        { blockUpdateMarkers: true },
        {},
        new Map<string, IProxyLoaderFactory>());

    return { loader, urlResolver };
}
