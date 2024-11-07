import { createBrowserRouter } from "react-router-dom";
import Map from "../pages/Map";
const Router = createBrowserRouter([
    {
        path:'/',
        index:true,
        element:<Map></Map>,
    },
    {
        path:'/*',
        element:<div>Error Page</div>

    }
])

export default Router