/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import React from "react";
import ReactDOM from "react-dom";
import { IFluidObject } from "@fluidframework/core-interfaces";
import { HTMLViewAdapter } from "@fluidframework/view-adapters";
import { FluidLoaderProps } from "./fluidLoader";

export async function renderFluidDataObjects(
    props: FluidLoaderProps,
    documentId: string,
    dataObject1: IFluidObject,
    dataObject2?: IFluidObject,
) {
    return new Promise(async (resolve, reject) => {
        // Create container div that Fluid object will be rendered into for server demos
        return await renderFluidObjectsDivs(resolve, props, documentId, dataObject1, dataObject2);
    });
    
}

async function renderFluidObjectsDivs(
    resolve: any,
    props: FluidLoaderProps,
    documentId: string,
    dataObject1: IFluidObject,
    dataObject2?: IFluidObject,
) {
    const singleDiv = dataObject2 === undefined;
    // Use horizonal layout by default
    const divs = getDivs(props.layout ?? "horizontal", documentId, props.mode, singleDiv);

    if (props.view) {
        // Convert props value to enum to ensure they pass allowed value
        switch (props.viewType) {
            case 'js':
                return createDomView(props, dataObject1, dataObject2, divs, resolve);
            case 'react':
                return createReactView(props, dataObject1, dataObject2, divs, resolve);
        }
    }
    else {
        // Fluid object has it's own render() function
        await renderFluidObject(dataObject1, divs.div1 as HTMLDivElement);
        if (!singleDiv) {
            await renderFluidObject(dataObject2, divs.div2 as HTMLDivElement);
        }
        return resolve(divs.containerDiv);
    }
}

async function createDomView(
    props: FluidLoaderProps,
    dataObject1: IFluidObject,
    dataObject2: IFluidObject,
    divs: any,
    resolve: any,
) {
    // Create side by side view of Fluid object for local demos
    let leftFluidObject = new props.view(dataObject1, divs.div1);
    leftFluidObject.render();
    if (divs.div2 !== undefined && dataObject2 !== undefined) {
        let rightFluidObject = new props.view(dataObject2, divs.div2);
        rightFluidObject.render();
    }
    return resolve(divs.containerDiv);
}

async function createReactView(props: FluidLoaderProps,
    dataObject1: IFluidObject,
    dataObject2: IFluidObject,
    divs: any,
    resolve: any,
) {
    ReactDOM.render(<props.view model={dataObject1} {...props} />, divs.div1);
    if (divs.div2 !== undefined && dataObject2 !== undefined) {
        ReactDOM.render(<props.view model={dataObject2} {...props} />, divs.div2);
    }
    return resolve(divs.containerDiv);
}

async function renderFluidObject(dataObject: IFluidObject, div: HTMLDivElement) {
    // We should be retaining a reference to mountableView long-term, so we can call unmount() on it to correctly
    // remove it from the DOM if needed.
    // SamsNotes: Typically I'd rather this get moved into HTMLViewAdapter, create something like UMD
    // https://github.com/umdjs/umd
    if (dataObject.IFluidMountableView) {
        dataObject.IFluidMountableView.mount(div);
        return;
    }

    const view = new HTMLViewAdapter(dataObject);
    view.render(div, { display: "block" });
}

export function getDivs(layout: string, documentId: string, mode: string, singleDiv: boolean) {
    const containerDiv = document.createElement('div');
    const div1Container = makeBrowserShellDiv("sbs-left", layout, documentId, mode);
    const div1 = div1Container.querySelector(".browser .body");
    containerDiv.append(div1Container);

    let div2: Element;
    if (!singleDiv) {
        const div2Container = makeBrowserShellDiv("sbs-right", layout, documentId, mode);
        div2 = div2Container.querySelector(".browser .body");
        if (layout === 'vertical') {
            const br = document.createElement('br');
            containerDiv.append(br, div2Container);
            
        }
        else {
            containerDiv.style.display = "flex";
            containerDiv.append(div2Container);
        }
    }

    return { div1, div2, containerDiv };
}

function makeBrowserShellDiv(divId: string, layout: string, documentId: string, mode: string) {
    const isWindows = navigator.platform.indexOf('Win') > -1;
    const macControls = (isWindows) ? 'none': 'inline-block';
    const windowsControls = (isWindows) ? 'inline-block': 'none';

    const searchParams = new URLSearchParams(window.location.search);
    const storyId = searchParams.get("id");
    const shareUrl = `iframe.html?id=${storyId}&documentId=${documentId}`;
    const shareUrlDisplayModeMac = mode === "frs" && !isWindows ? 'inline-block': 'none';
    const shareUrlDisplayModeWin = mode === "frs" && isWindows ? 'inline-block': 'none';

    const html = `
    <div class="window browser">
        <div class="header">
            <span class="bullets mac" style="display:${macControls}">
                <span class="bullet bullet-red"></span>
                <span class="bullet bullet-yellow"></span>
                <span class="bullet bullet-green"></span>
            </span>
            <a href=${shareUrl} target="_blank" title="Open in new tab" class="windows-share-button" style="display:${shareUrlDisplayModeWin}">
                <svg viewBox="0 0 1024 1024"><path d="M896.006 920c0 22.090-17.91 40-40 40h-688.006c-22.090 0-40-17.906-40-40v-549.922c-0.838-3.224-1.33-6.588-1.33-10.072 0-22.090 17.908-40.004 40-40.004h178.66c22.092 0.004 40 17.914 40 40.004 0 22.088-17.908 40-40 40h-137.33v479.996h607.998v-479.996h-138.658c-22.090 0-40-17.912-40-40 0-22.090 17.906-40.004 40-40.004h178.658c22.090 0 40 17.91 40 40v559.844c0 0.050 0.008 0.102 0.008 0.154zM665.622 200.168l-124.452-124.45c-8.042-8.042-18.65-11.912-29.186-11.674-1.612-0.034-3.222 0-4.828 0.16-0.558 0.054-1.098 0.16-1.648 0.238-0.742 0.104-1.484 0.192-2.218 0.338-0.656 0.13-1.29 0.31-1.934 0.472-0.622 0.154-1.244 0.292-1.86 0.476-0.64 0.196-1.258 0.436-1.886 0.66-0.602 0.216-1.208 0.414-1.802 0.66-0.598 0.248-1.17 0.54-1.754 0.814-0.598 0.282-1.202 0.546-1.788 0.86-0.578 0.312-1.13 0.664-1.694 1-0.552 0.332-1.116 0.644-1.654 1.006-0.67 0.448-1.3 0.942-1.942 1.426-0.394 0.302-0.806 0.576-1.196 0.894-1.046 0.858-2.052 1.768-3.008 2.726l-124.398 124.39c-15.622 15.62-15.618 40.948 0.002 56.57 15.622 15.62 40.95 15.62 56.568 0l56.164-56.166v439.426c0 22.094 17.912 40 40.002 40 22.092 0 40-17.91 40-40v-441.202l57.942 57.942c15.622 15.624 40.948 15.62 56.568 0 15.626-15.618 15.626-40.946 0.002-56.566z"></path></svg>
            </a>
            <span class="title">
                <span class="scheme">https://</span>your-fluid-app.com
            </span>
            <a href=${shareUrl} target="_blank" title="Open in new tab" class="mac-share-button" style="display:${shareUrlDisplayModeMac}">
                <svg viewBox="0 0 1024 1024"><path d="M896.006 920c0 22.090-17.91 40-40 40h-688.006c-22.090 0-40-17.906-40-40v-549.922c-0.838-3.224-1.33-6.588-1.33-10.072 0-22.090 17.908-40.004 40-40.004h178.66c22.092 0.004 40 17.914 40 40.004 0 22.088-17.908 40-40 40h-137.33v479.996h607.998v-479.996h-138.658c-22.090 0-40-17.912-40-40 0-22.090 17.906-40.004 40-40.004h178.658c22.090 0 40 17.91 40 40v559.844c0 0.050 0.008 0.102 0.008 0.154zM665.622 200.168l-124.452-124.45c-8.042-8.042-18.65-11.912-29.186-11.674-1.612-0.034-3.222 0-4.828 0.16-0.558 0.054-1.098 0.16-1.648 0.238-0.742 0.104-1.484 0.192-2.218 0.338-0.656 0.13-1.29 0.31-1.934 0.472-0.622 0.154-1.244 0.292-1.86 0.476-0.64 0.196-1.258 0.436-1.886 0.66-0.602 0.216-1.208 0.414-1.802 0.66-0.598 0.248-1.17 0.54-1.754 0.814-0.598 0.282-1.202 0.546-1.788 0.86-0.578 0.312-1.13 0.664-1.694 1-0.552 0.332-1.116 0.644-1.654 1.006-0.67 0.448-1.3 0.942-1.942 1.426-0.394 0.302-0.806 0.576-1.196 0.894-1.046 0.858-2.052 1.768-3.008 2.726l-124.398 124.39c-15.622 15.62-15.618 40.948 0.002 56.57 15.622 15.62 40.95 15.62 56.568 0l56.164-56.166v439.426c0 22.094 17.912 40 40.002 40 22.092 0 40-17.91 40-40v-441.202l57.942 57.942c15.622 15.624 40.948 15.62 56.568 0 15.626-15.618 15.626-40.946 0.002-56.566z"></path></svg>
            </a>
            <span class="windows" style="display:${windowsControls}">
                <span class="windows-icon"><div class="windows-min-icon"></div></span>
                <span class="windows-icon"><div class="windows-max-icon"></div></span>
                <span class="windows-icon windows-close-icon">x</span>
            </span>
        </div>
        <div class="body">
            
        </div>
    </div> 
    `;
    const div = document.createElement("div");
    div.innerHTML = html;
    div.id = divId;
    if (layout !== 'vertical') {
        div.classList.add('flex');
    }
    return div;
}