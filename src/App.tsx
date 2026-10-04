import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

const STORE_NAME = 'MATAZU STORE'
const STORE_LOCATION = 'Katsina, Kano, Nigeria'
const STORE_COVERAGE = 'Katsina • Kano • Nationwide Nigeria'
const categories = ['All', 'Power Banks', 'Chargers', 'Audio', 'Accessories', 'Solar']
const deliveryCoverage = ['Katsina', 'Kano', 'Nationwide Nigeria']
const deliveryStateChoices = ['Katsina', 'Kano', 'Other State'] as const
const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const
const DEMO_ADMIN_USERNAME = 'admin'
const DEMO_ADMIN_EMAIL = 'admin@matazu.store'
const DEMO_ADMIN_PASSWORD = 'MatazuDemo2026'

const features = [
  { icon: '🚚', title: 'Nationwide delivery', copy: 'We bring your tech to your doorstep.' },
  { icon: '✳', title: 'Quality products', copy: 'Good gear, picked with care.' },
  { icon: '₦', title: 'Easy payment', copy: 'Pay securely, your way.' },
  { icon: '☺', title: 'Here to help', copy: 'Real support when you need it.' },
]

type ProductStatus = 'Active' | 'Low stock' | 'Out of stock'
type View = 'home' | 'details' | 'checkout' | 'confirmation' | 'customer-login' | 'customer-signup' | 'customer-forgot-password' | 'admin-login' | 'admin'
type AdminTab = 'dashboard' | 'products' | 'orders'
type OrderStatus = (typeof orderStatuses)[number]
type DeliveryStateChoice = (typeof deliveryStateChoices)[number]

type Product = {
  id: number
  name: string
  category: string
  price: number
  stock: number
  description: string
  shortDescription: string
  image: string
  featured: boolean
  emoji: string
  tone: string
}

type OrderFormState = {
  fullName: string
  phoneNumber: string
  emailAddress: string
  deliveryAddress: string
  city: string
  state: string
  deliveryStateChoice: DeliveryStateChoice
  customStateName: string
  orderNotes: string
}

type AdminProductFormState = {
  name: string
  category: string
  price: string
  stock: string
  description: string
  emoji: string
  featured: boolean
}

type AdminOrderItem = {
  id: number
  name: string
  quantity: number
  price: number
}

type AdminOrder = {
  id: number
  orderNumber: string
  customerName: string
  phone: string
  email: string
  city: string
  state: string
  deliveryAddress: string
  deliveryFee: number
  total: number
  paymentMethod: string
  status: OrderStatus
  items: AdminOrderItem[]
  orderNotes: string
}

function createProductImage(title: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="700" viewBox="0 0 900 700">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <rect width="900" height="700" fill="url(#bg)"/>
      <circle cx="720" cy="190" r="150" fill="${accent}" opacity="0.14"/>
      <circle cx="250" cy="540" r="200" fill="${accent}" opacity="0.08"/>
      <rect x="220" y="185" width="460" height="320" rx="28" fill="${accent}" opacity="0.14"/>
      <text x="450" y="370" text-anchor="middle" font-size="140" font-family="Arial, sans-serif" fill="${accent}">${title.slice(0, 1).toUpperCase()}</text>
      <text x="450" y="500" text-anchor="middle" font-size="42" font-weight="700" fill="${accent}" font-family="Arial, sans-serif">${title}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const initialOrderForm: OrderFormState = {
  fullName: '',
  phoneNumber: '',
  emailAddress: '',
  deliveryAddress: '',
  city: '',
  state: '',
  deliveryStateChoice: 'Katsina',
  customStateName: '',
  orderNotes: '',
}

const defaultAdminForm: AdminProductFormState = {
  name: '',
  category: 'Power Banks',
  price: '',
  stock: '',
  description: '',
  emoji: '🔋',
  featured: false,
}

const starterProducts: Product[] = [
  {
    id: 1,
    name: 'Premium 20,000mAh Power Bank',
    category: 'Power Banks',
    price: 28500,
    stock: 18,
    description: 'A compact, high-capacity power bank with dependable fast charging and a durable finish for travel, workdays and emergency backup.',
    shortDescription: '20,000mAh • Fast charge',
    image: createProductImage('Premium Power Bank', '#e4eee0', '#12452a'),
    featured: true,
    emoji: '🔋',
    tone: 'mint',
  },
  {
    id: 2,
    name: '10,000mAh Fast Charging Power Bank',
    category: 'Power Banks',
    price: 22000,
    stock: 13,
    description: 'Slim, pocket-friendly and reliable for everyday charging, this pack balances speed, battery life and portability for busy lifestyles.',
    shortDescription: '10,000mAh • Pocket size',
    image: createProductImage('Power Bank', '#e8f2e1', '#12452a'),
    featured: true,
    emoji: '🔋',
    tone: 'mint',
  },
  {
    id: 3,
    name: '25W Fast Charger',
    category: 'Chargers',
    price: 10500,
    stock: 17,
    description: 'A fast USB-C charger designed for modern phones and accessories with efficient heat management and quick power delivery.',
    shortDescription: '25W • USB-C',
    image: createProductImage('Fast Charger', '#fff0df', '#12452a'),
    featured: true,
    emoji: '🔌',
    tone: 'peach',
  },
  {
    id: 4,
    name: '33W Fast Charger',
    category: 'Chargers',
    price: 13500,
    stock: 8,
    description: 'Built for fast charging and everyday reliability, this charger brings extra speed to your work, travel and home setup.',
    shortDescription: '33W • Quick charge',
    image: createProductImage('33W Charger', '#fff0df', '#12452a'),
    featured: false,
    emoji: '🔌',
    tone: 'peach',
  },
  {
    id: 5,
    name: 'USB-C Charger',
    category: 'Chargers',
    price: 8900,
    stock: 10,
    description: 'A clean, dependable USB-C wall charger that fits into daily routines, desks and travel kits without complications.',
    shortDescription: 'USB-C • Everyday',
    image: createProductImage('USB-C Charger', '#f3efe8', '#12452a'),
    featured: false,
    emoji: '🔌',
    tone: 'peach',
  },
  {
    id: 6,
    name: 'Bluetooth Earbuds',
    category: 'Audio',
    price: 22500,
    stock: 9,
    description: 'Crisp sound, comfortable fit and reliable wireless performance for calls, music and all-day listening without fuss.',
    shortDescription: 'Clear sound • Light fit',
    image: createProductImage('Bluetooth Earbuds', '#eceaf5', '#12452a'),
    featured: true,
    emoji: '🎧',
    tone: 'lilac',
  },
  {
    id: 7,
    name: 'Wireless Headset',
    category: 'Audio',
    price: 33000,
    stock: 5,
    description: 'An immersive headset designed for clarity, comfort and battery confidence for calls, music and focused work sessions.',
    shortDescription: 'Wireless • Rich sound',
    image: createProductImage('Wireless Headset', '#eaeaf7', '#12452a'),
    featured: false,
    emoji: '🎧',
    tone: 'lilac',
  },
  {
    id: 8,
    name: 'Bluetooth Speaker',
    category: 'Audio',
    price: 24500,
    stock: 6,
    description: 'Portable sound that fits into your room, desk or outing, with deep bass and clean audio for day-to-day listening.',
    shortDescription: 'Portable • Balanced sound',
    image: createProductImage('Speaker', '#e6eff3', '#12452a'),
    featured: true,
    emoji: '🔊',
    tone: 'sky',
  },
  {
    id: 9,
    name: 'Type-C Cable',
    category: 'Accessories',
    price: 4200,
    stock: 26,
    description: 'A durable braided cable built to handle regular charging and syncing, made for dependable daily use and travel convenience.',
    shortDescription: 'Braided • 1.5m',
    image: createProductImage('Type-C Cable', '#f4efde', '#12452a'),
    featured: false,
    emoji: '〰️',
    tone: 'butter',
  },
  {
    id: 10,
    name: 'iPhone Cable',
    category: 'Accessories',
    price: 4800,
    stock: 18,
    description: 'A strong everyday charging cable with a comfortable feel and reliable build for consistent power delivery at home or on the go.',
    shortDescription: 'Apple-ready • Smooth charge',
    image: createProductImage('iPhone Cable', '#f5efe9', '#12452a'),
    featured: false,
    emoji: '🔌',
    tone: 'butter',
  },
  {
    id: 11,
    name: 'Phone Holder',
    category: 'Accessories',
    price: 7000,
    stock: 0,
    description: 'A stable, adjustable holder that supports hands-free viewing and easy access while you work, browse or charge.',
    shortDescription: 'Hands-free • Adjustable',
    image: createProductImage('Phone Holder', '#f0e6e1', '#12452a'),
    featured: false,
    emoji: '📱',
    tone: 'rose',
  },
  {
    id: 12,
    name: 'Phone Stand',
    category: 'Accessories',
    price: 6500,
    stock: 11,
    description: 'A neat and sturdy stand for hands-free viewing, whether you are working, streaming or keeping your device within easy reach.',
    shortDescription: 'Desk-ready • Flexible',
    image: createProductImage('Phone Stand', '#f3e9e4', '#12452a'),
    featured: false,
    emoji: '📱',
    tone: 'rose',
  },
  {
    id: 13,
    name: 'Solar Lamp',
    category: 'Solar',
    price: 16500,
    stock: 4,
    description: 'An outdoor-ready solar lamp that blends ambient lighting with energy saving for patios, outdoor corners and dependable backup lighting.',
    shortDescription: 'Bright nights • Solar',
    image: createProductImage('Solar Lamp', '#dfeeed', '#12452a'),
    featured: true,
    emoji: '☀️',
    tone: 'sky',
  },
  {
    id: 14,
    name: 'Rechargeable Solar Light',
    category: 'Solar',
    price: 14500,
    stock: 7,
    description: 'An all-weather lighting solution that charges in sunlight and provides dependable glow for outdoor spaces and everyday use.',
    shortDescription: 'Rechargeable • Outdoor',
    image: createProductImage('Solar Light', '#e0f0ee', '#12452a'),
    featured: false,
    emoji: '☀️',
    tone: 'sky',
  },
  {
    id: 15,
    name: 'Mini Solar System',
    category: 'Solar',
    price: 38500,
    stock: 3,
    description: 'A compact solar power setup for light use, backup situations and small energy needs in homes and remote spaces.',
    shortDescription: 'Compact • Backup power',
    image: createProductImage('Mini Solar', '#dfeeed', '#12452a'),
    featured: true,
    emoji: '⚡',
    tone: 'sky',
  },
]

const starterOrders: AdminOrder[] = [
  {
    id: 1,
    orderNumber: 'MTS-2026-0001',
    customerName: 'Aisha Danjuma',
    phone: '0803 000 0001',
    email: 'aisha@example.com',
    city: 'Katsina',
    state: 'Katsina',
    deliveryAddress: 'No. 12 Balarabe Road, Katsina',
    deliveryFee: 1000,
    total: 29500,
    paymentMethod: 'Bank Transfer',
    status: 'Pending',
    orderNotes: 'Please call before delivery.',
    items: [
      { id: 1, name: 'Premium 20,000mAh Power Bank', quantity: 1, price: 28500 },
    ],
  },
  {
    id: 2,
    orderNumber: 'MTS-2026-0002',
    customerName: 'Suleiman Bello',
    phone: '0803 000 0002',
    email: 'suleiman@example.com',
    city: 'Kano',
    state: 'Kano',
    deliveryAddress: 'Plot 8, Nassarawa, Kano',
    deliveryFee: 2000,
    total: 54500,
    paymentMethod: 'Bank Transfer',
    status: 'Processing',
    orderNotes: 'Front desk delivery.',
    items: [
      { id: 6, name: 'Bluetooth Earbuds', quantity: 1, price: 22500 },
      { id: 3, name: '25W Fast Charger', quantity: 1, price: 10500 },
    ],
  },
  {
    id: 3,
    orderNumber: 'MTS-2026-0003',
    customerName: 'Zakiyya Yusuf',
    phone: '0803 000 0003',
    email: 'zakiyya@example.com',
    city: 'Abuja',
    state: 'FCT',
    deliveryAddress: 'Suite 12, Maitama, Abuja',
    deliveryFee: 3500,
    total: 20000,
    paymentMethod: 'Bank Transfer',
    status: 'Shipped',
    orderNotes: 'Leave at the lobby if unavailable.',
    items: [
      { id: 13, name: 'Solar Lamp', quantity: 1, price: 16500 },
    ],
  },
]

function formatPrice(value: number) {
  return `₦${value.toLocaleString('en-NG')}`
}

function getOrderNumber() {
  const year = new Date().getFullYear()
  const serial = String(Date.now() % 10000).padStart(4, '0')
  return `MTS-${year}-${serial}`
}

function createProductStatus(stock: number): ProductStatus {
  if (stock <= 0) return 'Out of stock'
  if (stock < 5) return 'Low stock'
  return 'Active'
}

function getDeliveryFee(stateChoice: DeliveryStateChoice, customStateName: string) {
  if (stateChoice === 'Katsina') return 1000
  if (stateChoice === 'Kano') return 2000
  if (customStateName.trim()) return 3500
  return 3500
}

function getStockStatus(stock: number) {
  if (stock <= 0) return { label: 'Out of Stock', className: 'status-out' }
  if (stock < 5) return { label: 'Low Stock', className: 'status-low' }
  return { label: 'In Stock', className: 'status-in' }
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.3" fill="currentColor" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
    </svg>
  )
}

function App() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [cart, setCart] = useState<Record<number, number>>({})
  const [stockNotice, setStockNotice] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => sessionStorage.getItem('matazu-admin-auth') === 'true')
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(() => sessionStorage.getItem('matazu-customer-auth') === 'demo')
  const [view, setView] = useState<View>(() => {
    const path = window.location.pathname
    const isAdminLoggedIn = sessionStorage.getItem('matazu-admin-auth') === 'true'
    const isCustomerLoggedIn = sessionStorage.getItem('matazu-customer-auth') === 'demo'

    if (path === '/admin' || path === '/admin-login') {
      if (isAdminLoggedIn) {
        if (path !== '/admin') window.history.replaceState(null, '', '/admin')
        return 'admin'
      }
      window.history.replaceState(null, '', '/admin-login')
      return 'admin-login'
    }

    if (path === '/customer-login' || path === '/customer-signup' || path === '/customer-forgot-password') {
      if (isCustomerLoggedIn) {
        window.history.replaceState(null, '', '/')
        return 'home'
      }
      if (path === '/customer-signup') return 'customer-signup'
      if (path === '/customer-forgot-password') return 'customer-forgot-password'
      return 'customer-login'
    }

    return 'home'
  })
  const [products, setProducts] = useState<Product[]>(starterProducts)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(starterProducts[0]?.id ?? null)
  const [orderForm, setOrderForm] = useState<OrderFormState>(initialOrderForm)
  const [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; customerName: string; total: number; paymentMethod: string } | null>(null)
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>(starterOrders)
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard')
  const [adminProductForm, setAdminProductForm] = useState<AdminProductFormState>(defaultAdminForm)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(starterOrders[0]?.id ?? null)
  const [authIdentifier, setAuthIdentifier] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname
      const isAdminLoggedIn = sessionStorage.getItem('matazu-admin-auth') === 'true'
      const isCustomerLoggedIn = sessionStorage.getItem('matazu-customer-auth') === 'demo'

      if (path === '/admin' || path === '/admin-login') {
        if (isAdminLoggedIn) {
          if (path !== '/admin') window.history.replaceState(null, '', '/admin')
          setView('admin')
          return
        }
        window.history.replaceState(null, '', '/admin-login')
        setView('admin-login')
        return
      }

      if (path === '/customer-login' || path === '/customer-signup' || path === '/customer-forgot-password') {
        if (isCustomerLoggedIn) {
          window.history.replaceState(null, '', '/')
          setView('home')
          return
        }
        setView(path === '/customer-signup' ? 'customer-signup'
          : path === '/customer-forgot-password' ? 'customer-forgot-password'
            : 'customer-login')
        return
      }

      setView('home')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase().trim())
    return matchesCategory && matchesSearch
  }), [activeCategory, products, search])

  const featuredProducts = useMemo(() => products.filter((product) => product.featured), [products])

  const cartItems = useMemo(
    () => products.filter((product) => cart[product.id]).map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart, products],
  )

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null
  const cartTotal = cartItems.reduce((total, product) => total + product.price * product.quantity, 0)
  const selectedOrder = adminOrders.find((order) => order.id === selectedOrderId) ?? adminOrders[0] ?? null

  const totalProducts = products.length
  const totalOrders = adminOrders.length
  const pendingOrders = adminOrders.filter((order) => order.status === 'Pending').length
  const totalSales = adminOrders.reduce((sum, order) => sum + order.total, 0)

  function navigateTo(nextView: View, path: string) {
    window.history.pushState(null, '', path)
    setView(nextView)
    setAuthError('')
    setAuthMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openCustomerLogin() {
    if (isCustomerAuthenticated) {
      navigateTo('home', '/')
      return
    }
    navigateTo('customer-login', '/customer-login')
  }

  function openAdminLogin() {
    if (isAdminAuthenticated) {
      setAdminTab('dashboard')
      navigateTo('admin', '/admin')
      return
    }
    navigateTo('admin-login', '/admin-login')
  }

  function handleCustomerLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authIdentifier.trim() || !authPassword) {
      setAuthError('Enter your email or phone number and password to continue.')
      return
    }
    sessionStorage.setItem('matazu-customer-auth', 'demo')
    setIsCustomerAuthenticated(true)
    navigateTo('home', '/')
  }

  function handleCustomerSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authName.trim() || !authIdentifier.trim() || authPassword.length < 6) {
      setAuthError('Enter your name, email or phone number, and a password with at least 6 characters.')
      return
    }
    sessionStorage.setItem('matazu-customer-auth', 'demo')
    setIsCustomerAuthenticated(true)
    setAuthMessage('Your demo account is ready. Taking you to the store…')
    navigateTo('home', '/')
  }

  function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authIdentifier.trim()) {
      setAuthError('Enter your email or phone number to continue.')
      return
    }
    setAuthError('')
    setAuthMessage('Password reset is a demo only; no message was sent.')
  }

  function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const username = authIdentifier.trim().toLowerCase()
    if ((username !== DEMO_ADMIN_USERNAME && username !== DEMO_ADMIN_EMAIL) || authPassword !== DEMO_ADMIN_PASSWORD) {
      setAuthError('That demo username/email or password is incorrect.')
      return
    }
    sessionStorage.setItem('matazu-admin-auth', 'true')
    setIsAdminAuthenticated(true)
    setAdminTab('dashboard')
    navigateTo('admin', '/admin')
  }

  function handleAdminLogout() {
    sessionStorage.removeItem('matazu-admin-auth')
    setIsAdminAuthenticated(false)
    setAdminTab('dashboard')
    navigateTo('admin-login', '/admin-login')
  }

  function addToCart(productId: number, quantity = 1) {
    const product = products.find((item) => item.id === productId)
    if (!product || product.stock <= 0) {
      setStockNotice(product ? `${product.name} is out of stock.` : 'This product is no longer available.')
      return false
    }

    const currentQuantity = cart[productId] ?? 0
    if (currentQuantity >= product.stock) {
      setStockNotice(`Stock limit reached: only ${product.stock} ${product.name} available.`)
      return false
    }

    const requestedQuantity = currentQuantity + quantity
    const updatedQuantity = Math.min(product.stock, requestedQuantity)
    setCart((current) => ({ ...current, [productId]: Math.min(product.stock, (current[productId] ?? 0) + quantity) }))
    setStockNotice(requestedQuantity >= product.stock
      ? `Stock limit reached: only ${product.stock} ${product.name} available.`
      : '')
    return updatedQuantity > currentQuantity
  }

  function updateCartQuantity(productId: number, amount: number) {
    const product = products.find((item) => item.id === productId)
    if (!product) return

    const currentQuantity = cart[productId] ?? 0
    const requestedQuantity = currentQuantity + amount

    setCart((current) => {
      const next = { ...current }
      const nextQuantity = Math.max(0, Math.min(product.stock, (current[productId] ?? 0) + amount))
      if (nextQuantity === 0) {
        delete next[productId]
      } else {
        next[productId] = nextQuantity
      }
      return next
    })

    setStockNotice(amount > 0 && requestedQuantity >= product.stock
      ? `Stock limit reached: only ${product.stock} ${product.name} available.`
      : '')
  }

  function removeFromCart(productId: number) {
    setCart((current) => {
      const next = { ...current }
      delete next[productId]
      return next
    })
    setStockNotice('')
  }

  function openProduct(productId: number) {
    setSelectedProductId(productId)
    setView('details')
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goHome() {
    setView('home')
    setFormError('')
    if (window.location.pathname !== '/') window.history.pushState(null, '', '/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToAdmin() {
    openAdminLogin()
  }

  function openProductsSection() {
    setView('home')
    requestAnimationFrame(() => {
      document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function proceedToCheckout() {
    if (cartCount === 0) {
      setCartOpen(true)
      return
    }

    setView('checkout')
    setFormError('')
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function buyNow(productId: number) {
    if (!addToCart(productId)) return
    setView('checkout')
    setFormError('')
    setCartOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openAdminOrder(orderId: number) {
    setSelectedOrderId(orderId)
    setAdminTab('orders')
  }

  function handleOrderChange(field: keyof OrderFormState, value: string) {
    setOrderForm((current) => {
      if (field === 'deliveryStateChoice') {
        const nextChoice = value as DeliveryStateChoice
        return {
          ...current,
          deliveryStateChoice: nextChoice,
          state: nextChoice === 'Other State' ? current.state : nextChoice,
        }
      }

      if (field === 'customStateName') {
        return { ...current, customStateName: value, state: value.trim() || current.state }
      }

      return { ...current, [field]: value }
    })
  }

  function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const exceedsStock = cartItems.some((item) => item.quantity > item.stock)
    if (exceedsStock) {
      setFormError('One or more items exceed available stock. Update your cart before placing the order.')
      return
    }

    const stateName = orderForm.deliveryStateChoice === 'Other State'
      ? orderForm.customStateName.trim()
      : orderForm.deliveryStateChoice

    const requiredFields = [
      orderForm.fullName,
      orderForm.phoneNumber,
      orderForm.deliveryAddress,
      orderForm.city,
      stateName,
    ]

    if (requiredFields.some((value) => value.trim() === '')) {
      setFormError('Please fill in all required customer details before placing your order.')
      return
    }

    const orderNumber = getOrderNumber()
    const customerName = orderForm.fullName.trim()
    const paymentMethod = 'Bank Transfer'
    const deliveryFee = getDeliveryFee(orderForm.deliveryStateChoice, orderForm.customStateName)
    const grandTotal = cartTotal + deliveryFee

    const orderItems: AdminOrderItem[] = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }))

    const newOrder: AdminOrder = {
      id: Date.now(),
      orderNumber,
      customerName,
      phone: orderForm.phoneNumber.trim(),
      email: orderForm.emailAddress.trim(),
      city: orderForm.city.trim(),
      state: stateName,
      deliveryAddress: orderForm.deliveryAddress.trim(),
      deliveryFee,
      total: grandTotal,
      paymentMethod,
      status: 'Pending',
      items: orderItems,
      orderNotes: orderForm.orderNotes.trim(),
    }

    setAdminOrders((current) => [newOrder, ...current])
    setSelectedOrderId(newOrder.id)
    setProducts((current) => current.map((product) => {
      const quantityInOrder = cart[product.id] ?? 0
      if (quantityInOrder <= 0) {
        return product
      }
      const nextStock = Math.max(0, product.stock - quantityInOrder)
      return { ...product, stock: nextStock }
    }))

    setConfirmation({
      orderNumber,
      customerName,
      total: grandTotal,
      paymentMethod,
    })
    setCart({})
    setOrderForm(initialOrderForm)
    setFormError('')
    setView('confirmation')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetAdminProductForm() {
    setAdminProductForm(defaultAdminForm)
    setEditingProductId(null)
  }

  function handleAdminProductChange(field: keyof AdminProductFormState, value: string | boolean) {
    setAdminProductForm((current) => ({ ...current, [field]: value }))
  }

  function handleAdminProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = adminProductForm.name.trim()
    const category = adminProductForm.category.trim() || 'Accessories'
    const description = adminProductForm.description.trim() || 'Fresh addition to the MATAZU lineup.'
    const price = Number(adminProductForm.price)
    const stock = Number(adminProductForm.stock)
    const emoji = adminProductForm.emoji.trim() || '🔋'

    if (!trimmedName || Number.isNaN(price) || price <= 0 || Number.isNaN(stock) || stock < 0) {
      return
    }

    if (editingProductId !== null) {
      setProducts((current) => current.map((product) => {
        if (product.id !== editingProductId) {
          return product
        }

        return {
          ...product,
          name: trimmedName,
          category,
          price,
          stock,
          description,
          shortDescription: product.shortDescription || description,
          image: product.image || createProductImage(trimmedName, '#e7efe7', '#12452a'),
          featured: adminProductForm.featured,
          emoji,
        }
      }))
    } else {
      const nextId = Math.max(0, ...products.map((product) => product.id)) + 1
      const nextProduct: Product = {
        id: nextId,
        name: trimmedName,
        category,
        price,
        stock,
        description,
        shortDescription: description,
        image: createProductImage(trimmedName, '#e7efe7', '#12452a'),
        featured: adminProductForm.featured,
        emoji,
        tone: 'mint',
      }
      setProducts((current) => [...current, nextProduct])
    }

    resetAdminProductForm()
  }

  function handleDeleteProduct(productId: number) {
    const product = products.find((item) => item.id === productId)
    if (!product) {
      return
    }

    const confirmed = window.confirm(`Delete ${product.name} from the catalog?`)
    if (!confirmed) {
      return
    }

    setProducts((current) => current.filter((item) => item.id !== productId))
    if (editingProductId === productId) {
      resetAdminProductForm()
    }
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product.id)
    setAdminTab('products')
    setAdminProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      emoji: product.emoji,
      featured: product.featured,
    })
  }

  function handleOrderStatusChange(orderId: number, nextStatus: OrderStatus) {
    setAdminOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: nextStatus } : order))
  }

  function renderHomePage() {
    return (
      <>
        <main>
          <section className="hero" id="home">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR EVERYDAY TECH, SORTED</div>
              <h1>Quality Gadgets.<br /><span>Better Prices.</span></h1>
              <p>Thoughtful tech for the way you live, work and move. Find your next favourite, right here.</p>
              <div className="hero-buttons">
                <a className="button button-primary" href="#products">Shop Now <span aria-hidden="true">↗</span></a>
                <a className="button button-light" href="#categories">Browse Categories <span aria-hidden="true">→</span></a>
              </div>
              <div className="hero-proof"><div className="proof-avatars"><span>👩🏾</span><span>👨🏿</span><span>👩🏽</span></div><span>Loved by tech people across Nigeria</span></div>
            </div>
            <div className="hero-art" aria-label="Power bank, headphones, and charger">
              <div className="hero-art-orbit orbit-one" />
              <div className="hero-art-orbit orbit-two" />
              <span className="hero-spark spark-one">✳</span><span className="hero-spark spark-two">✦</span>
              <div className="hero-product hero-product-main"><span>🔋</span><small>POWER THAT GOES</small></div>
              <div className="hero-product hero-product-earbuds"><span>🎧</span></div>
              <div className="hero-product hero-product-charger"><span>🔌</span></div>
              <div className="hero-sticker">GOOD<br />GEAR<br /><b>GOOD<br />MOOD</b></div>
              <span className="hero-art-caption">A little more power for your day.</span>
            </div>
            <div className="hero-bottom-note"><span>01 / 03</span><span className="note-line" /><span>MADE FOR EVERYDAY</span></div>
          </section>

          <section className="features" aria-label="Our service benefits">
            {features.map((feature, index) => (
              <article className="feature" key={feature.title}>
                <span className={`feature-icon feature-icon-${index}`}>{feature.icon}</span>
                <div><h2>{feature.title}</h2><p>{feature.copy}</p></div>
              </article>
            ))}
          </section>

          <section className="category-section section-wrap" id="categories">
            <div className="section-heading">
              <div><span className="section-kicker">FIND YOUR THING</span><h2>Shop by category<span className="heading-period">.</span></h2></div>
              <a className="text-link" href="#products">View all products <span aria-hidden="true">↗</span></a>
            </div>
            <div className="category-list">
              {categories.slice(1).map((category, index) => {
                const categoryEmojis = ['🔋', '🔌', '🎧', '📱', '☀️']
                return (
                  <button
                    key={category}
                    type="button"
                    className={`category-tile category-tile-${index}`}
                    onClick={() => {
                      setActiveCategory(category)
                      document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    <span className="category-emoji">{categoryEmojis[index]}</span>
                    <span>{category}</span>
                    <span className="category-arrow" aria-hidden="true">↗</span>
                  </button>
                )
              })}
            </div>
          </section>

          {featuredProducts.length > 0 && (
            <section className="featured-section section-wrap">
              <div className="section-heading">
                <div><span className="section-kicker">FEATURED</span><h2>Best sellers<span className="heading-period">.</span></h2></div>
              </div>
              <div className="featured-grid">
                {featuredProducts.slice(0, 3).map((product) => (
                  <article className="featured-card" key={product.id}>
                    <img src={product.image} alt={product.name} />
                    <div className="featured-card-copy">
                      <span>{product.category}</span>
                      <h3>{product.name}</h3>
                      <div className="featured-card-row">
                        <strong>{formatPrice(product.price)}</strong>
                        <button type="button" onClick={() => openProduct(product.id)}>View product</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="products-section" id="products">
            <div className="section-wrap">
              <div className="section-heading product-heading">
                <div><span className="section-kicker">THE GOOD STUFF</span><h2>Little upgrades,<br className="mobile-break" /> big difference<span className="heading-period">.</span></h2></div>
                <label className="search-box">
                  <span className="search-icon" aria-hidden="true">⌕</span>
                  <input type="search" placeholder="Search gadgets..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search products" />
                  <kbd>/</kbd>
                </label>
              </div>
              <div className="product-controls">
                <div className="filter-list" aria-label="Filter by category">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`filter-chip ${activeCategory === category ? 'filter-active' : ''}`}
                      aria-pressed={activeCategory === category}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <span className="result-count">{filteredProducts.length} products</span>
              </div>
              {stockNotice && <p className="stock-notice" role="status">{stockNotice}</p>}

              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.stock)
                    const productStatus = createProductStatus(product.stock)
                    return (
                      <article
                        className="product-card"
                        key={product.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openProduct(product.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openProduct(product.id)
                          }
                        }}
                      >
                        <div className={`product-image product-${product.tone}`}>
                          <span className="product-number">0{index + 1}</span>
                          <img src={product.image} alt={product.name} />
                          <button type="button" className="quick-add" disabled={product.stock === 0} onClick={(event) => { event.stopPropagation(); addToCart(product.id) }} aria-label={`Add ${product.name} to cart`}>
                            +
                          </button>
                        </div>
                        <div className="product-meta"><span>{product.category}</span><span className="product-rating">★ <b>4.9</b></span></div>
                        <h3>{product.name}</h3>
                        <p className="product-note">{product.shortDescription}</p>
                        <div className="product-stock-row">
                          <span className={`stock-pill ${stockStatus.className}`}>{productStatus}</span>
                        </div>
                        <div className="product-buy">
                          <strong>{formatPrice(product.price)}</strong>
                          <button type="button" disabled={product.stock === 0} onClick={(event) => { event.stopPropagation(); addToCart(product.id) }} className="add-button">
                            {product.stock === 0 ? 'Out of stock' : 'Add to cart'} <span aria-hidden="true">{product.stock > 0 ? '+' : ''}</span>
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-results">
                  <span>⌕</span>
                  <h3>No gadgets found</h3>
                  <p>Try another search or choose a different category.</p>
                  <button type="button" onClick={() => {
                    setSearch('')
                    setActiveCategory('All')
                  }}>Clear filters</button>
                </div>
              )}
            </div>
          </section>

          <section className="about-section section-wrap" id="about">
            <div className="about-art"><span className="about-sun">✳</span><span className="about-word">everyday<br />made better<span>.</span></span><span className="about-stamp">M<br />S</span></div>
            <div className="about-copy"><span className="section-kicker">A GOOD THING, CLOSE TO HOME</span><h2>Good tech should<br />feel within reach<span className="heading-period">.</span></h2><p>We started MATAZU STORE with one simple thought: the little things you use every day deserve to work a little better. So we bring together dependable gadgets, fair prices and service that feels human.</p><a className="button button-primary" href="#products">Find your next favourite <span aria-hidden="true">↗</span></a></div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-main"><div className="footer-brand"><a className="brand footer-logo" href="#home"><span className="brand-mark">M</span><span>{STORE_NAME}</span></a><p>Good gear for real life.<br />Made a little more accessible.</p></div><div className="footer-links"><div><h2>Explore</h2><a href="#categories">Categories</a><a href="#products">All products</a><a href="#about">Our story</a></div><div><h2>Say hello</h2><a href="mailto:hello@matazustore.com">Email us</a><a href="tel:+2348000000000">Customer support</a><span>{STORE_LOCATION}</span></div></div></div>
          <div className="footer-bottom"><span>© 2025 {STORE_NAME}</span><span>{STORE_COVERAGE}</span><button type="button" className="footer-admin-link" onClick={goToAdmin}>Admin Login</button><button type="button" className="footer-admin-link" onClick={openCustomerLogin}>Customer Login</button></div>
        </footer>
      </>
    )
  }

  function renderDetailPage() {
    if (!selectedProduct) {
      return (
        <main className="page-shell">
          <section className="empty-state-wrap section-wrap">
            <div className="empty-state-card">
              <span>📦</span>
              <h2>Product not found</h2>
              <button type="button" className="button button-primary" onClick={goHome}>Back to products</button>
            </div>
          </section>
        </main>
      )
    }

    const quantity = cart[selectedProduct.id] ?? 0
    const stockStatus = getStockStatus(selectedProduct.stock)
    const productStatus = createProductStatus(selectedProduct.stock)

    return (
      <main className="page-shell">
        <section className="details-page section-wrap">
          <button type="button" className="secondary-link" onClick={goHome}>← Back to Products</button>
          <div className="details-layout">
            <div className={`detail-media product-${selectedProduct.tone}`}>
              <img src={selectedProduct.image} alt={selectedProduct.name} />
            </div>
            <div className="detail-copy">
              <span className="section-kicker">{selectedProduct.category}</span>
              <h1>{selectedProduct.name}</h1>
              <div className="detail-price-row"><strong>{formatPrice(selectedProduct.price)}</strong><span>★★★★★</span></div>
              <p className="detail-description">{selectedProduct.description}</p>

              <div className="detail-badges">
                <span className={`stock-pill ${stockStatus.className}`}>{productStatus}</span>
                <span className="stock-pill status-in">Free support</span>
              </div>
              {selectedProduct.stock === 0 && <p className="stock-notice" role="status">This product is out of stock and cannot be added to your cart.</p>}
              {stockNotice && <p className="stock-notice" role="status">{stockNotice}</p>}

              <div className="detail-quantity-row">
                <span>Quantity</span>
                <div className="quantity-stepper">
                  <button type="button" disabled={quantity === 0} onClick={() => updateCartQuantity(selectedProduct.id, -1)} aria-label={`Decrease quantity of ${selectedProduct.name}`}>−</button>
                  <strong>{quantity}</strong>
                  <button type="button" disabled={selectedProduct.stock === 0 || quantity >= selectedProduct.stock} onClick={() => updateCartQuantity(selectedProduct.id, 1)} aria-label={`Increase quantity of ${selectedProduct.name}`}>+</button>
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" disabled={selectedProduct.stock === 0 || quantity >= selectedProduct.stock} className="button button-primary" onClick={() => {
                  addToCart(selectedProduct.id, 1)
                  setCartOpen(true)
                }}>
                  {selectedProduct.stock === 0 ? 'Out of Stock' : quantity >= selectedProduct.stock ? 'Stock Limit Reached' : 'Add to Cart'}
                </button>
                <button type="button" disabled={selectedProduct.stock === 0 || quantity >= selectedProduct.stock} className="button button-light detail-buy-button" onClick={() => buyNow(selectedProduct.id)}>
                  Buy Now
                </button>
              </div>

              <div className="delivery-box">
                <h3>Delivery coverage</h3>
                <ul>
                  {deliveryCoverage.map((location) => <li key={location}>{location}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  function renderCheckoutPage() {
    if (cartItems.length === 0) {
      return (
        <main className="page-shell">
          <section className="empty-state-wrap section-wrap">
            <div className="empty-state-card">
              <span>🛒</span>
              <h2>Your cart is empty</h2>
              <p>Add a few gadgets before checkout.</p>
              <button type="button" className="button button-primary" onClick={goHome}>Continue shopping</button>
            </div>
          </section>
        </main>
      )
    }

    const stateName = orderForm.deliveryStateChoice === 'Other State' ? orderForm.customStateName.trim() : orderForm.deliveryStateChoice
    const checkoutDeliveryFee = getDeliveryFee(orderForm.deliveryStateChoice, orderForm.customStateName)
    const checkoutGrandTotal = cartTotal + checkoutDeliveryFee

    return (
      <main className="page-shell">
        <section className="section-wrap checkout-page">
          <button type="button" className="secondary-link" onClick={goHome}>← Continue shopping</button>
          <div className="checkout-layout">
            <div className="checkout-panel">
              <div className="checkout-header">
                <span className="section-kicker">CHECKOUT</span>
                <h1>Customer details</h1>
              </div>

              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                {formError && <div className="form-error">{formError}</div>}

                <div className="field-grid">
                  <label className="field-group">
                    <span>Full name <em>*</em></span>
                    <input type="text" value={orderForm.fullName} onChange={(event) => handleOrderChange('fullName', event.target.value)} placeholder="Your full name" />
                  </label>

                  <label className="field-group">
                    <span>Phone number <em>*</em></span>
                    <input type="tel" value={orderForm.phoneNumber} onChange={(event) => handleOrderChange('phoneNumber', event.target.value)} placeholder="0803 000 0000" />
                  </label>

                  <label className="field-group">
                    <span>Email address</span>
                    <input type="email" value={orderForm.emailAddress} onChange={(event) => handleOrderChange('emailAddress', event.target.value)} placeholder="your@email.com" />
                  </label>

                  <label className="field-group">
                    <span>City <em>*</em></span>
                    <input type="text" value={orderForm.city} onChange={(event) => handleOrderChange('city', event.target.value)} placeholder="Katsina" />
                  </label>

                  <label className="field-group full-span">
                    <span>Delivery address <em>*</em></span>
                    <input type="text" value={orderForm.deliveryAddress} onChange={(event) => handleOrderChange('deliveryAddress', event.target.value)} placeholder="House number, street name" />
                  </label>

                  <label className="field-group">
                    <span>Delivery state <em>*</em></span>
                    <select value={orderForm.deliveryStateChoice} onChange={(event) => handleOrderChange('deliveryStateChoice', event.target.value)}>
                      {deliveryStateChoices.map((choice) => {
                        const fee = choice === 'Katsina' ? 1000 : choice === 'Kano' ? 2000 : 3500
                        return <option key={choice} value={choice}>{choice} — {formatPrice(fee)}</option>
                      })}
                    </select>
                  </label>

                  {orderForm.deliveryStateChoice === 'Other State' && (
                    <label className="field-group">
                      <span>Other State Name <em>*</em></span>
                      <input type="text" value={orderForm.customStateName} onChange={(event) => handleOrderChange('customStateName', event.target.value)} placeholder="State or region" />
                    </label>
                  )}

                  <label className="field-group full-span">
                    <span>Order notes</span>
                    <textarea value={orderForm.orderNotes} onChange={(event) => handleOrderChange('orderNotes', event.target.value)} placeholder="Delivery notes or special preferences" rows={4} />
                  </label>
                </div>

                <div className="bank-transfer-box">
                  <div className="bank-transfer-header">
                    <span>Payment method</span>
                    <strong className="demo-badge">DEMO DETAILS</strong>
                  </div>
                  <h3>DEMO BANK DETAILS — REPLACE BEFORE LAUNCH</h3>
                  <ul>
                    <li><span>Bank Name:</span> MATAZU STORE DEMO BANK</li>
                    <li><span>Account Name:</span> MATAZU STORE</li>
                    <li><span>Account Number:</span> DEMO-000000</li>
                  </ul>
                </div>

                <button type="submit" className="button button-primary place-order-button">Place Order</button>
              </form>
            </div>

            <aside className="summary-panel">
              <div className="summary-header">
                <span className="section-kicker">ORDER SUMMARY</span>
                <h2>{cartCount} item{cartCount > 1 ? 's' : ''}</h2>
              </div>

              <div className="summary-items">
                {cartItems.map((product) => (
                  <div className="summary-item" key={product.id}>
                    <div className="summary-product">
                      <img src={product.image} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.quantity} x {formatPrice(product.price)}</span>
                      </div>
                    </div>
                    <strong>{formatPrice(product.price * product.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="summary-total-row"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
              <div className="summary-total-row"><span>Delivery Fee</span><strong>{formatPrice(checkoutDeliveryFee)}</strong></div>
              <div className="summary-total-row summary-grand-total"><span>Grand Total</span><strong>{formatPrice(checkoutGrandTotal)}</strong></div>

              <div className="coverage-box">
                <h3>Delivery coverage</h3>
                <ul>
                  {deliveryCoverage.map((location) => <li key={location}>{location}</li>)}
                </ul>
                <p className="selected-state-label">Selected state: {stateName || 'Enter state name'}</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    )
  }

  function renderConfirmationPage() {
    if (!confirmation) {
      return null
    }

    return (
      <main className="page-shell">
        <section className="section-wrap confirmation-page">
          <div className="confirmation-card">
            <span className="confirmation-badge">Order confirmed</span>
            <h1>Thank you, {confirmation.customerName}!</h1>
            <p>We will contact you to confirm your order.</p>

            <div className="confirmation-grid">
              <div className="confirmation-box">
                <span>Order number</span>
                <strong>{confirmation.orderNumber}</strong>
              </div>
              <div className="confirmation-box">
                <span>Order total</span>
                <strong>{formatPrice(confirmation.total)}</strong>
              </div>
              <div className="confirmation-box">
                <span>Payment method</span>
                <strong>{confirmation.paymentMethod}</strong>
              </div>
            </div>

            <button type="button" className="button button-primary" onClick={goHome}>Continue shopping</button>
          </div>
        </section>
      </main>
    )
  }

  function renderAdminDashboard() {
    return (
      <div className="admin-dashboard-shell">
        <header className="admin-topbar">
          <div className="admin-title-group">
            <span className="section-kicker">ADMIN</span>
            <h1>{STORE_NAME}</h1>
          </div>
          <div className="admin-top-actions">
            <button type="button" className="button button-primary" onClick={goHome}>Back to Store</button>
            <button type="button" className="admin-logout-button" onClick={handleAdminLogout}>Logout</button>
          </div>
        </header>

        <nav className="admin-nav" aria-label="Admin dashboard navigation">
          {['dashboard', 'products', 'orders'].map((tab) => {
            const label = tab === 'dashboard' ? 'Dashboard' : tab === 'products' ? 'Products' : 'Orders'
            return (
              <button
                key={tab}
                type="button"
                className={`admin-tab-button ${adminTab === tab ? 'is-active' : ''}`}
                onClick={() => setAdminTab(tab as AdminTab)}
              >
                {label}
              </button>
            )
          })}
        </nav>

        {adminTab === 'dashboard' && (
          <section className="admin-section">
            <div className="admin-stats">
              <article className="admin-stat-card">
                <span className="admin-stat-label">Total Products</span>
                <strong className="admin-stat-value">{totalProducts}</strong>
              </article>
              <article className="admin-stat-card">
                <span className="admin-stat-label">Total Orders</span>
                <strong className="admin-stat-value">{totalOrders}</strong>
              </article>
              <article className="admin-stat-card">
                <span className="admin-stat-label">Pending Orders</span>
                <strong className="admin-stat-value">{pendingOrders}</strong>
              </article>
              <article className="admin-stat-card">
                <span className="admin-stat-label">Total Sales</span>
                <strong className="admin-stat-value">{formatPrice(totalSales)}</strong>
              </article>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>Recent orders</h2>
                <button type="button" className="admin-action-button primary" onClick={() => setAdminTab('orders')}>View all orders</button>
              </div>

              {adminOrders.length === 0 ? (
                <p className="admin-empty-copy">No orders yet.</p>
              ) : (
                <div className="admin-order-list compact">
                  {adminOrders.slice(0, 4).map((order) => (
                    <button type="button" key={order.id} className="admin-order-row" onClick={() => openAdminOrder(order.id)}>
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.customerName}</span>
                      </div>
                      <span className={`admin-order-status status-pill ${order.status === 'Pending' ? 'status-pill--pending' : order.status === 'Delivered' ? 'status-pill--delivered' : 'status-pill--processing'}`}>{order.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {adminTab === 'products' && (
          <section className="admin-section admin-product-layout">
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>{editingProductId !== null ? 'Edit product' : 'Add product'}</h2>
              </div>

              <form className="admin-product-form" onSubmit={handleAdminProductSubmit}>
                <div className="field-grid compact-grid">
                  <label className="field-group">
                    <span>Product name</span>
                    <input value={adminProductForm.name} onChange={(event) => handleAdminProductChange('name', event.target.value)} placeholder="Name" />
                  </label>

                  <label className="field-group">
                    <span>Category</span>
                    <input value={adminProductForm.category} onChange={(event) => handleAdminProductChange('category', event.target.value)} placeholder="Category" />
                  </label>

                  <label className="field-group">
                    <span>Price</span>
                    <input type="number" value={adminProductForm.price} onChange={(event) => handleAdminProductChange('price', event.target.value)} placeholder="0" />
                  </label>

                  <label className="field-group">
                    <span>Stock</span>
                    <input type="number" value={adminProductForm.stock} onChange={(event) => handleAdminProductChange('stock', event.target.value)} placeholder="0" />
                  </label>

                  <label className="field-group">
                    <span>Emoji</span>
                    <input value={adminProductForm.emoji} onChange={(event) => handleAdminProductChange('emoji', event.target.value)} placeholder="🔋" />
                  </label>

                  <label className="field-group checkbox-field">
                    <input type="checkbox" checked={adminProductForm.featured} onChange={(event) => handleAdminProductChange('featured', event.target.checked)} />
                    <span>Featured product</span>
                  </label>

                  <label className="field-group full-span">
                    <span>Description</span>
                    <textarea value={adminProductForm.description} onChange={(event) => handleAdminProductChange('description', event.target.value)} rows={4} placeholder="Short description" />
                  </label>
                </div>

                <div className="admin-form-actions">
                  <button type="submit" className="button button-primary">{editingProductId !== null ? 'Save changes' : 'Add product'}</button>
                  {editingProductId !== null && <button type="button" className="button button-light" onClick={resetAdminProductForm}>Cancel</button>}
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>Catalog</h2>
              </div>

              <div className="admin-catalog-list">
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  return (
                    <article className="admin-catalog-row" key={product.id}>
                      <div className="admin-catalog-product">
                        <img src={product.image} alt={product.name} />
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.category}</span>
                          {product.stock < 5 && <small className="low-stock-label">{stockStatus.label}</small>}
                        </div>
                      </div>

                      <div className="admin-catalog-meta">
                        <span>{formatPrice(product.price)}</span>
                        <span>{product.stock} in stock</span>
                      </div>

                      <div className="admin-catalog-actions">
                        <button type="button" className="admin-action-button" onClick={() => startEditProduct(product)}>Edit</button>
                        <button type="button" className="admin-action-button danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {adminTab === 'orders' && (
          <section className="admin-section">
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>Order management</h2>
              </div>

              <div className="admin-order-list expanded">
                {adminOrders.map((order) => (
                  <div className="admin-order-card" key={order.id}>
                    <div className="admin-order-card-head">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.customerName}</span>
                      </div>
                      <select value={order.status} onChange={(event) => handleOrderStatusChange(order.id, event.target.value as OrderStatus)}>
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-order-details">
                      <div>
                        <span>Phone</span>
                        <strong>{order.phone}</strong>
                      </div>
                      <div>
                        <span>Delivery</span>
                        <strong>{order.state}</strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>{formatPrice(order.total)}</strong>
                      </div>
                    </div>

                    <div className="admin-order-items">
                      {order.items.map((item) => (
                        <span key={`${order.id}-${item.id}`}>
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>

                    <p className="admin-note">{order.orderNotes || 'No notes provided.'}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder && (
              <aside className="admin-panel order-detail-panel">
                <div className="admin-panel-header">
                  <h2>Selected order</h2>
                </div>

                <div className="admin-detail-grid">
                  <div className="admin-detail-box">
                    <h3>Order</h3>
                    <p><strong>{selectedOrder.orderNumber}</strong></p>
                    <p>{selectedOrder.customerName}</p>
                    <p>{selectedOrder.phone}</p>
                  </div>

                  <div className="admin-detail-box">
                    <h3>Delivery</h3>
                    <p>{selectedOrder.city}, {selectedOrder.state}</p>
                    <p>{selectedOrder.deliveryAddress}</p>
                    <p>Delivery fee: {formatPrice(selectedOrder.deliveryFee)}</p>
                  </div>

                  <div className="admin-detail-box admin-detail-box-wide">
                    <h3>Items</h3>
                    <div className="admin-detail-items">
                      {selectedOrder.items.map((item) => (
                        <div className="admin-detail-item" key={`${selectedOrder.id}-${item.id}`}>
                          <span>{item.name} × {item.quantity}</span>
                          <strong>{formatPrice(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-detail-box admin-detail-box-wide">
                    <h3>Summary</h3>
                    <p>Payment: {selectedOrder.paymentMethod}</p>
                    <p>Status: {selectedOrder.status}</p>
                    <p>Order notes: {selectedOrder.orderNotes || 'No notes provided.'}</p>
                    <p><strong>Total: {formatPrice(selectedOrder.total)}</strong></p>
                  </div>
                </div>
              </aside>
            )}
          </section>
        )}
      </div>
    )
  }

  function renderAuthPage() {
    const adminLogin = view === 'admin-login'
    const customerSignup = view === 'customer-signup'
    const forgotPassword = view === 'customer-forgot-password'
    const title = adminLogin ? 'Admin Login' : customerSignup ? 'Create your account' : forgotPassword ? 'Reset your password' : 'Welcome back'
    const description = adminLogin
      ? 'Sign in to manage the MATAZU STORE dashboard.'
      : customerSignup
        ? 'Join MATAZU STORE for a simple local demo experience.'
        : forgotPassword
          ? 'Enter your email or phone number to continue.'
          : 'Sign in to explore your MATAZU STORE account.'
    const submitHandler = adminLogin ? handleAdminLogin
      : customerSignup ? handleCustomerSignup
        : forgotPassword ? handleForgotPassword
          : handleCustomerLogin

    return (
      <main className="auth-page">
        <div className="auth-topbar">
          <button type="button" className="brand auth-brand" onClick={goHome}>
            <span className="brand-mark">M</span>
            <span>{STORE_NAME}</span>
          </button>
          <button type="button" className="auth-store-link" onClick={goHome}>Back to store</button>
        </div>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-heading">
            <span className="section-kicker">{adminLogin ? 'ADMIN ACCESS' : 'YOUR ACCOUNT'}</span>
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>

          {adminLogin && (
            <aside className="demo-credentials" aria-label="Admin demo credentials">
              <strong>DEMO ONLY — not a production account</strong>
              <span>Username: <b>{DEMO_ADMIN_USERNAME}</b> or <b>{DEMO_ADMIN_EMAIL}</b></span>
              <span>Password: <b>{DEMO_ADMIN_PASSWORD}</b></span>
            </aside>
          )}

          <form className="auth-form" onSubmit={submitHandler}>
            {authError && <p className="auth-feedback auth-feedback-error" role="alert">{authError}</p>}
            {authMessage && <p className="auth-feedback" role="status">{authMessage}</p>}
            {customerSignup && (
              <label className="auth-field">
                <span>Full name</span>
                <input type="text" autoComplete="name" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your name" required />
              </label>
            )}
            {!forgotPassword && (
              <label className="auth-field">
                <span>{adminLogin ? 'Email or username' : 'Email or phone'}</span>
                <input
                  type="text"
                  autoComplete="username"
                  value={authIdentifier}
                  onChange={(event) => setAuthIdentifier(event.target.value)}
                  placeholder={adminLogin ? 'admin or admin@matazu.store' : 'you@example.com or phone number'}
                  required
                />
              </label>
            )}
            {forgotPassword && (
              <label className="auth-field">
                <span>Email or phone</span>
                <input type="text" autoComplete="email" value={authIdentifier} onChange={(event) => setAuthIdentifier(event.target.value)} placeholder="you@example.com or phone number" required />
              </label>
            )}
            {!forgotPassword && (
              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete={customerSignup ? 'new-password' : 'current-password'}
                  minLength={customerSignup ? 6 : undefined}
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  placeholder={customerSignup ? 'At least 6 characters' : 'Enter your password'}
                  required
                />
              </label>
            )}
            <button type="submit" className="button button-primary auth-submit">
              {adminLogin ? 'Open Admin Dashboard' : customerSignup ? 'Create account' : forgotPassword ? 'Continue' : 'Login'}
            </button>
          </form>

          <div className="auth-links">
            {!adminLogin && !customerSignup && !forgotPassword && (
              <>
                <button type="button" onClick={() => navigateTo('customer-forgot-password', '/customer-forgot-password')}>Forgot password?</button>
                <span>New to MATAZU? <button type="button" onClick={() => navigateTo('customer-signup', '/customer-signup')}>Sign up</button></span>
              </>
            )}
            {customerSignup && <span>Already have an account? <button type="button" onClick={openCustomerLogin}>Login</button></span>}
            {forgotPassword && <button type="button" onClick={openCustomerLogin}>Back to Customer Login</button>}
            {adminLogin && <button type="button" onClick={openCustomerLogin}>Customer Login</button>}
          </div>
          {!adminLogin && <p className="auth-demo-note">Demo/local authentication only. No account data is sent to a server.</p>}
        </section>
      </main>
    )
  }

  if (view === 'customer-login' || view === 'customer-signup' || view === 'customer-forgot-password' || view === 'admin-login') {
    return renderAuthPage()
  }

  return (
    <>
      <header className="site-header">
        <div className="header-shell">
          <button type="button" className="brand" onClick={goHome}>
            <span className="brand-mark">M</span>
            <span>{STORE_NAME}</span>
          </button>
          <nav className="nav-links" aria-label="Main navigation">
            <a href="#products">Products</a>
            <a href="#categories">Categories</a>
            <a href="#about">About</a>
          </nav>
          <div className="header-actions">
            <button type="button" className="customer-login-link" onClick={openCustomerLogin}>Customer Login</button>
            <button type="button" className="admin-link" onClick={goToAdmin}>Admin Login</button>
            <button type="button" className="cart-button" onClick={() => setCartOpen((current) => !current)} aria-label="Open cart">
              <CartIcon />
              <span>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {view === 'home' && renderHomePage()}
      {view === 'details' && renderDetailPage()}
      {view === 'checkout' && renderCheckoutPage()}
      {view === 'confirmation' && renderConfirmationPage()}
      {view === 'admin' && renderAdminDashboard()}

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" aria-label="Shopping cart" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header">
              <div>
                <span className="section-kicker">YOUR CART</span>
                <h2>{cartCount === 0 ? 'Your cart is empty' : `${cartCount} item${cartCount > 1 ? 's' : ''}`}</h2>
              </div>
              <button type="button" className="cart-close" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
            </div>

            {stockNotice && <p className="stock-notice" role="status">{stockNotice}</p>}

            {cartItems.length === 0 ? (
              <div className="cart-empty-state">
                <span aria-hidden="true">🛒</span>
                <h3>Your cart is ready for a few good picks.</h3>
                <p>Add products from the catalog to continue.</p>
                <button type="button" className="button button-primary" onClick={() => { setCartOpen(false); goHome() }}>Continue shopping</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt={product.name} />
                      <div className="cart-item-copy">
                        <strong>{product.name}</strong>
                        <span>{formatPrice(product.price)} each</span>
                        <div className="cart-item-meta">
                          <button type="button" onClick={() => updateCartQuantity(product.id, -1)} aria-label={`Remove one ${product.name}`}>−</button>
                          <span>{product.quantity}</span>
                          <button type="button" disabled={product.quantity >= product.stock} onClick={() => updateCartQuantity(product.id, 1)} aria-label={`Add one ${product.name}`} title={product.quantity >= product.stock ? 'Stock limit reached' : undefined}>+</button>
                        </div>
                      </div>
                      <div className="cart-item-side">
                        <strong>{formatPrice(product.price * product.quantity)}</strong>
                        <button type="button" className="remove-item-button" onClick={() => removeFromCart(product.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total-row"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                  <button type="button" className="button button-primary cart-submit" disabled={cartCount === 0} onClick={proceedToCheckout}>Proceed to checkout</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button type="button" className={`mobile-link ${view === 'home' ? 'mobile-nav-active' : ''}`} onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span aria-hidden="true">⌂</span>
          <span>Home</span>
        </button>
        <button type="button" className="mobile-link" onClick={openProductsSection}>
          <span aria-hidden="true">🛍</span>
          <span>Shop</span>
        </button>
        <button type="button" className={`mobile-link ${view === 'admin' ? 'mobile-nav-active' : ''}`} onClick={goToAdmin}>
          <span aria-hidden="true">⚙</span>
          <span>Admin Login</span>
        </button>
        <button type="button" className="mobile-link" onClick={() => setCartOpen(true)}>
          <span className="mobile-cart-icon" aria-hidden="true">
            <CartIcon />
            {cartCount > 0 && <i>{cartCount}</i>}
          </span>
          <span>Cart</span>
        </button>
      </nav>
    </>
  )
}

export default App
