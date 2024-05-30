// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import Explore from './pages/home/Explore';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import {useQuery} from "@tanstack/react-query";
import LoadingSpinner from './components/common/LoadingSpinner';


function App() {
  // const [count, setCount] = useState(0)
  const {data:authUser, isLoading, error, isError} = useQuery({
    queryKey: ["authUser"],
    queryFn: async() => {
      try{
        const res = await fetch("/api/auth/me");
        const data = await res.json();

        if(data.error){return null;}

        if(!res.ok || data.error){
          throw new Error(data.message || "An error occurred");
        }

        console.log("authUser is: ", data);
        return data;

      } catch(error){
        console.log(error);
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  if(isLoading){
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner SIZE='lg'/>
      </div>
    )
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/>}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> :<Navigate to ="/login"/> } />
        <Route path='/explore' element={authUser ? <Explore /> :<Navigate to ="/login"/> } />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
        <Route path='/notifications' element={authUser ? <NotificationPage/> :<Navigate to ="/login"/>}/>
        <Route path='/profile/:username' element={authUser ? <ProfilePage/> :<Navigate to ="/login"/>}/>
			</Routes>
      {authUser && <RightPanel />}
      <Toaster/>
		</div>
  )
}

export default App
