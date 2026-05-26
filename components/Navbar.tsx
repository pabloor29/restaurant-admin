import { ChevronDown } from 'lucide-react'
import React from 'react'

function Navbar() {
  return (
    <nav className='absolute bg-primary py-2 px-4'>
        <div className="flex flex-row justify-center items-center">
            {/* <List /> */}
            <p className='font-primary text-4xl ml-2 mr-16'>
                MENU
            </p>
            <ChevronDown />
        </div>
    </nav>
  )
}

export default Navbar