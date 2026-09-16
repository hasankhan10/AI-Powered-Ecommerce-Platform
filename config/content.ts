/**
 * Content configuration — all UI copy lives here, never inside components.
 * Swap this file per client for instant white-label copy changes.
 */
export const content = {
  // ─── Navigation ──────────────────────────────────────────────────────────
  nav: {
    homeLabel: "Home",
    shopLabel: "Shop",
    collectionsLabel: "Collections",
    storyLabel: "Our Story",
    searchPlaceholder: "Search for anything…",
    searchLabel: "Search",
    cartLabel: "Cart",
    accountLabel: "Account",
    signInLabel: "Sign In",
    signOutLabel: "Sign Out",
  },

  // ─── Homepage ────────────────────────────────────────────────────────────
  home: {
    hero: {
      headline: "Dressed in Intention.",
      subheadline:
        "Each piece begins as a conversation between material and purpose.",
      cta: "Discover the Collection",
      videoFallbackAlt: "Maison Vale — Lifestyle Editorial",
    },
    newArrivals: {
      eyebrow: "Just In",
      headline: "New Arrivals",
      cta: "View All",
    },
    editorial: {
      eyebrow: "The House",
      headline: "Craft that refuses to compromise.",
      body: "From natural fibres sourced in the Nilgiris to ateliers in Pondicherry, every Maison Vale piece is made to hold its form — and its story — for years.",
      cta: "Read Our Story",
    },
    categories: {
      eyebrow: "Browse",
      headline: "Shop by Category",
    },
    bestSellers: {
      eyebrow: "Signature Formulations",
      headline: "Best Sellers",
      subheadline:
        "The most coveted artisanal creations, defined by rare ingredients and deliberate craftsmanship.",
      cta: "BUY NOW",
    },
    trustBar: {
      stats: [
        {
          value: "14+",
          label: "Years of Heritage",
          description: "Master artisanal craftsmanship since 2012",
        },
        {
          value: "50k+",
          label: "Pieces Delivered",
          description: "Worn by discerning patrons worldwide",
        },
        {
          value: "06",
          label: "Global Boutiques",
          description: "London, Paris, Mumbai, Milan, Dubai, Chennai",
        },
        {
          value: "99.4%",
          label: "Client Satisfaction",
          description: "Exceptional bespoke concierge care",
        },
      ],
    },
    testimonials: {
      eyebrow: "Patron Reflections",
      headline: "Loved by Connoisseurs",
      subheadline:
        "Real experiences from clients who appreciate timeless craftsmanship and deliberate design.",
      items: [
        {
          id: "1",
          author: "Ananya Deshmukh",
          location: "Mumbai, India",
          rating: 5,
          title: "Incomparable Fabric & Texture",
          content:
            "The Linen Cocoon Shirt is a masterclass in quiet luxury. The weave has a weight and drape that commercial linen can never replicate.",
          productName: "Linen Cocoon Shirt",
          verified: true,
          date: "August 2026",
        },
        {
          id: "2",
          author: "Devendra Singhania",
          location: "New Delhi, India",
          rating: 5,
          title: "Tailored to Absolute Perfection",
          content:
            "The Khadi Blazer is remarkably lightweight yet holds its architectural silhouette with effortless grace. A wardrobe anchor.",
          productName: "Khadi Blazer",
          verified: true,
          date: "September 2026",
        },
        {
          id: "3",
          author: "Pooja Sundaram",
          location: "Bengaluru, India",
          rating: 5,
          title: "Artisanal Luxury with Soul",
          content:
            "Unboxing the package felt like receiving a piece of bespoke haute couture. You can feel the human touch in every single seam.",
          productName: "Cotton Linen Wrap Top",
          verified: true,
          date: "July 2026",
        },
      ],
    },
  },

  // ─── Shop / Catalog ──────────────────────────────────────────────────────
  shop: {
    headline: "The Collection",
    filterLabel: "Filter",
    sortLabel: "Sort",
    sortOptions: {
      newest: "Newest",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
    },
    noResults: "No products match your filters.",
    loadMore: "Load More",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    selectSize: "Select a size",
    selectColor: "Select a colour",
  },

  // ─── Product Detail ──────────────────────────────────────────────────────
  product: {
    askStylist: "Ask the AI Assistant",
    youMayAlsoLike: "You May Also Like",
    freeShipping: "Free shipping on orders above ₹2,000",
    returnPolicy: "Easy 14-day returns",
    shareLabel: "Share",
    descriptionTab: "Description",
    detailsTab: "Details & Care",
    socialProof: {
      watchingSuffix: "patrons viewing this piece right now",
      verifiedBuyer: "Verified Patron",
      locations: [
        "Mumbai, Maharashtra",
        "South Delhi, New Delhi",
        "Indiranagar, Bengaluru",
        "Banjara Hills, Hyderabad",
        "Boat Club Road, Chennai",
        "Civil Lines, Jaipur",
        "Koregaon Park, Pune",
        "Alipore, Kolkata",
        "Jubilee Hills, Hyderabad",
        "Bandra West, Mumbai",
        "Vasant Vihar, New Delhi",
        "Lavelle Road, Bengaluru"
      ],
      patrons: [
        "Ananya D.",
        "Devendra S.",
        "Meera K.",
        "Aarav M.",
        "Rhea S.",
        "Aditya N.",
        "Pooja V.",
        "Vikram R.",
        "Kavita S.",
        "Rohan M.",
        "Shreya B.",
        "Nikhil T."
      ]
    },
  },

  // ─── Cart & Checkout ─────────────────────────────────────────────────────
  cart: {
    title: "Your Cart",
    emptyTitle: "Your cart is empty.",
    emptyBody: "Add something beautiful.",
    continueShopping: "Continue Shopping",
    subtotalLabel: "Subtotal",
    checkoutCta: "Proceed to Checkout",
    removeLabel: "Remove",
    quantityLabel: "Qty",
  },

  checkout: {
    title: "Checkout",
    shippingTitle: "Shipping Address",
    orderSummaryTitle: "Order Summary",
    payNow: "Pay Now",
    securePayment: "Secured by Razorpay",
    successTitle: "Order Confirmed!",
    successBody:
      "Thank you for your order. You'll receive a confirmation email shortly.",
    failureTitle: "Payment Failed",
    failureBody:
      "Your payment could not be processed. Please try again or contact us.",
  },

  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: {
    signInTitle: "Welcome back.",
    signUpTitle: "Create your account.",
    emailLabel: "Email address",
    passwordLabel: "Password",
    signInCta: "Sign In",
    signUpCta: "Create Account",
    googleCta: "Continue with Google",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    otpSent: "We've sent a one-time code to your email.",
    otpLabel: "One-time code",
    verifyCta: "Verify",
  },

  // ─── Account ─────────────────────────────────────────────────────────────
  account: {
    title: "My Account",
    ordersLabel: "My Orders",
    addressesLabel: "Saved Addresses",
    profileLabel: "Profile",
    noOrders: "You haven't placed any orders yet.",
    orderStatus: {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    },
  },

  // ─── AI Shopping Assistant ───────────────────────────────────────────────
  assistant: {
    title: "AI Assistant",
    subtitle: "Ask me anything — I know every piece in the collection.",
    placeholder: "Try: 'something for a summer wedding under ₹8000'",
    welcomeMessage:
      "Hello! I'm your personal Maison Vale AI assistant. Tell me about the occasion, your style, or a budget — and I'll curate something just for you.",
    errorMessage:
      "I'm having trouble connecting right now. Please try again in a moment.",
    persona: `You are the Maison Vale AI Assistant — a warm, knowledgeable personal shopping assistant with deep expertise in the brand's collection. 
You help customers find the right products through genuine conversation, understanding their occasion, style preferences, and budget.
Recommend specific products from the catalogue by name, always honest about pricing and availability.
Speak in warm, editorial prose — never pushy, never generic. You represent a premium brand.`,
    loadingLabel: "Assisting…",
    clearLabel: "Clear conversation",
  },

  // ─── Support ─────────────────────────────────────────────────────────────
  support: {
    title: "Support",
    subtitle: "Ask about your order, returns, or anything else.",
    placeholder: "How can I help you today?",
    welcomeMessage:
      "Hello! I'm here to help with your Maison Vale orders and queries. What can I assist you with today?",
    escalationMessage:
      "I've flagged this for our team, who will reach out to you within 24 hours.",
    policy: `Return Policy: We accept returns within 14 days of delivery for unused items in original packaging. 
Shipping: Orders above ₹2,000 ship free. Standard delivery 3–5 business days. Express 1–2 business days.
Exchange Policy: Exchanges are available for size/colour changes within 14 days.`,
  },

  // ─── Footer ──────────────────────────────────────────────────────────────
  footer: {
    tagline: "Quietly Luxurious",
    columnsHeadings: {
      shop: "Shop",
      company: "Company",
      support: "Support",
    },
    shop: ["New Arrivals", "Apparel", "Accessories", "Home & Living"],
    company: ["Our Story", "Sustainability", "Careers", "Press"],
    support: ["Help Centre", "Shipping & Returns", "Size Guide", "Contact Us"],
    legal: "© 2026 Maison Vale. All rights reserved.",
    developer: "Design and Developed by Stova Media",
    developerUrl: "https://stovamedia.in",
  },

  // ─── Admin Dashboard ─────────────────────────────────────────────────────
  admin: {
    nav: {
      overview: "Overview",
      orders: "Orders",
      products: "Products",
      analytics: "Analytics",
      inventory: "Inventory",
      content: "Content & SEO",
      support: "Support",
      settings: "Settings",
    },
    overview: {
      title: "Store Overview",
      revenue: "Total Revenue",
      orders: "Total Orders",
      conversations: "AI Conversations",
      conversionRate: "AI Conversion Rate",
    },
    products: {
      title: "Products",
      addProduct: "Add Product",
      editProduct: "Edit Product",
      deleteConfirm: "Are you sure you want to delete this product?",
      publishCta: "Publish",
      saveDraft: "Save as Draft",
    },
    orders: {
      title: "Orders",
      updateStatus: "Update Status",
    },
  },

  // ─── Emails ──────────────────────────────────────────────────────────────
  email: {
    orderConfirmation: {
      subject: "Your Maison Vale order is confirmed",
      preheader: "Thank you — here's a summary of your order.",
    },
    orderShipped: {
      subject: "Your Maison Vale order is on its way",
      preheader: "Your package is headed to you.",
    },
  },
} as const;

export type Content = typeof content;
