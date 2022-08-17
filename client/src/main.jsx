import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core';
import App from './App'
import './index.css'

const theme = {
  colorScheme: 'dark',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);