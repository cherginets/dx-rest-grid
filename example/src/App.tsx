import React from 'react'

import DxRestGrid from 'dx-rest-grid'
import 'dx-rest-grid/dist/index.css'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from './theme'
import { Container, Paper, Typography } from '@mui/material'

type Row = {
  id: number
  name: string
  email: string
  balance: number
}

const App = () => {
  return <ThemeProvider theme={theme}>
    <Container>
      <Typography variant={'h4'} style={{marginBottom: 20,}}>Grid when all features enabled</Typography>
      <Paper>
        <DxRestGrid<Row>
          id={'EXAMPLE_TABLE'}
          fetchAction={(params) => {
            return fetchUsers({
              currentPage: Math.floor(params.offset / params.limit) + 1,
              pageSize: params.limit + 1,
            })
          }}
        />
      </Paper>
    </Container>
  </ThemeProvider>
}

export default App

// region Temporary API

const generatedData: Row[] = new Array(444).fill(null).map((i) => {
  const id = parseInt(i) + 1;
  return {
    id,
    balance: Math.floor(Math.random() * 100000),
    email: `test${id}@test.domain`,
    name: `User N-${id}`
  }
});

const fetchUsers = ({ currentPage, pageSize }: {
  currentPage: number
  pageSize: number
}) => {
  const resultRows = [...generatedData];

  const total = resultRows.length;
  const offset = (currentPage - 1) * pageSize;
  const rows = generatedData.slice(offset, offset + pageSize);

  return Promise.resolve({ rows, total, })
}

// endregion
