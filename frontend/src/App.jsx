import axios from 'axios'
import './App.css'
import './index.css'
import Header1 from './components/Header1'
import Footer1 from './components/Footer1'
import Body1 from './components/Body1'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@asgardeo/react'



function App() {

  return (
    <>
      <Header1/>
      <SignedIn>
        <Body1 />
      </SignedIn>
      <Footer1 year={2026}/>
    </>
  )
}

export default App
