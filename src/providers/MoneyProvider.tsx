import React from "react";
import {DataTypeProvider, DataTypeProviderProps} from "@devexpress/dx-react-grid";

export default function MoneyProvider(props: DataTypeProviderProps) {
    return <DataTypeProvider
        formatterComponent={({value}) => {
            return <React.Fragment>{value} руб.</React.Fragment>;
        }}
        {...props}
    />
}
