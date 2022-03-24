import React from 'react'
import { DataTypeProvider, DataTypeProviderProps } from '@devexpress/dx-react-grid'

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'RUB',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export default function MoneyProvider(props: DataTypeProviderProps) {
    return <DataTypeProvider
      formatterComponent={({ value }) => {
        if (value !== 0 && !value) return <React.Fragment>-</React.Fragment>
        return <React.Fragment>{formatter.format(value).replace(/[a-z]{3}/i, '').trim()} руб.</React.Fragment>
      }}
        {...props}
    />
}
