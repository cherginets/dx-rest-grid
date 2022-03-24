import React from "react";
import {DataTypeProvider, DataTypeProviderProps} from "@devexpress/dx-react-grid";

export default function DaysProvider(props: DataTypeProviderProps) {
    return <DataTypeProvider
        formatterComponent={({value}) => <React.Fragment>
          {value ? `${value} дн.` : ''}
        </React.Fragment>}
        {...props}
    />
}
