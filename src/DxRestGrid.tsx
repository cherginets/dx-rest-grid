import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Column,
  CustomPaging,
  DataTypeProvider,
  DataTypeProviderProps,
  PagingState,
  SelectionState,
  Sorting,
  SortingState
} from '@devexpress/dx-react-grid'
import { Plugin } from '@devexpress/dx-react-core'
import {
  ColumnChooser,
  Grid,
  PagingPanel,
  Table,
  TableColumnVisibility,
  TableHeaderRow,
  TableSelection,
  Toolbar
} from '@devexpress/dx-react-grid-material-ui'
import useLocalStorage from './utils/useLocalStorage'
import Sync from '@mui/icons-material/Sync'
import IconButton from '@mui/material/IconButton'
import { CircularProgress } from '@mui/material'

export type DxRestGridColumn = Column & {
  // table column extensions
  width?: number | string
  align?: 'left' | 'right' | 'center'
  wordWrapEnabled?: boolean
  sortingDisabled?: boolean
}

export type ProvidersProp = {
  for: string[]
  formatterComponent?: React.ComponentType<DataTypeProvider.ValueFormatterProps>
  ProviderComponent?: React.ComponentType<DataTypeProviderProps>
  // todo разделить
}

interface DxRestGridProps<T> {
  id: string
  columns: Array<DxRestGridColumn>
  fetchAction: (params: {
    offset: number
    limit: number
    sorting?: Sorting[]
  }) => Promise<{
    rows: ReadonlyArray<T>
    total: number
  }>

  providers?: ProvidersProp[]
  saveInStorage?: {
    columnHidden: boolean
    sorting: boolean
  }

  enableSorting?: boolean
  defaultSorting?: Sorting[]

  onSelect?: (params: { indexes: Array<number | string>; rows: T[] }) => void
}

function DxRestGrid<Row>({
  id,
  columns: _columns,
  fetchAction,
  providers,
  saveInStorage = {
    columnHidden: true,
    sorting: true
  },
  enableSorting = false,
  defaultSorting = [],
  onSelect
}: DxRestGridProps<Row>) {
  const { columns, columnExtensions, sortingStateColumnExtensions } = useMemo<{
    columns: Array<Column>
    columnExtensions: Array<Table.ColumnExtension>
    sortingStateColumnExtensions: Array<SortingState.ColumnExtension>
  }>(() => {
    const columns: Array<Column> = []
    const columnExtensions: Array<Table.ColumnExtension> = []
    const sortingStateColumnExtensions: Array<SortingState.ColumnExtension> = []
    _columns.forEach(
      ({ name, title, width, align, wordWrapEnabled, sortingDisabled }) => {
        columns.push({ name, title })
        if (width || align || wordWrapEnabled !== undefined) {
          columnExtensions.push({
            columnName: name,
            width,
            align,
            wordWrapEnabled
          })
        }
        if (sortingDisabled !== undefined) {
          sortingStateColumnExtensions.push({
            columnName: name,
            sortingEnabled: !sortingDisabled
          })
        }
        // providers.push([name, provider])
      }
    )
    return { columns, columnExtensions, sortingStateColumnExtensions }
  }, [_columns])

  // region Pagination
  const [total, setTotal] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [limit, setLimit] = useState<number>(2)
  const [pageSizes] = useState<number[]>([2, 10, 50, 100, 500])
  // endregion

  // region Sorting
  const [sorting, setSorting] = useState<Sorting[]>(defaultSorting)
  const [sortingLS, setSortingLS] = useLocalStorage<Sorting[]>(
    `DxRestGrid_${id}_sorting`,
    []
  )
  useEffect(() => {
    if (saveInStorage.sorting) setSorting(sortingLS)
  }, [])
  useEffect(() => {
    if (saveInStorage.sorting) setSortingLS(sorting)
  }, [sorting])
  // endregion

  // region Hidden columns
  const [hiddenColumnNames, setHiddenColumnNames] = useState<string[]>([])
  const [hiddenColumnNamesLS, setHiddenColumnNamesLS] = useLocalStorage<
    string[]
  >(`DxRestGrid_${id}_hiddenColumnsNames`, [])
  useEffect(() => {
    if (saveInStorage.columnHidden) setHiddenColumnNames(hiddenColumnNamesLS)
  }, [])
  useEffect(() => {
    if (saveInStorage.columnHidden) setHiddenColumnNamesLS(hiddenColumnNames)
  }, [hiddenColumnNames])
  // endregion

  // region Data and fetching
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<Row[]>([])

  const fetch = useCallback(() => {
    setLoading(true)
    fetchAction({ offset, limit, sorting })
      .then((response) => {
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

  // region Selection
  const canSelect = useMemo(() => !!onSelect, [])
  const [selection, setSelection] = useState<Array<number | string>>([1])
  useEffect(() => {
    if (onSelect)
      onSelect({
        indexes: selection,
        rows: rows.filter((row, i) => selection.includes(i))
      })
  }, [selection])
  // endregion

  return (
    <div style={{ position: 'relative' }}>
      <Grid rows={rows} columns={columns}>
        {/* region Data Type Providers */}
        {!!providers && (
          <Plugin>
            {providers.map(
              (
                { ProviderComponent, formatterComponent, ...provider },
                i: number
              ) => {
                if (ProviderComponent)
                  return <ProviderComponent key={i} for={provider.for} />
                else
                  return (
                    <DataTypeProvider
                      key={i}
                      for={provider.for}
                      formatterComponent={formatterComponent}
                    />
                  )
              }
            )}
          </Plugin>
        )}
        {/* endregion */}

        {/* region Pagination */}
        <PagingState
          currentPage={offset / limit}
          onCurrentPageChange={(current) => setOffset(current * limit)}
          pageSize={limit}
          onPageSizeChange={(newLimit) => {
            setOffset(0)
            setLimit(newLimit)
          }}
        />
        <CustomPaging totalCount={total} />
        {/* endregion */}

        {canSelect && (
          <SelectionState
            selection={selection}
            onSelectionChange={setSelection}
          />
        )}

        {enableSorting && (
          <SortingState
            sorting={sorting}
            onSortingChange={setSorting}
            columnExtensions={sortingStateColumnExtensions}
          />
        )}

        <Table columnExtensions={columnExtensions} />

        <TableHeaderRow showSortingControls={enableSorting} />
        {canSelect && <TableSelection />}

        <TableColumnVisibility
          hiddenColumnNames={hiddenColumnNames}
          onHiddenColumnNamesChange={setHiddenColumnNames}
        />

        <Toolbar
          rootComponent={({ children }) => {
            return (
              <Toolbar.Root>
                <div
                  style={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end'
                  }}
                >
                  <IconButton onClick={fetch}>
                    <Sync />
                  </IconButton>
                </div>
                {children}
              </Toolbar.Root>
            )
          }}
        />
        <ColumnChooser />

        <PagingPanel pageSizes={pageSizes} />
      </Grid>
      {loading && (
        <div
          style={{
            position: 'absolute',
            background: '#ffffffad',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 20
          }}
        >
          <CircularProgress />
        </div>
      )}
    </div>
  )
}

export default DxRestGrid
