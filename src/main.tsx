import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import Store from './store/index.ts';
import Router from './router/index.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={Store}>
    <RouterProvider router={Router}></RouterProvider>
    </Provider>
    
  </React.StrictMode>,
)
