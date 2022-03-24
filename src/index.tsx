import React, { useState } from 'react'
import { PagingState, IntegratedPaging } from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableHeaderRow,
  PagingPanel
} from '@devexpress/dx-react-grid-material-ui'

export type DxRestGridProps<T> = {
  id: string
  fetchAction: (params: { offset: number; limit: number }) => Promise<{
    rows: ReadonlyArray<T>
    total: number
  }>
}

export const DxRestGrid = <T,>({
  id,
  fetchAction
}: DxRestGridProps<T>): JSX.Element => {
  console.log('id', id);
  console.log('fetchAction', fetchAction);
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'gender', title: 'Gender' },
    { name: 'city', title: 'City' },
    { name: 'car', title: 'Car' }
  ])
  const [rows] = useState([{ name: '123' }])

  return (
    <div>
      <Grid rows={rows} columns={columns}>
        <PagingState defaultCurrentPage={0} pageSize={5} />
        <IntegratedPaging />
        <Table />
        <TableHeaderRow />
        <PagingPanel />
      </Grid>
    </div>
  )
}

export default DxRestGrid
