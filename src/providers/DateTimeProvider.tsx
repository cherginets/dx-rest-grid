import React from "react";
import moment from "moment";
import {DataTypeProvider, DataTypeProviderProps} from "@devexpress/dx-react-grid";

export default function DateTimeProvider(props: DataTypeProviderProps) {
  return <DataTypeProvider
      formatterComponent={({value}) => {
          return <React.Fragment>{moment(value).format('YYYY-MM-DD hh:mm')}</React.Fragment>;
      }}
      {...props}
  />
}
