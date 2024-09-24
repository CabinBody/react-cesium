import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Map from "../pages/Map";
import Navigator from "../pages/Map/components/Navigator";

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
        element:<Navigator></Navigator>
    },
    {
        path:'/*',
        element:<div>Error Page</div>

    }
])

export default Router