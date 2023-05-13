import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ErrorPage, Home, Room, SignIn, SignUp } from './modules'
import { Loader, ProtectedRoute } from './components'
import { useDispatch, useSelector } from 'react-redux'
import { loadUser } from './store'

const App = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(store => store.user)

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch])

  // run after loading user only
  useEffect(() => {
    if (!user.isLoading && isLoading) {
      setIsLoading(false);
    }
  }, [user.isLoading, isLoading]);

  return (
    isLoading ? <Loader /> :
      <div>
        <Routes>
          <Route path='/room/:room' element={<ProtectedRoute element={Room} />} />
          <Route path='/' element={<ProtectedRoute element={Home} />} />
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='*' element={<ErrorPage />} />
        </Routes>
      </div>
  )
}

export default App