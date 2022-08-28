import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import App from './App'
import './index.css'

const theme = {
  colorScheme: 'dark',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
      <NotificationsProvider position="top-center" limit={3}>
        <App />
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>
);