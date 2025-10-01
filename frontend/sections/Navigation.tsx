'use client'

import React, { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  User,
  ChevronDown,
  LogIn,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  Home,
  ShoppingCart,
  UserPlus,
  Heart,
  Info,
  Mail,
  Bell
} from 'lucide-react'

// Mock auth service - replace with your actual auth implementation
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  const login = () => setIsLoggedIn(true)
  const logout = () => setIsLoggedIn(false)

  return { isLoggedIn, userProfile, login, logout }
}

interface MenuItem {
  path: string
  name: string
  icon: React.ComponentType<any>
}

const Navbar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, userProfile, login, logout } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeRoute, setActiveRoute] = useState('')
  const notificationCount = 3

  // Icons
  const icons = {
    userIcon: User,
    chevronDown: ChevronDown,
    logIn: LogIn,
    logOut: LogOut,
    shoppingBag: ShoppingBag,
    menu: Menu,
    x: X,
    homeIcon: Home,
    cartIcon: ShoppingCart,
    registerIcon: UserPlus,
    wishlistIcon: Heart,
    aboutIcon: Info,
    contactIcon: Mail,
    bell: Bell
  }

  // Menu items
  const menuItems: MenuItem[] = [
    { path: '/', name: 'Home', icon: icons.homeIcon },
    { path: '/products/product-list', name: 'Explore', icon: icons.shoppingBag },
    { path: '/cart', name: 'Cart', icon: icons.cartIcon },
    ...(isLoggedIn 
      ? [
          { path: '/user/profile', name: 'Profile', icon: icons.userIcon },
          { path: '/user/orders', name: 'Orders', icon: icons.shoppingBag },
          { path: '/user/wishes', name: 'Wishlist', icon: icons.wishlistIcon }
        ]
      : [
          { path: '/user/login', name: 'Login', icon: icons.logIn },
          { path: '/user/register', name: 'Register', icon: icons.registerIcon }
        ]
    ),
    { path: '/about', name: 'About', icon: icons.aboutIcon },
    { path: '/contact', name: 'Contact', icon: icons.contactIcon }
  ]

  useEffect(() => {
    setActiveRoute(pathname)
  }, [pathname])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsMenuOpen(false)
  }

  const handleLogin = () => {
    login()
    router.push('/user/login')
  }

  const isActive = (route: string): boolean => {
    return activeRoute.startsWith(route)
  }

  const Logo = () => (
    <div className="relative w-[30px] h-[30px] shrink-0 mr-3">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-indigo-100 h-[15px] w-[15px] rotate-45 absolute rounded-md"></div>
        <div className="bg-indigo-100/30 h-[30px] w-[30px] rotate-45 absolute rounded-md"></div>
        <div className="bg-indigo-100/10 h-[50px] w-[50px] rotate-45 absolute rounded-md"></div>
      </div>
    </div>
  )

  const NotificationBell = ({ isMobile = false }) => (
    <button className={`relative ${isMobile ? 'p-1' : 'p-2'} rounded-full hover:bg-indigo-500/50 transition`}>
      <Bell size={20} className="text-indigo-200 hover:text-white" />
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  )

  const ProfileImage = ({ size = 8 }: { size?: number }) => 
    userProfile?.profileImageUrl ? (
      <img
        src={userProfile.profileImageUrl}
        alt="Profile"
        className={`w-${size} h-${size} rounded-full object-cover border-2 border-indigo-200`}
      />
    ) : (
      <span className={`w-${size} h-${size} rounded-full bg-indigo-200 flex items-center justify-center`}>
        <User size={size === 8 ? 16 : 20} className="text-indigo-600" />
      </span>
    )

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex bg-gradient-to-r from-indigo-600 to-indigo-800 justify-between sticky top-0 items-center py-4 px-6 lg:px-12 text-white z-[200] shadow-lg">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Logo />
          <a href="/" className="text-xl font-bold hover:text-indigo-100 transition">
            BeanCart
          </a>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {menuItems.map((item) => {
            const isItemActive = isActive(item.path)
            return (
              <a
                key={item.path}
                href={item.path}
                className={`relative group hover:text-indigo-200 transition py-2 px-1 ${
                  isItemActive ? 'text-indigo-100' : ''
                }`}
              >
                {item.name}
                {isItemActive ? (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-200 rounded-full scale-x-105 origin-center"></div>
                ) : (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-200 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></div>
                )}
              </a>
            )
          })}
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          {isLoggedIn ? (
            <div className="relative group">
              {/* Profile dropdown trigger */}
              <div 
                className="flex items-center cursor-pointer p-1 rounded-full hover:bg-indigo-500/50 transition"
                onClick={toggleDropdown}
              >
                <ProfileImage />
                <ChevronDown size={16} className="ml-1 text-indigo-200 group-hover:text-white transition" />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg overflow-hidden z-10 transition-all duration-300"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                >
                  <div className="px-4 py-3 border-b bg-indigo-50">
                    <p className="font-medium text-indigo-800">
                      {userProfile?.firstName || "User"}
                    </p>
                    <p className="text-indigo-600 text-xs truncate">{userProfile?.email}</p>
                  </div>
                  <a
                    href="/user/profile"
                    className="flex items-center px-4 py-3 hover:bg-indigo-50 text-sm text-indigo-700 transition"
                  >
                    <User size={16} className="mr-2 text-indigo-500" />
                    View Profile
                  </a>
                  <a
                    href="/user/orders"
                    className="flex items-center px-4 py-3 hover:bg-indigo-50 text-sm text-indigo-700 transition"
                  >
                    <ShoppingBag size={16} className="mr-2 text-indigo-500" />
                    My Orders
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition"
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden z-[150] sticky top-0 flex justify-between items-center py-4 px-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <a href="/" className="text-xl font-bold flex items-center">
          <div className="relative w-[24px] h-[24px] shrink-0 mr-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-indigo-100 h-[12px] w-[12px] rotate-45 absolute rounded-md"></div>
              <div className="bg-indigo-100/30 h-[24px] w-[24px] rotate-45 absolute rounded-md"></div>
              <div className="bg-indigo-100/10 h-[40px] w-[40px] rotate-45 absolute rounded-md"></div>
            </div>
          </div>
          BeanCart
        </a>

        <div className="flex items-center gap-4">
          <NotificationBell isMobile={true} />

          {isLoggedIn ? (
            <div className="mr-2">
              <ProfileImage />
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 p-2 rounded-lg border border-white/20 transition"
            >
              <LogIn size={16} />
            </button>
          )}

          <button onClick={toggleMenu} className="p-1 text-white hover:bg-white/10 rounded-full transition">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[150] md:hidden transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-72 bg-white z-[200] shadow-2xl overflow-y-auto flex flex-col transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
          <h2 className="font-bold text-lg">Menu</h2>
          <button onClick={toggleMenu} className="p-1 hover:bg-white/10 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {isLoggedIn && (
          <div className="flex items-center p-4 border-b border-indigo-100 bg-indigo-50">
            <ProfileImage size={10} />
            <div className="ml-3">
              <p className="font-medium text-indigo-800">
                {userProfile?.firstName || "User"}
              </p>
              <p className="text-indigo-600 text-sm">{userProfile?.email}</p>
            </div>
          </div>
        )}

        <div className="flex-grow p-4">
          <ul className="space-y-2">
            {/* Notification item */}
            <li>
              <a
                href="/notifications"
                className={`flex items-center py-3 px-3 rounded-lg transition ${
                  isActive('/notifications') 
                    ? 'bg-indigo-100 text-indigo-800 font-medium' 
                    : 'text-indigo-600'
                }`}
                onClick={toggleMenu}
              >
                <Bell size={18} className="mr-3" />
                Notifications
                {notificationCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </a>
            </li>

            {menuItems.map((item, index) => {
              const isItemActive = isActive(item.path)
              const IconComponent = item.icon
              
              return (
                <li 
                  key={item.path}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <a
                    href={item.path}
                    className={`flex items-center py-3 px-3 rounded-lg transition ${
                      isItemActive 
                        ? 'bg-indigo-100 text-indigo-800 font-medium' 
                        : 'text-indigo-600'
                    }`}
                    onClick={toggleMenu}
                  >
                    <IconComponent size={18} className="mr-3" />
                    {item.name}
                    {isItemActive && (
                      <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full"></div>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-indigo-100">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center py-2 px-4 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center py-2 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition"
            >
              <LogIn size={18} className="mr-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar