import { Product, ChatReply } from './types';

export const SAREE_COLORS = [
  { name: 'Red', hex: '#C0392B' },
  { name: 'Royal Blue', hex: '#2980B9' },
  { name: 'Emerald', hex: '#27AE60' },
  { name: 'Deep Pink', hex: '#C2185B' },
  { name: 'Purple', hex: '#6C3483' },
  { name: 'Saffron', hex: '#E67E22' },
  { name: 'Teal', hex: '#138D75' },
  { name: 'Maroon', hex: '#7B1C2E' }
];

export const SAREE_GRADIENTS = [
  'linear-gradient(135deg,#C0392B,#922B21)',
  'linear-gradient(135deg,#1A5276,#2980B9)',
  'linear-gradient(135deg,#1E8449,#27AE60)',
  'linear-gradient(135deg,#7B1C2E,#C9A84C)',
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
    name: 'Banarasi Silk Saree',
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
    desc: "A masterpiece of Varanasi's 2000-year-old weaving tradition. Pure mulberry silk with authentic gold zari work featuring classic floral jaal patterns. Each piece takes 3-4 months to hand-weave."
  },
  {
    id: 2,
    name: 'Kanjivaram Pure Silk',
    price: 3799,
    fabric: 'Silk',
    occasion: 'Wedding',
    colour: 'Deep Pink',
    tags: ['best-seller'],
    isReel: false,
    rating: 4.8,
    reviews: 156,
    blouse: true,
    desc: 'Authentic Kanchipuram silk with temple border design. The korvai technique creates a contrasting border that is woven separately and interlocked with the body for exceptional durability.'
  },
  {
    id: 3,
    name: 'Chanderi Cotton Saree',
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
    desc: 'Featherlight Chanderi fabric with delicate coin motifs and sheer texture. Perfect for summer and office wear. Handwoven by artisans in Chanderi, Madhya Pradesh.'
  },
  {
    id: 4,
    name: 'Paithani Silk Saree',
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
    desc: "Maharashtra's pride — a Paithani saree with authentic peacock and lotus motifs woven in pure gold zari. The oblique square design in the body is a hallmark of genuine Paithani."
  },
  {
    id: 5,
    name: 'Sambalpuri Ikat Cotton',
    price: 1899,
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    colour: 'Royal Blue',
    tags: ['deals', 'trending'],
    isReel: false,
    rating: 4.6,
    reviews: 112,
    blouse: false,
    desc: 'GI-tagged Sambalpuri saree with traditional bandha (ikat) technique. Features conch shell and wheel motifs tie-dyed before weaving, creating the characteristic soft-edged tribal patterns.'
  },
  {
    id: 6,
    name: 'Bandhani Georgette',
    price: 999,
    fabric: 'Georgette',
    occasion: 'Party',
    colour: 'Purple',
    tags: ['deals'],
    isReel: true,
    views: '6.7k',
    rating: 4.5,
    reviews: 78,
    blouse: false,
    desc: 'Vibrant Rajasthani Bandhani with thousands of tiny resist-dyed dots creating traditional peacock and flower patterns. Lightweight georgette makes it perfect for dancing at celebrations.'
  },
  {
    id: 7,
    name: 'Patola Double Ikat Silk',
    price: 8999,
    fabric: 'Silk',
    occasion: 'Wedding',
    colour: 'Maroon',
    tags: ['best-seller'],
    isReel: false,
    rating: 4.9,
    reviews: 23,
    blouse: true,
    desc: "A rare collector's piece from Patan, Gujarat. Double ikat means both warp and weft are resist-dyed separately and matched precisely while weaving. A single saree takes 4-6 months."
  },
  {
    id: 8,
    name: 'Kashmiri Kani Silk',
    price: 5499,
    fabric: 'Silk',
    occasion: 'Festive',
    colour: 'Emerald',
    tags: ['trending', 'best-seller'],
    isReel: true,
    views: '9.8k',
    rating: 4.8,
    reviews: 45,
    blouse: true,
    desc: 'Handwoven in the valleys of Kashmir using the traditional Kani (needle) technique. The intricate paisley and chinar leaf motifs are woven without a loom, thread by thread — true art.'
  },
  {
    id: 9,
    name: 'Linen Silk Blend',
    price: 2199,
    fabric: 'Linen',
    occasion: 'Office',
    colour: 'Teal',
    tags: ['deals', 'trending'],
    isReel: false,
    rating: 4.6,
    reviews: 134,
    blouse: false,
    desc: 'Contemporary linen-silk blend for the modern working woman. Breathable, elegant and wrinkle-resistant. Natural texture with minimalist woven border in contrast colour.'
  },
  {
    id: 10,
    name: 'Jamdani Muslin Saree',
    price: 3299,
    fabric: 'Cotton',
    occasion: 'Festive',
    colour: 'Royal Blue',
    tags: ['trending'],
    isReel: true,
    views: '11.2k',
    rating: 4.7,
    reviews: 56,
    blouse: false,
    desc: 'UNESCO-recognised Jamdani from Bengal, woven on a cotton muslin base with supplementary weft patterns. The floating floral motifs appear to be embroidered but are entirely woven.'
  },
  {
    id: 11,
    name: 'Pochampally Ikat Silk',
    price: 2799,
    fabric: 'Silk',
    occasion: 'Daily Wear',
    colour: 'Saffron',
    tags: ['deals', 'best-seller'],
    isReel: true,
    views: '7.3k',
    rating: 4.7,
    reviews: 98,
    blouse: true,
    desc: "Telangana's iconic ikat silk with geometric diamond patterns. GI-tagged craft where single ikat technique creates the characteristic smudged-edge effect in warm, earthy tones."
  },
  {
    id: 12,
    name: 'Chikankari Cotton Saree',
    price: 1599,
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    colour: 'Deep Pink',
    tags: ['deals'],
    isReel: false,
    rating: 4.5,
    reviews: 167,
    blouse: false,
    desc: "Lucknowi Chikankari embroidery on fine cotton fabric. Delicate white-on-white shadow work and floral embroidery handstitched by artisans of Lucknow's old city."
  }
];

export const CHATBOT_RESPONSES: Record<string, ChatReply> = {
  greet: {
    msg: 'Namaste! 🙏 Welcome to Snehsarees. How can I help you today?',
    replies: ['Browse Sarees', 'Track my Order', 'Delivery Info', 'Contact Us']
  },
  browse: {
    msg: 'We have a beautiful collection! Explore Silk, Cotton, Banarasi and Wedding sarees. Tap a category on the shop page to filter.',
    replies: ['Silk Sarees', 'Cotton Sarees', 'Wedding Sarees', 'Back to Menu']
  },
  silk: {
    msg: 'Our Silk collection includes Banarasi, Kanjivaram, Paithani & more — starting from ₹2,499. All handpicked from master weavers! ✨',
    replies: ['Shop Silk', 'Back to Menu']
  },
  cotton: {
    msg: 'Our Cotton sarees are perfect for daily wear & office. Chanderi, Sambalpuri, Chikankari — from ₹999! 🌿',
    replies: ['Shop Cotton', 'Back to Menu']
  },
  wedding: {
    msg: 'Planning a wedding? We have stunning bridal sarees in Banarasi, Kanjivaram & Paithani. Every piece is an heirloom. 💍',
    replies: ['Shop Wedding', 'Back to Menu']
  },
  order: {
    msg: "To track your order, WhatsApp us your Order ID at +91 94140 67123 and we'll update you instantly!",
    replies: ['WhatsApp Us', 'Back to Menu']
  },
  delivery: {
    msg: 'We deliver across India in 5–7 business days. Free shipping above ₹1,500. COD available with ₹49 handling charge.',
    replies: ['Back to Menu']
  },
  contact: {
    msg: '📞 Call/WhatsApp: +91 94140 67123\n📍 Snehsarees, Rajasthan, India\n⏰ Mon–Sat, 9am–7pm',
    replies: ['WhatsApp Us', 'Back to Menu']
  },
  shopsilk: {
    msg: 'Taking you to our Silk collection! ✨',
    replies: [],
    action: 'silk'
  },
  shopcotton: {
    msg: 'Taking you to our Cotton collection! 🌿',
    replies: [],
    action: 'cotton'
  },
  shopwedding: {
    msg: 'Taking you to Wedding sarees! 💍',
    replies: [],
    action: 'wedding'
  },
  whatsapp: {
    msg: 'Opening WhatsApp for you!',
    replies: [],
    action: 'wa'
  },
  menu: {
    msg: 'Sure! What else can I help you with?',
    replies: ['Browse Sarees', 'Track my Order', 'Delivery Info', 'Contact Us']
  },
  fallback: {
    msg: 'I\'m not sure about that, but our team on WhatsApp can help! Would you like to connect?',
    replies: ['WhatsApp Us', 'Back to Menu']
  }
};

export const INTENT_MAP: Record<string, string> = {
  'browse sarees': 'browse',
  'silk sarees': 'silk',
  'cotton sarees': 'cotton',
  'wedding sarees': 'wedding',
  'track my order': 'order',
  'delivery info': 'delivery',
  'contact us': 'contact',
  'shop silk': 'shopsilk',
  'shop cotton': 'shopcotton',
  'shop wedding': 'shopwedding',
  'whatsapp us': 'whatsapp',
  'back to menu': 'menu'
};

export const SAREE_HISTORIES = [
  {
    title: 'Banarasi Silk',
    origin: 'Varanasi, Uttar Pradesh',
    desc: 'The crown jewel of Indian weaving, Banarasi sarees are woven with real gold and silver zari. Woven on fine silk, they are famous for their weight and luxury. A single heirloom saree can take up to six months of intricate manual labor by master artisans.',
    motif_desc: 'Intricate floral vines (Bel) and paisley motifs (Kalga) are major elements',
    later_desc: 'Historically patronized by Mughal emperors. It remains the ultimate bridal statement across India, symbolizing eternal royalty and heritage.',
    occasions: ['Weddings', 'Diwali', 'Grand Receptions', 'Festivals'],
    tags: ['Pure Silk', 'Gold Zari', 'Wedding', 'Heirloom'],
    symbol: 'star'
  },
  {
    title: 'Kanjivaram Pure Silk',
    origin: 'Kanchipuram, Tamil Nadu',
    desc: 'Kanjivaram sarees are the pride of Southern India. Woven with three plies of mulberry silk and pure gold zari, they feature bold contrasting colors and temple borders (Korvai) where the border and body are joined.',
    motif_desc: 'Temple spires (Gopuram), peacocks, and coin checks are major elements',
    later_desc: 'The interlocking Korvai weave gives Kanjivarams their signature heavy border and durability. Worn as a sacred drape representing tradition and purity.',
    occasions: ['Weddings', 'Temple Visits', 'Pongal', 'Grahapravesham'],
    tags: ['Heavy Silk', 'Temple Border', 'South Indian'],
    symbol: 'temple'
  },
  {
    title: 'Chanderi Weave',
    origin: 'Chanderi, Madhya Pradesh',
    desc: 'Chanderi sarees are celebrated for their sheer, transparent texture and featherlight weight. Woven from fine cotton and silk yarns, they carry a natural glossy sheen that makes them extremely elegant for summer wear.',
    motif_desc: 'Gold coins (Asharfi), peacocks, and geometric floral butis',
    later_desc: 'Favored heavily by the Scindia royalty of Gwalior. The sheer quality is created by weaving raw silk threads that preserve their strength without thickness.',
    occasions: ['Summer Weddings', 'Day Parties', 'Pujas', 'Festive Brunches'],
    tags: ['Sheer', 'Lightweight', 'Festive'],
    symbol: 'sun'
  },
  {
    title: 'Patola Double Ikat',
    origin: 'Patan, Gujarat',
    desc: 'Patola is a highly complex double ikat silk saree. Both warp and weft threads are resist-dyed in precise mathematical alignment before weaving, creating perfectly mirrored, ultra-sharp geometric patterns.',
    motif_desc: 'Parrots (Popat), elephants (Kunjar), and geometric grids (Bhat)',
    later_desc: 'Woven exclusively by a tiny handful of Salvi family weavers in Patan. A true heirloom piece that is traditionally believed to bring good luck.',
    occasions: ['Weddings', 'Garba Nights', 'Laxmi Puja', 'Heirloom Gatherings'],
    tags: ['Double Ikat', 'Geometric', 'Collector\'s Item'],
    symbol: 'grid'
  },
  {
    title: 'Paithani Silk',
    origin: 'Paithan, Maharashtra',
    desc: 'Paithani is Maharashtra\'s signature silk saree, distinguished by its square oblique borders and a grand gold zari pallu featuring colorful silk peacocks. Woven on pit looms, it has no threads hanging on the reverse.',
    motif_desc: 'Peacocks (Mor), parrots (Munja), and coconut motifs (Narali)',
    later_desc: 'Known as the Queen of Silks. The solid gold pallu is woven like a tapestry, using fine silk threads to weave motifs that appear identical on both sides.',
    occasions: ['Marathi Weddings', 'Ganesh Chaturthi', 'Diwali', 'Gauri Pujan'],
    tags: ['Peacock Motif', 'Zari', 'Bridal'],
    symbol: 'peacock'
  },
  {
    title: 'Sambalpuri Bandha',
    origin: 'Sambalpur, Odisha',
    desc: 'Sambalpuri sarees are handloomed using the tie-dye Bandha (Ikat) method. The warp or weft threads are bound and dyed prior to weaving, producing soft-edged tribal patterns and shell configurations.',
    motif_desc: 'Conchs (Shankha), wheels (Chakra), and blooming lotus flowers',
    later_desc: 'Every thread is colored by hand to create patterns representing nature and Odia folklore. GI-tagged and recognized by UNESCO for its cultural richness.',
    occasions: ['Durga Puja', 'Saraswati Puja', 'Cultural Meets', 'Handloom Days'],
    tags: ['Tribal Ikat', 'GI Tag', 'Odisha Craft'],
    symbol: 'globe'
  },
  {
    title: 'Pichwai Print',
    origin: 'Nathdwara, Rajasthan',
    desc: 'The word "Pichwai" is derived from words "Pichh" meaning back and "wai" meaning hanging, literally meaning hanging from the back. Originally a holy painting style of "Shrinathji" or Lord Krishna elements.',
    motif_desc: 'Kamdhenu (sacred cows), lotus flowers, and gopis are major elements',
    later_desc: 'Later it was adopted in handlooms as digital and block printing. Rather than just art, it serves as a spiritual form of expression, keeping the wearer connected to divinity.',
    occasions: ['Any Poojas', 'Janmashtami', 'Holi', 'Temple Visits', 'Festive Bridal'],
    tags: ['Spiritual Art', 'Lotus Motif', 'Rajasthan Heritage'],
    symbol: 'lotus'
  }
];
