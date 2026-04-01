import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@asgardeo/react'


const Header1 = () => {
    const name = 'Robert'
  return (
    <header>
      <h1>Welcome to <span id="txt-red">{name}</span>'s website</h1>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>  )
}

export default Header1

