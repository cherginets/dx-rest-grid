import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Column,
  CustomPaging,
  DataTypeProvider,
  DataTypeProviderProps,
  IntegratedPaging,
  PagingState, TableColumnVisibility
} from '@devexpress/dx-react-grid'
import { Plugin } from '@devexpress/dx-react-core'
import { Grid, Table, TableHeaderRow, PagingPanel, ColumnChooser, Toolbar } from '@devexpress/dx-react-grid-material-ui'

export type DxRestGridProviderType = React.ComponentType<DataTypeProviderProps>;
export type DxRestGridColumn = Column & {
  provider?: DxRestGridProviderType // todo to detail
}

export type ProvidersProp = {
  for: string[],
  formatterComponent?: React.ComponentType<DataTypeProvider.ValueFormatterProps>
  ProviderComponent?: React.ComponentType<DataTypeProviderProps>
  // todo разделить
}

interface DxRestGridProps<T> {
  id: string
  columns: Array<DxRestGridColumn>
  fetchAction: (params: { offset: number; limit: number }) => Promise<{
    rows: ReadonlyArray<T>
    total: number
  }>;

  providers?: ProvidersProp[]
}

function DxRestGrid<Row>(
  { id, columns: _columns, fetchAction, providers }: DxRestGridProps<Row>
) {
  const { columns } = useMemo<{
    columns: Array<Column>
  }>(() => {
    const columns: Array<Column> = []
    _columns.forEach(({ name, title, provider }) => {
      columns.push({ name, title })
      // providers.push([name, provider])
    })
    return { columns }
  }, [_columns])

  // region Pagination
  const [total, setTotal] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [limit, setLimit] = useState<number>(2)
  const [pageSizes] = useState<number[]>([2, 10, 50, 100, 500])
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
        {/* region Data Type Providers */}
        {!!providers && <Plugin>
          {providers.map(({ ProviderComponent, formatterComponent, ...provider }, i: number) => {
            if(ProviderComponent) return <ProviderComponent key={i} for={provider.for} />;
            else return <DataTypeProvider key={i} for={provider.for} formatterComponent={formatterComponent} />
          })}
        </Plugin>}
        {/* endregion */}

        {/* region Pagination */}
        <PagingState
          currentPage={offset / limit}
          onCurrentPageChange={(current) => setOffset(current * limit)}
          pageSize={limit}
          onPageSizeChange={(newLimit) => {
            setOffset(0);
            setLimit(newLimit)
          }}
        />
        <CustomPaging totalCount={total} />
        {/* endregion */}

        <Table />

        <TableHeaderRow />

        {/*<TableColumnVisibility {...columnVisibilityProps} />*/}
        <Toolbar/>
        {/*<ColumnChooser/>*/}

        <PagingPanel pageSizes={pageSizes}/>
      </Grid>
    </div>
  )
}

export default DxRestGrid
