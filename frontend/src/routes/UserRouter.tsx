import {Routes,Route} from 'react-router-dom'
import LoginPage from '../pages/user/Auth/Login'
import TripUploadPage from '../pages/user/MainPage/TripUploadPage'
import UserSessionRoute from '../protecter/UserSessionRoute'
import TripVisualizationPage from '../pages/user/TripVisualizer/TripVisualizationPage'
import MultiTripVisualizationPage from '../pages/user/TripVisualizer/MultiTripVisualizationPage'

const UserRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<TripUploadPage/>}/>
      <Route path='/login' element={<UserSessionRoute><LoginPage/></UserSessionRoute>}/>
      <Route path='/trips/:tripId' element={<TripVisualizationPage/>}/>
      <Route path='/trips/multi' element={<MultiTripVisualizationPage/>}/>
    </Routes>
  )
}

export default UserRouter
