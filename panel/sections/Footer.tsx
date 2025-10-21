export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-4 px-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          © 2024 BeanCart Admin. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  )
}