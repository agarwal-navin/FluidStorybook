/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MultiDocumentServiceFactory } from "@fluidframework/driver-utils";
import { LocalDocumentServiceFactory, LocalSessionStorageDbFactory } from "@fluidframework/local-driver";
import { RouterliciousDocumentServiceFactory } from "@fluidframework/routerlicious-driver";
import { ILocalDeltaConnectionServer, LocalDeltaConnectionServer } from "@fluidframework/server-local-server";

const localServerList = new Map<string, ILocalDeltaConnectionServer>();

export function getDocumentServiceFactory(documentId: string) {
    const localServer = localServerList.get(documentId) ??
        LocalDeltaConnectionServer.create(new LocalSessionStorageDbFactory(documentId));
        localServerList.set(documentId, localServer);

    return MultiDocumentServiceFactory.create([
        new LocalDocumentServiceFactory(localServer),
        new RouterliciousDocumentServiceFactory(),
    ]);
}
