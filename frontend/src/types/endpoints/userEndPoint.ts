const userRouterEndPoints = {
    userLogin : '/api/user/login',
    userLogout : '/api/user/logout',

    //trip management
    userUploadTrip : '/api/user/trips/upload',
    userGetTrip : '/api/user/trips',
    userGetSpecificTrip :'/api/user/trips',
    userGetMultipleTrip : '/api/user/trips/multiple',
    userDeleteTrip : '/api/user/trips',
    userGetTripVisualization:'/api/user/trip',
    userGetMultipleTripsVisualization : '/api/user/trips/visualization'
}

export default userRouterEndPoints