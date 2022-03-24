import React, { useState } from 'react'
import './index.css'
import DxRestGrid, { DateTimeProvider, DaysProvider, MoneyProvider } from 'dx-rest-grid'
import 'dx-rest-grid/dist/index.css'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { Container, Paper, Typography } from '@mui/material'
import { DxRestGridColumn } from '../../src/DxRestGrid'

type Row = {
  id: number
  name: string
  email: string
  balance: number
}

const App = () => {
  const [columns] = useState<Array<DxRestGridColumn>>([
    { name: 'id', title: 'ID' },
    { name: 'balance', title: 'Balance' },
    { name: 'email', title: 'Email' },
    { name: 'name', title: 'Name' },
    { name: 'days', title: 'Days' },
    { name: 'createdAt', title: 'Created At' }
  ])

  return <ThemeProvider theme={theme}>
    <Container>
      <Typography variant={'h4'} style={{marginBottom: 20,}}>Grid when all features enabled</Typography>
      <Paper>
        <DxRestGrid<Row>
          id={'EXAMPLE_TABLE'}
          columns={columns}
          fetchAction={(params) => {
            return fetchUsers(params)
          }}
          providers={[
            {for: ['name'], formatterComponent: ({ value }) => <span style={{ color: 'green', fontWeight: 'bold' }}>{value}</span>},
            {for: ['balance'], ProviderComponent: MoneyProvider},
            {for: ['days'], ProviderComponent: DaysProvider},
            {for: ['createdAt'], ProviderComponent: DateTimeProvider},
          ]}
        />
      </Paper>
    </Container>
  </ThemeProvider>
}

export default App

// region Temporary API

const generatedData: Row[] = new Array(444).fill(null).map((_: any, i) => {
  const id = i + 1;
  return {
    id,
    days: id,
    balance: Math.floor(Math.random() * 100000),
    email: `test${id}@test.domain`,
    name: `User N-${id}`,
    createdAt: (new Date(2022, 3, id % 30, id % 23, id % 60, id % 60)).toISOString(),
}
});

const fetchUsers = ({ offset, limit }: {
  offset: number
  limit: number
}) => {
  console.log('"api" query', { offset, limit });
  const resultRows = [...generatedData];

  const total = resultRows.length;
  const rows = generatedData.slice(offset, offset + limit);

  return Promise.resolve({ rows, total })
}

// endregion
