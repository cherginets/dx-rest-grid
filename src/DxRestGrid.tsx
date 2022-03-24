import React, { useCallback, useEffect, useState } from 'react'
import {
  PagingState,
  IntegratedPaging, Column
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table,
  TableHeaderRow,
  PagingPanel
} from '@devexpress/dx-react-grid-material-ui'

export type DxRestGridProps<T> = {
  id: string
  columns: Array<Column>
  fetchAction: (params: { offset: number; limit: number }) => Promise<{
    rows: ReadonlyArray<T>
    total: number
  }>
}

function DxRestGrid<Row extends { id: number }>(
  { id, columns, fetchAction }: DxRestGridProps<Row>
) {

  console.log('id', id);

  // region Pagination
  const [total, setTotal] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [limit, setLimit] = useState<number>(2)
  const [pageSizes] = useState<number[]>([2, 10, 50, 100, 500])

  console.log('total', total)
  console.log('setOffset', setOffset)
  console.log('setLimit', setLimit)
  console.log('pageSizes', pageSizes)
  // endregion

  // region Data and fetching
  const [rows, setRows] = useState<Row[]>([])

  const fetch = useCallback(() => {
    fetchAction({ offset, limit }).then((response) => {
      setTotal(response.total)
      setRows([...response.rows])
    })
  }, [fetchAction, offset, limit])

  useEffect(() => {
    fetch()
  }, [fetch])
  // endregion

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
