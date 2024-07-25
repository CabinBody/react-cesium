import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Map from "../pages/Map";
import PopFrame from "../components/PopFrame";


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
        element:<PopFrame ></PopFrame>
    },
    {
        path:'/*',
        element:<div>Error Page</div>

    }
])

export default Router