import { Product, ChatReply } from './types';

export const SAREE_COLORS = [
  { name: 'Red', hex: '#C0392B' },
  { name: 'Royal Blue', hex: '#2980B9' },
  { name: 'Emerald', hex: '#27AE60' },
  { name: 'Deep Pink', hex: '#C2185B' },
  { name: 'Purple', hex: '#6C3483' },
  { name: 'Saffron', hex: '#E67E22' },
  { name: 'Teal', hex: '#138D75' },
  { name: 'Maroon', hex: '#C4601A' }
];

export const SAREE_GRADIENTS = [
  'linear-gradient(135deg,#C0392B,#922B21)',
  'linear-gradient(135deg,#1A5276,#2980B9)',
  'linear-gradient(135deg,#1E8449,#27AE60)',
  'linear-gradient(135deg,#C4601A,#F5E4BC)',
  'linear-gradient(135deg,#6C3483,#A569BD)',
  'linear-gradient(135deg,#E67E22,#F39C12)',
  'linear-gradient(135deg,#138D75,#76D7C4)',
  'linear-gradient(135deg,#922B21,#E74C3C)',
  'linear-gradient(135deg,#1F618D,#5DADE2)',
  'linear-gradient(135deg,#1D8348,#82E0AA)',
  'linear-gradient(135deg,#78281F,#F1948A)',
  'linear-gradient(135deg,#4A235A,#BB8FCE)'
];

export const products: Product[] = [
  {
    id: 1,
    name: 'Kotadoria Pure Silk Zari Saree',
    price: 2499,
    fabric: 'Silk',
    occasion: 'Wedding',
    colour: 'Red',
    tags: ['best-seller', 'trending'],
    isReel: true,
    views: '12.4k',
    rating: 4.9,
    reviews: 234,
    blouse: true,
    desc: 'Masterpiece of Kota Doria handloom weaving from Rajasthan. Fine silk and cotton yarns interlocked in the signature Khat square grid with pure gold zari borders.'
  },
  {
    id: 2,
    name: 'Kotadoria Tissue Silk Saree',
    price: 3799,
    fabric: 'Silk',
    occasion: 'Wedding',
    colour: 'Deep Pink',
    tags: ['best-seller'],
    isReel: false,
    rating: 4.8,
    reviews: 156,
    blouse: true,
    desc: 'Lustrous Kotadoria tissue saree featuring authentic shimmering zari check patterns. Lightweight yet regal, handwoven by master artisans in Kota.'
  },
  {
    id: 3,
    name: 'Kotadoria Cotton Khat Saree',
    price: 1299,
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    colour: 'Teal',
    tags: ['deals', 'trending'],
    isReel: true,
    views: '8.2k',
    rating: 4.7,
    reviews: 89,
    blouse: false,
    desc: 'Featherlight pure cotton Kota Doria with classic transparent square grids. Breathable and comfortable, ideal for summer, office, and daily wear.'
  },
  {
    id: 4,
    name: 'Kotadoria Gotta Patti Work Saree',
    price: 4599,
    fabric: 'Silk',
    occasion: 'Festive',
    colour: 'Saffron',
    tags: ['best-seller', 'trending'],
    isReel: true,
    views: '15.1k',
    rating: 5.0,
    reviews: 67,
    blouse: true,
    desc: 'Heritage Rajasthani Gotta Patti hand-embroidery delicately tailored over fine translucent Kotadoria silk fabric. Features intricate floral motifs and gold borders.'
  },
  {
    id: 5,
    name: 'Kotadoria Handblock Print Saree',
    price: 1899,
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    colour: 'Royal Blue',
    tags: ['deals', 'trending'],
    isReel: false,
    rating: 4.6,
    reviews: 112,
    blouse: false,
    desc: 'Authentic Bagru/Dabu wooden block printing hand-stamped onto breathable cotton Kota Doria grid fabric with natural eco-friendly dyes.'
  },
  {
    id: 6,
    name: 'Kotadoria Leheriya Festive Saree',
    price: 1999,
    fabric: 'Silk',
    occasion: 'Festive',
    colour: 'Purple',
    tags: ['deals'],
    isReel: true,
    views: '6.7k',
    rating: 4.5,
    reviews: 78,
    blouse: false,
    desc: 'Vibrant Rajasthani Leheriya wave tie-dye on delicate Kota Doria fabric. Lightweight, airy, and stunning for Teej, Raksha Bandhan, and festive events.'
  },
  {
    id: 7,
    name: 'Kotadoria Bridal Zari Saree',
    price: 5999,
    fabric: 'Silk',
    occasion: 'Wedding',
    colour: 'Maroon',
    tags: ['best-seller'],
    isReel: false,
    rating: 4.9,
    reviews: 23,
    blouse: true,
    desc: 'Grand Kotadoria bridal saree woven with heavy gold zari pallu and rich Rajasthani royal motifs on pure silk-cotton Khat grid.'
  },
  {
    id: 8,
    name: 'Kotadoria Pastel Floral Saree',
    price: 2199,
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    colour: 'Emerald',
    tags: ['trending', 'best-seller'],
    isReel: true,
    views: '9.8k',
    rating: 4.8,
    reviews: 45,
    blouse: true,
    desc: 'Refreshing pastel botanical motifs hand-printed over lightweight Kota Doria cotton weave. Elegantly finished with a thin gold zari selvedge.'
  }
];

export const CHATBOT_RESPONSES: Record<string, ChatReply> = {
  greet: {
    msg: 'Namaste! 🙏 Welcome to Sneh Sarees — Kota Doria saree store in Kota, Rajasthan. How can I assist you today?',
    replies: ['Browse Sarees', 'Track my Order', 'Delivery Info', 'Contact Us']
  },
  browse: {
    msg: 'Explore our saree collections on our shop page to filter by your favorite styles, fabrics, and designs!',
    replies: ['Shop All Sarees', 'Back to Menu'],
    action: 'shop'
  },
  shopall: {
    msg: 'Taking you to our complete saree collection! ✨',
    replies: [],
    action: 'shop'
  },
  order: {
    msg: "To track your order, WhatsApp us your Order ID at +91 94610 37123 and we'll update you instantly!",
    replies: ['WhatsApp Us', 'Back to Menu']
  },
  delivery: {
    msg: 'We deliver across India in 5–7 business days. Delivery is FREE for orders ₹2,000 & above. A flat ₹100 delivery charge applies for orders below ₹2,000. Secure online payment via Razorpay is supported.',
    replies: ['Back to Menu']
  },
  returns: {
    msg: 'As every saree is thoroughly quality-checked before dispatch, we currently do not accept returns or exchanges after delivery. However, you can cancel any order free of cost before courier dispatch with a 100% instant refund. For help, feel free to WhatsApp us!',
    replies: ['WhatsApp Us', 'Back to Menu']
  },
  cancellation: {
    msg: 'Orders can be cancelled free of charge anytime prior to courier dispatch with a 100% instant refund. Once dispatched or delivered, orders cannot be cancelled or returned.',
    replies: ['Back to Menu']
  },
  contact: {
    msg: '📞 Call/WhatsApp: +91 94610 37123\n📍 Sneh Sarees, Kota, Rajasthan, India\n⏰ Mon–Sat, 9am–7pm',
    replies: ['WhatsApp Us', 'Back to Menu']
  },
  whatsapp: {
    msg: 'Opening WhatsApp for you!',
    replies: [],
    action: 'wa'
  },
  menu: {
    msg: 'Sure! What else can I help you with?',
    replies: ['Browse Sarees', 'Track my Order', 'Delivery Info', 'Cancellation Info', 'Contact Us']
  },
  fallback: {
    msg: 'I\'m not sure about that, but our team on WhatsApp can help! Would you like to connect?',
    replies: ['WhatsApp Us', 'Back to Menu']
  }
};

export const INTENT_MAP: Record<string, string> = {
  'browse sarees': 'browse',
  'browse kotadoria': 'browse',
  'shop all': 'shopall',
  'shop all sarees': 'shopall',
  'track my order': 'order',
  'delivery info': 'delivery',
  'returns policy': 'returns',
  'return': 'returns',
  'refund': 'returns',
  'cancellation': 'cancellation',
  'contact us': 'contact',
  'whatsapp us': 'whatsapp',
  'back to menu': 'menu'
};

export const SAREE_HISTORIES = [
  {
    title: 'Classic Cotton Kota Doria',
    origin: 'Kota & Kaithoon, Rajasthan',
    desc: 'The hallmark of Rajasthan\'s handloom heritage, Kota Doria is famous for its distinctive square grid pattern known as "Khat". Woven on traditional pit looms with pure fine cotton yarns, it is celebrated for being featherlight, airy, and exceptionally breathable in hot weather.',
    motif_desc: 'Delicate geometric square grids (Khat), zari selvedge, and subtle floral booti borders',
    later_desc: 'Historically patronized by the royal Rajput courts of Kota. The Khat check structure is woven by interlacing cotton for strength and silk for luster, requiring extraordinary precision.',
    occasions: ['Daily Wear', 'Office & Formal Events', 'Summer Pujas', 'Day Gatherings'],
    tags: ['Pure Cotton', 'Khat Grid', 'Breathable', 'Summer Heritage'],
    symbol: 'sun'
  },
  {
    title: 'Kotadoria Silk Tissue',
    origin: 'Kota, Rajasthan',
    desc: 'A luxurious variation woven by combining fine mulberry silk warp threads with delicate metallic gold and silver zari weft. The Khat grid creates a shimmering, translucent sheen that drapes with extraordinary regal grace.',
    motif_desc: 'Gold zari grids, ornate paisley pallu, and shimmering metallic tissue finish',
    later_desc: 'Woven for festive grand celebrations. Despite its rich zari shimmer, Kotadoria Silk Tissue remains featherlight, allowing effortless movement and long hours of comfortable wear.',
    occasions: ['Weddings', 'Festive Celebrations', 'Diwali', 'Receptions'],
    tags: ['Silk Tissue', 'Zari Grid', 'Regal Shimmer', 'Festive'],
    symbol: 'star'
  },
  {
    title: 'Zari Border Kotadoria',
    origin: 'Rajasthan Artisan Clusters',
    desc: 'Features traditional hand-woven temple and floral zari borders framing the sheer body of the Kotadoria saree. The rich metallic border provides structure to the delicate drape while preserving the breezy Khat texture.',
    motif_desc: 'Temple spires (Gopuram/Keri), geometric checks, and solid gold zari borders',
    later_desc: 'Each border is woven with high-count silk and zari yarns on multi-treadle looms, creating a classic statement piece treasured by connoisseurs of Indian handloom.',
    occasions: ['Festive Gatherings', 'Family Pujas', 'Temple Visits', 'Cultural Functions'],
    tags: ['Zari Border', 'Temple Motif', 'Handcrafted', 'Heirloom'],
    symbol: 'temple'
  },
  {
    title: 'Handblock Printed Kotadoria',
    origin: 'Bagru & Sanganer, Rajasthan',
    desc: 'A celebrated synergy of two Rajasthani GI-tagged crafts: authentic Kota Doria Khat fabric hand-stamped with wooden carved blocks using traditional vegetable and mineral dyes.',
    motif_desc: 'Buttas, floral vines (Bel), paisley bootis, and natural indigo/madder patterns',
    later_desc: 'Master block printers carefully stamp each motif onto the translucent Khat grid. Any slight organic variance in dye layer is the authentic hallmark of genuine artisan block printing.',
    occasions: ['Summer Parties', 'Day Brunches', 'Casual Festive', 'Office Wear'],
    tags: ['Handblock Print', 'Natural Dyes', 'Bagru Craft', 'Artisanal'],
    symbol: 'grid'
  },
  {
    title: 'Gotta Patti & Zari Kotadoria',
    origin: 'Jaipur & Kota, Rajasthan',
    desc: 'The traditional Rajasthani craft of Gotta Patti applique embroidery, meticulously hand-stitched onto lightweight Kotadoria fabric. Ribbon-like metallic lace is folded into flower petals and leaf patterns.',
    motif_desc: 'Floral jaal, peacock motifs, gotta patti borders, and delicate danka work',
    later_desc: 'Favored across royal Rajasthani trousseaus. The contrast of opulent gold gotta work on lightweight translucent Kotadoria creates a radiant bridal look without the heaviness of standard brocades.',
    occasions: ['Weddings', 'Sangeet & Mehendi', 'Karwa Chauth', 'Festive Nights'],
    tags: ['Gotta Patti', 'Bridal Work', 'Royal Craft', 'Embroidered'],
    symbol: 'peacock'
  },
  {
    title: 'Leheriya & Bandhani Kotadoria',
    origin: 'Rajasthan',
    desc: 'Traditional tie-dye patterns hand-rolled and tied in diagonal wave lines (Leheriya) or intricate knot dots (Bandhani) on crisp Kota Doria fabric, symbolizing the monsoon winds and celebrations.',
    motif_desc: 'Diagonal rainbow waves (Pachranga), mothra checks, and fine tie-dyed dots',
    later_desc: 'Worn traditionally during Teej and festive celebrations across Rajasthan. The translucent Khat grid adds a unique geometric depth to the vivid flowing colors of the dye.',
    occasions: ['Teej Festival', 'Raksha Bandhan', 'Holi & Diwali', 'Day Parties'],
    tags: ['Leheriya', 'Tie-Dye', 'Vibrant', 'Monsoon Festive'],
    symbol: 'lotus'
  }
];
