/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IUser } from "@fluidframework/protocol-definitions";

export interface ILocalRouteOptions {
    mode: "local";
}

export interface IFRSRouteOptions {
    mode: "frs";
    tenantId?: string;
    authToken?: string;
}

export type RouteOptions =
    | ILocalRouteOptions
    | IFRSRouteOptions;

export interface IDevServerUser extends IUser {
    name: string;
}
