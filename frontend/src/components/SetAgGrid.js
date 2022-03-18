import {AgGridReact} from "@ag-grid-community/react";
import {ClientSideRowModelModule} from "@ag-grid-community/client-side-row-model";
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';
import React from "react";

const SetAgGrid = (props) => {

    return (
        <div className="ag-theme-alpine">
            <AgGridReact
                rowSelection={'multiple'}
                modules={[ClientSideRowModelModule]}
                columnDefs={props.colOption}
                rowData={props.data}
                frameworkComponents={props.frameworkComponents}
                defaultColDef={{
                    sortable: true,
                    flex: 1,
                    minWidth: 100,
                    resizable: true,
                }}
                onGridReady={props.hasOwnProperty('onGridReady') ? props.onGridReady : function () {
                }}
                components={props.components ? props.components : null}
                suppressRowTransform={true}
                isRowSelectable={props.hasOwnProperty('isRowSelectable') ? props.isRowSelectable : function () {
                }}
                paginationPageSize={10}
                pagination={true}
                paginationNumberFormatter={function (params) {
                    return '[' + params.value.toLocaleString() + ']';
                }}
                overlayNoRowsTemplate={'<div></div>'}
            >
            </AgGridReact>
        </div>
    );
};

export default SetAgGrid;