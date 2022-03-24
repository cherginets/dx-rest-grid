import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Column,
  CustomPaging,
  DataTypeProvider,
  DataTypeProviderProps,
  PagingState, Sorting, SortingDirection, SortingState,
  VirtualTable
} from '@devexpress/dx-react-grid'
import { Plugin } from '@devexpress/dx-react-core'
import {
  ColumnChooser,
  Grid,
  PagingPanel,
  Table,
  TableColumnVisibility,
  TableHeaderRow,
  Toolbar
} from '@devexpress/dx-react-grid-material-ui'
import useLocalStorage from './utils/useLocalStorage'
import { Sync } from '@mui/icons-material'

export type DxRestGridProviderType = React.ComponentType<DataTypeProviderProps>;
export type DxRestGridColumn = Column & {
  // table column extensions
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  wordWrapEnabled?: boolean;
  sortingDisabled?: boolean;
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
  fetchAction: (params: { offset: number; limit: number, sorting?: Sorting[] }) => Promise<{
    rows: ReadonlyArray<T>
    total: number
  }>;

  providers?: ProvidersProp[]
  saveInStorage?: {
    columnHidden: boolean
    sorting: boolean
  }

  enableSorting?: boolean
  defaultSorting?: Sorting[]
}

function DxRestGrid<Row>(
  { id, columns: _columns, fetchAction, providers, saveInStorage = {
    columnHidden: true,
    sorting: true
  },
    enableSorting = false,
    defaultSorting = [],
  }: DxRestGridProps<Row>
) {
  const {
    columns,
    columnExtensions,
    sortingStateColumnExtensions
  } = useMemo<{
    columns: Array<Column>
    columnExtensions: Array<Table.ColumnExtension>
    sortingStateColumnExtensions: Array<SortingState.ColumnExtension>
  }>(() => {
    const columns: Array<Column> = [],
      columnExtensions: Array<Table.ColumnExtension> = [],
      sortingStateColumnExtensions: Array<SortingState.ColumnExtension> = [];
    _columns.forEach(({
                        name, title,
                        width, align, wordWrapEnabled,
                        sortingDisabled
                      }) => {
      columns.push({ name, title })
      if (width || align || wordWrapEnabled !== undefined) {
        columnExtensions.push({ columnName: name, width, align, wordWrapEnabled })
      }
      if (sortingDisabled !== undefined) {
        sortingStateColumnExtensions.push({ columnName: name, sortingEnabled: !sortingDisabled})
      }
      // providers.push([name, provider])
    })
    return { columns, columnExtensions, sortingStateColumnExtensions }
  }, [_columns])

  // region Pagination
  const [total, setTotal] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [limit, setLimit] = useState<number>(2)
  const [pageSizes] = useState<number[]>([2, 10, 50, 100, 500])
  // endregion

  // region Sorting
  const [sorting, setSorting] = useState<Sorting[]>(defaultSorting);
  const [sortingLS, setSortingLS] = useLocalStorage<Sorting[]>(`DxRestGrid_${id}_sorting`, []);
  useEffect(() => {
    if(saveInStorage.sorting) setSorting(sortingLS);
  }, [])
  useEffect(() => {
    if(saveInStorage.sorting) setSortingLS(sorting);
  }, [sorting])
  // endregion

  // region Hidden columns
  const [hiddenColumnNames, setHiddenColumnNames] = useState<string[]>([]);
  const [hiddenColumnNamesLS, setHiddenColumnNamesLS] = useLocalStorage<string[]>(`DxRestGrid_${id}_hiddenColumnsNames`, []);
  useEffect(() => {
    if(saveInStorage.columnHidden) setHiddenColumnNames(hiddenColumnNamesLS);
  }, [])
  useEffect(() => {
    if(saveInStorage.columnHidden) setHiddenColumnNamesLS(hiddenColumnNames);
  }, [hiddenColumnNames])
  // endregion

  // region Data and fetching
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([])

  const fetch = useCallback(() => {
    setLoading(true);
    fetchAction({ offset, limit, sorting }).then((response) => {
      setTotal(response.total)
      setRows([...response.rows])
    })
      .finally(() => {
        setLoading(false)
      })
  }, [fetchAction, offset, limit, sorting])

  useEffect(() => {
    fetch()
  }, [fetch])
  // endregion

  console.log('sorting', sorting);

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

        {enableSorting && <SortingState
          sorting={sorting}
          onSortingChange={setSorting}
          columnExtensions={sortingStateColumnExtensions}
        />}

        <Table columnExtensions={columnExtensions} />

        <TableHeaderRow showSortingControls={enableSorting} />

        <TableColumnVisibility
          hiddenColumnNames={hiddenColumnNames}
          onHiddenColumnNamesChange={setHiddenColumnNames}
        />

        <Toolbar rootComponent={({children}) => {
          return <Toolbar.Root>
            <div style={{flexGrow: 1, display: 'flex', alignItems:'center', justifyContent: 'flex-end'}}>
              <button onClick={fetch}>
                <Sync />
              </button>
            </div>{children}
          </Toolbar.Root>
        }} />
        <ColumnChooser/>

        <PagingPanel pageSizes={pageSizes}/>
      </Grid>
      {loading && "Загрузка..."}
    </div>
  )
}

export default DxRestGrid
