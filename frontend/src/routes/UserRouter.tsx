import {Routes,Route} from 'react-router-dom'
import LoginPage from '../pages/user/Auth/Login'
import TripUploadPage from '../pages/user/MainPage/TripUploadPage'
import UserSessionRoute from '../protecter/UserSessionRoute'

const UserRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<TripUploadPage/>}/>
      <Route path='/login' element={<UserSessionRoute><LoginPage/></UserSessionRoute>}/>
    </Routes>
  )
}

export default UserRouter
