'use client'

import React, { useState } from 'react'
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart
} from 'lucide-react'

const Footer = () => {
  const [email, setEmail] = useState('')
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Subscribed with email:', email)
    setEmail('')
    // Add your subscription logic here
  }

  const Logo = () => (
    <div className="relative w-[100px] h-[100px] shrink-0">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-indigo-100 h-[25px] w-[25px] rotate-45 absolute rounded-md"></div>
        <div className="bg-indigo-100/30 h-[50px] w-[50px] rotate-45 absolute rounded-md"></div>
        <div className="bg-indigo-100/10 h-[70px] w-[70px] rotate-45 absolute rounded-md"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[400px] w-full bg-gradient-to-br from-indigo-600 to-indigo-800 relative pt-10 px-5 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Logo and Tagline */}
        <div className="flex flex-col md:flex-row items-center gap-5 pb-10 border-b border-indigo-400/30">
          <Logo />

          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-50">BeanCart Ltd</h1>
            <div className="flex gap-2 text-sm w-fit mx-auto md:mx-0 mb-5 items-center">
              <p className="text-indigo-100 tracking-tighter">Fast</p>
              <p className="h-2 w-2 bg-indigo-100 rounded-full"></p>
              <p className="text-indigo-100 tracking-tighter">Secure</p>
              <p className="h-2 w-2 bg-indigo-100 rounded-full"></p>
              <p className="text-indigo-100 tracking-tighter">Transparent</p>
            </div>
            <p className="text-indigo-200 max-w-md">
              Your trusted partner for seamless e-commerce solutions and digital transformation.
            </p>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-indigo-50 font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-indigo-200 hover:text-white transition flex items-center gap-2">
                  <ChevronRight size={18} className="text-indigo-300" />
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-indigo-200 hover:text-white transition flex items-center gap-2">
                  <ChevronRight size={18} className="text-indigo-300" />
                  Products
                </a>
              </li>
              <li>
                <a href="/services" className="text-indigo-200 hover:text-white transition flex items-center gap-2">
                  <ChevronRight size={18} className="text-indigo-300" />
                  Services
                </a>
              </li>
              <li>
                <a href="/about" className="text-indigo-200 hover:text-white transition flex items-center gap-2">
                  <ChevronRight size={18} className="text-indigo-300" />
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-indigo-200 hover:text-white transition flex items-center gap-2">
                  <ChevronRight size={18} className="text-indigo-300" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-indigo-50 font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="text-indigo-200 flex items-start gap-2">
                <MapPin size={18} className="text-indigo-300 mt-0.5 flex-shrink-0" />
                <span>123 Business Ave, Suite 500<br />San Francisco, CA 94107</span>
              </li>
              <li className="text-indigo-200 flex items-center gap-2">
                <Phone size={18} className="text-indigo-300 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </li>
              <li className="text-indigo-200 flex items-center gap-2">
                <Mail size={18} className="text-indigo-300 flex-shrink-0" />
                <span>info@beancart.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h3 className="text-indigo-50 font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-indigo-200 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-indigo-500/50 border border-indigo-400/50 rounded-lg px-4 py-2 text-indigo-50 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-grow w-full"
                required
              />
              <button
                type="submit"
                className="bg-indigo-100 text-indigo-700 hover:bg-white transition px-4 py-2 rounded-lg font-medium flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <Send size={18} />
                Subscribe
              </button>
            </form>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="text-indigo-200 hover:text-white transition hover:scale-110 transform duration-200"
              >
                <Facebook size={20} className="text-indigo-300" />
              </a>
              <a
                href="#"
                className="text-indigo-200 hover:text-white transition hover:scale-110 transform duration-200"
              >
                <Twitter size={20} className="text-indigo-300" />
              </a>
              <a
                href="#"
                className="text-indigo-200 hover:text-white transition hover:scale-110 transform duration-200"
              >
                <Instagram size={20} className="text-indigo-300" />
              </a>
              <a
                href="#"
                className="text-indigo-200 hover:text-white transition hover:scale-110 transform duration-200"
              >
                <Linkedin size={20} className="text-indigo-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-indigo-400/30 py-6 flex flex-col md:flex-row justify-between items-center text-indigo-300 text-sm">
          <div className="mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} BeanCart Ltd. All rights reserved.
          </div>
          <div className="flex gap-4 mb-3 md:mb-0">
            <a href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition">
              Terms of Service
            </a>
            <a href="/cookies" className="hover:text-white transition">
              Cookies
            </a>
          </div>
          <div className="mt-3 md:mt-0 text-indigo-400 flex items-center">
            Crafted with{' '}
            <Heart size={16} className="text-pink-300 mx-1" /> by Digital Wilderness LLC
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer