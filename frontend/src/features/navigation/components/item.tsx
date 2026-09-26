import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';

export const Item: React.FC<{ menu: string, icon: any, id: number, items: any }> = ({ menu, icon: Icon, id, items }) => {

  const [isVisible, setVisible] = useState(false)

  const handleVisible = () => {
    setVisible(!isVisible)
    console.log(isVisible)
  }
  return (
    <>
      <div key={id} className="nav-item">
        <a className={`nav-link ${items && "dropdown-toggle"} `} onClick={handleVisible} role="button" aria-expanded="false" aria-controls="navbarVerticalMenuPagesUsersMenu">
          <Icon className="h-4 w-4 mr-2" />
          <span className="text-black nav-link-title">{menu}</span>
        </a>
        <AnimatePresence>
          {isVisible && items && <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            id="navbarVerticalMenuPagesUsersMenu" className="nav-collapse" data-bs-parent="#navbarVerticalMenuPagesMenu">
            {items.map((item: any) => {

              return (
                <a className="nav-link text-black" href="users.html.htm">{item.title}</a>
              )
            })}
          </motion.div>}
        </AnimatePresence>
      </div>
    </>
  )
}
