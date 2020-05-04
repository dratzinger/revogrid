/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "./stencil-public-runtime";
export namespace Components {
    interface RevoGrid {
        "columns": ColumnData;
        "dimensions": Partial<MultiDimensionAction>;
        "settings": InputSettings;
        "source": DataType[];
    }
    interface RevogrData {
    }
    interface RevogrHeader {
    }
    interface RevogrViewportScrollable {
        "scrollX": (x?: number) => Promise<void>;
        "scrollY": (y?: number) => Promise<void>;
    }
}
declare global {
    interface HTMLRevoGridElement extends Components.RevoGrid, HTMLStencilElement {
    }
    var HTMLRevoGridElement: {
        prototype: HTMLRevoGridElement;
        new (): HTMLRevoGridElement;
    };
    interface HTMLRevogrDataElement extends Components.RevogrData, HTMLStencilElement {
    }
    var HTMLRevogrDataElement: {
        prototype: HTMLRevogrDataElement;
        new (): HTMLRevogrDataElement;
    };
    interface HTMLRevogrHeaderElement extends Components.RevogrHeader, HTMLStencilElement {
    }
    var HTMLRevogrHeaderElement: {
        prototype: HTMLRevogrHeaderElement;
        new (): HTMLRevogrHeaderElement;
    };
    interface HTMLRevogrViewportScrollableElement extends Components.RevogrViewportScrollable, HTMLStencilElement {
    }
    var HTMLRevogrViewportScrollableElement: {
        prototype: HTMLRevogrViewportScrollableElement;
        new (): HTMLRevogrViewportScrollableElement;
    };
    interface HTMLElementTagNameMap {
        "revo-grid": HTMLRevoGridElement;
        "revogr-data": HTMLRevogrDataElement;
        "revogr-header": HTMLRevogrHeaderElement;
        "revogr-viewport-scrollable": HTMLRevogrViewportScrollableElement;
    }
}
declare namespace LocalJSX {
    interface RevoGrid {
        "columns"?: ColumnData;
        "dimensions"?: Partial<MultiDimensionAction>;
        "settings"?: InputSettings;
        "source"?: DataType[];
    }
    interface RevogrData {
    }
    interface RevogrHeader {
    }
    interface RevogrViewportScrollable {
    }
    interface IntrinsicElements {
        "revo-grid": RevoGrid;
        "revogr-data": RevogrData;
        "revogr-header": RevogrHeader;
        "revogr-viewport-scrollable": RevogrViewportScrollable;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "revo-grid": LocalJSX.RevoGrid & JSXBase.HTMLAttributes<HTMLRevoGridElement>;
            "revogr-data": LocalJSX.RevogrData & JSXBase.HTMLAttributes<HTMLRevogrDataElement>;
            "revogr-header": LocalJSX.RevogrHeader & JSXBase.HTMLAttributes<HTMLRevogrHeaderElement>;
            "revogr-viewport-scrollable": LocalJSX.RevogrViewportScrollable & JSXBase.HTMLAttributes<HTMLRevogrViewportScrollableElement>;
        }
    }
}
