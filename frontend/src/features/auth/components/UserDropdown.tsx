import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function UserDropdown() {

  const [isVisible, setVisible] = useState(false)

  const handleVisible = () => {

    setVisible(!isVisible)
  }

  return (
    <>
      <div className="dropdown">
        <a
          onClick={handleVisible}
          className="navbar-dropdown-account-wrapper show" href="javascript:;" id="accountNavbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside" data-bs-dropdown-animation>
          <div className="avatar avatar-sm avatar-circle">
            <img className="avatar-img" src="assets/img/160x160/img6.jpg" alt="Image Description" />
            <span className="avatar-status avatar-sm-status avatar-status-success" />
          </div>
        </a>
        <AnimatePresence>

          {isVisible && <motion.div
            initial={{
              y: 5,
              opacity: 0
            }}
            animate={{
              opacity: 1,
              transform: "translateY(10px) translateY(-10px)",
              transition: "transform 300ms, opacity 30ms",

            }}
            className="dropdown-menu bg-[#b1b1b17c] shadow-none  border-[#ffffff]  border-[0.1rem] dark:bg-[#25282a] dark:border-[#6b6a6a36] absolute right-0 dropdown-menu-end navbar-dropdown-menu navbar-dropdown-menu-borderless navbar-dropdown-account show" aria-labelledby="accountNavbarDropdown" style={{ width: "16rem", }}>
            <div className="dropdown-item-text">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-sm avatar-circle">
                  <img className="avatar-img" src="assets/img/160x160/img6.jpg" alt="Image Description" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="mb-0 text-white">level</h5>
                  <p className="card-text text-body">[EMAIL_ADDRESS]</p>
                </div>
              </div>
            </div>
            <div className="dropdown-divider" />
            {/* Dropdown */}
            <div className="dropdown">
              <a className="navbar-dropdown-submenu-item text-white dropdown-item dropdown-toggle" href="javascript:;" id="navSubmenuPagesAccountDropdown1" data-bs-toggle="dropdown" aria-expanded="false">Set status</a>
              <div className="dropdown-menu dropdown-menu-end navbar-dropdown-menu navbar-dropdown-menu-borderless navbar-dropdown-sub-menu" aria-labelledby="navSubmenuPagesAccountDropdown1">
                <a className="dropdown-item" href="#">
                  <span className="legend-indicator bg-success me-1" /> Available
                </a>
                <a className="dropdown-item" href="#">
                  <span className="legend-indicator bg-danger me-1" /> Busy
                </a>
                <a className="dropdown-item" href="#">
                  <span className="legend-indicator bg-warning me-1" /> Away
                </a>
                <div className="dropdown-divider" />
                <a className="dropdown-item" href="#"> Reset status
                </a>
              </div>
            </div>
            {/* End Dropdown */}
            <a className="dropdown-item text-white" href="#">Profile &amp; account</a>
            <a className="dropdown-item text-white" href="#">Settings</a>
            <div className="dropdown-divider" />
            <a className="dropdown-item" href="#">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="avatar avatar-sm avatar-dark avatar-circle">
                    <span className="avatar-initials">HS</span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2">
                  <h5 className="mb-0 text-white">Htmlstream <span className="badge bg-primary rounded-pill text-uppercase ms-1">PRO</span></h5>
                  <span className="card-text">hs.example.com</span>
                </div>
              </div>
            </a>
            <div className="dropdown-divider" />
            {/* Dropdown */}
            <div className="dropdown">
              <a className="navbar-dropdown-submenu-item dropdown-item dropdown-toggle text-white" href="javascript:;" id="navSubmenuPagesAccountDropdown2" data-bs-toggle="dropdown" aria-expanded="false">Customization</a>
              <div className="dropdown-menu dropdown-menu-end navbar-dropdown-menu navbar-dropdown-menu-borderless navbar-dropdown-sub-menu" aria-labelledby="navSubmenuPagesAccountDropdown2">
                <a className="dropdown-item" href="#">
                  Invite people
                </a>
                <a className="dropdown-item" href="#">
                  Analytics
                  <i className="bi-box-arrow-in-up-right" />
                </a>
                <a className="dropdown-item text-white" href="#">
                  Customize Front
                  <i className="bi-box-arrow-in-up-right" />
                </a>
              </div>
            </div>
            {/* End Dropdown */}
            <a className="dropdown-item text-white" href="#">Manage team</a>
            <div className="dropdown-divider" />
            <a className="dropdown-item text-white" >Sign out</a>
          </motion.div>}

        </AnimatePresence>
      </div>
    </>
  )
}
