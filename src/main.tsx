import React from 'react'
import ReactDOM from 'react-dom/client'
import CesiumMap from './CesiumMap.tsx'
import { Provider } from "react-redux";
import AllStore from './store/index.ts';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={AllStore}>
    <CesiumMap />
    </Provider>
    
  </React.StrictMode>,
)
