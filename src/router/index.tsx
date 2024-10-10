import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Dashboard from "../pages/Map/components/Dashboard";
const Router = createBrowserRouter([
    {
        index:true,
        element:<Login></Login>
    },
    {
        path:'/Map',
        element:<Map></Map>
    },
    {   
        path:'/test',
        element:<div style={{width:'auto',height:'100vh',backgroundColor:' #00465e',backgroundImage:'linear-gradient(160deg, #00465e 0%, #1a1a41 100%)'
            }}></div>
    },
    {
        path:'/*',
        element:<div>Error Page</div>

    }
])

export default Router