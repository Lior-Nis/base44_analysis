
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Star, ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

// Complete SERENITY Spa Service Menu with SEO-optimized alt text and optimized image URLs
const servicesData = [
  // Massage Services
  {
    id: 1,
    name: "Swedish Massage",
    category: "massage",
    description: "Indulge in a timeless classic at Kolkata's premier wellness destination. Our Swedish Massage utilizes masterful, flowing strokes and gentle kneading to dissolve muscle tension, enhance circulation, and guide you to a state of profound relaxation. This is the perfect introduction to therapeutic massage, meticulously performed by our certified therapists in Tangra to restore your body's natural harmony.",
    price: 2500,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/77609c815_image.png?w=600&q=80",
    alt_text: "Professional Swedish massage therapy session at SERENITY luxury spa in Kolkata - premium relaxation treatment"
  },
  {
    id: 2,
    name: "Japanese Head Spa",
    category: "massage",
    description: "Embark on a transcendent sensory journey with our state-of-the-art Japanese Head Spa. Submerge your senses in a sanctuary of tranquility as a therapeutic waterfall, enriched with potent organic elixirs, bathes your scalp and hair under the ethereal glow of chromotherapy lighting. This is not merely a treatment—it is a meticulous ritual designed to detoxify the scalp, restore hair vitality, and guide you to a state of profound, meditative calm.",
    price: 3500,
    duration: "90 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ddade6f79_image.png?w=600&q=80",
    alt_text: "Japanese Head Spa waterfall treatment with chromotherapy lighting at SERENITY Tangra salon - luxury scalp therapy"
  },
  {
    id: 3,
    name: "Thai Dry Massage",
    category: "massage", 
    description: "Experience the ancient art of healing with our authentic Thai Dry Massage in Kolkata. This traditional, oil-free therapy combines rhythmic acupressure, gentle rocking, and assisted yoga stretches to unblock energy pathways, improve flexibility, and relieve deep-seated tension. Let our expert therapists guide your body into a state of blissful release and renewed vitality.",
    price: 3000,
    duration: "75 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5ea9a35b6_image.png?w=600&q=80",
    alt_text: "Traditional Thai dry massage therapy with acupressure and yoga stretches at SERENITY spa Kolkata"
  },
  {
    id: 4,
    name: "Foot Massage",
    category: "massage",
    description: "Revitalize your entire being from the ground up with our specialized Foot Massage. This ancient reflexology-based treatment targets key pressure points in your feet that correspond to different organs and systems in the body. Alleviate fatigue, reduce stress, and promote overall wellness in our luxurious Tangra spa.",
    price: 1500,
    duration: "45 min", 
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0c4d65a6a_image.png?w=600&q=80",
    alt_text: "Relaxing foot reflexology massage therapy at SERENITY luxury wellness center in Kolkata"
  },
  {
    id: 5,
    name: "Head and Shoulder Massage",
    category: "massage",
    description: "Melt away the stresses of modern life with our targeted Head and Shoulder Massage. This concentrated therapy focuses on the high-tension areas of your neck, shoulders, and scalp, providing immediate relief from headaches, stiffness, and digital fatigue. It's the ultimate quick escape to tranquility, offered at the best spa in Kolkata.",
    price: 1200,
    duration: "30 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30adeac89_image.png?w=600&q=80",
    alt_text: "Therapeutic head and shoulder massage for stress relief at SERENITY premium spa in Tangra Kolkata"
  },
  {
    id: 6,
    name: "Deep Tissue Massage",
    category: "massage",
    description: "For those seeking powerful relief from chronic pain and muscle tightness, our Deep Tissue Massage is the definitive solution. Our highly skilled therapists use slow, deliberate strokes and deep pressure to target the inner layers of your muscles and connective tissues. Ideal for athletes and individuals with persistent knots, this is a truly transformative treatment.",
    price: 3500,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7581a5afb_image.png?w=600&q=80",
    alt_text: "Deep tissue massage therapy for chronic pain relief at SERENITY luxury spa - professional treatment in Kolkata"
  },

  // Beauty & Cosmetic Services
  {
    id: 7,
    name: "Lash Extension",
    category: "beauty",
    description: "Achieve breathtaking, natural-looking volume with our premium Lash Extension service in Kolkata. Our master lash artists meticulously apply individual, high-quality synthetic lashes to your own, creating a customized look from subtle enhancement to full-on glamour. Wake up beautiful and save time on your makeup routine.",
    price: 2000,
    duration: "120 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/17af3b19c_image.png?w=600&q=80",
    alt_text: "Professional eyelash extensions application at SERENITY beauty salon Kolkata - dramatic volume lashes"
  },
  {
    id: 8,
    name: "Lash Lift",
    category: "beauty",
    description: "Elevate your natural beauty with a Lash Lift, the ultimate low-maintenance lash solution. This semi-permanent treatment curls your natural lashes from the root, creating the illusion of longer, thicker lashes. The perfect alternative to extensions, it's a must-have service at our Tangra beauty salon.",
    price: 1500,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c88be1d9b_image.png?w=600&q=80",
    alt_text: "Before and after lash lift treatment showing natural curled lashes at SERENITY beauty salon Tangra"
  },
  {
    id: 9,
    name: "Microblading",
    category: "beauty",
    description: "Redefine your arches with our expert Microblading service, the gold standard for flawless eyebrows in Kolkata. Our certified artists use a precise, manual tool to create incredibly fine, hair-like strokes that mimic your natural brow hair. The result is perfectly shaped, fuller-looking brows that are semi-permanent and utterly convincing.",
    price: 6500,
    duration: "180 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/eac0a9a29_image.png?w=600&q=80",
    alt_text: "Expert microblading procedure for natural-looking, fuller eyebrows at SERENITY beauty clinic Kolkata"
  },
  {
    id: 10,
    name: "Microshading",
    category: "beauty",
    description: "For those who prefer a soft, powdered makeup look, our Microshading service is the answer. This advanced technique uses a machine to create pin-point dots of pigment, resulting in a beautifully filled-in, gradient brow. It's ideal for sensitive or oily skin and provides a stunning, long-lasting finish.",
    price: 6500,
    duration: "180 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a13d91e6c_image.png?w=600&q=80",
    alt_text: "Soft, powdered microshading eyebrow tattoo for a gradient brow look at SERENITY Tangra salon"
  },
  {
    id: 11,
    name: "Combine Brows",
    category: "beauty",
    description: "Experience the best of both worlds with our Combine Brows treatment. This hybrid technique masterfully blends the natural, crisp hair-strokes of microblading with the soft, powdered fill of microshading. It's the ultimate solution for achieving brows with beautiful texture, depth, and definition.",
    price: 7500,
    duration: "200 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7b4d0a42b_image.png?w=600&q=80",
    alt_text: "Hybrid microblading and microshading technique for textured, defined eyebrows at SERENITY Beauty Salon"
  },
  {
    id: 12,
    name: "Touch Up",
    category: "beauty",
    description: "Maintain the perfection of your semi-permanent makeup with our essential Touch Up service. This follow-up session is crucial for reinforcing pigment, perfecting shape, and ensuring the longevity of your microblading, microshading, or lip blush investment. Recommended every 12-18 months for lasting beauty.",
    price: 3000,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e4068a7fd_image.png?w=600&q=80",
    alt_text: "Professional touch-up session for semi-permanent makeup at SERENITY luxury beauty studio Kolkata"
  },
  {
    id: 13,
    name: "Lip Neutralisation / Lip Blush",
    category: "beauty",
    description: "Awaken your smile with our Lip Blush service, a revolutionary semi-permanent makeup treatment. We enhance your natural lip shape and colour, correct asymmetries, and give the illusion of fuller, more youthful lips. It's the secret to a perfect pout, 24/7, offered exclusively at our luxury salon in Kolkata.",
    price: 5000,
    duration: "120 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/74b9d8a69_image.png?w=600&q=80",
    alt_text: "Lip blush semi-permanent makeup for enhanced lip color and shape at SERENITY beauty salon Kolkata"
  },

  // Laser Hair Removal
  {
    id: 14,
    name: "Underarm Laser",
    category: "laser",
    description: "Embrace the freedom of flawlessly smooth underarms with our advanced laser hair removal. Using state-of-the-art, pain-free technology, we provide a safe and permanent solution to unwanted hair, ensuring you're confident and ready for any outfit, anytime. Discover the best laser hair removal in Kolkata.",
    price: 1000,
    duration: "30 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fa95b506d_image.png?w=600&q=80",
    alt_text: "Advanced laser hair removal for smooth underarms at SERENITY medical spa in Kolkata"
  },
  {
    id: 15,
    name: "Bikini Laser",
    category: "laser",
    description: "Achieve ultimate confidence with our discreet and professional Bikini Laser hair removal. Our certified technicians use cutting-edge equipment to ensure a comfortable experience and long-lasting, silky-smooth results. Say goodbye to razors and waxing forever at our Tangra wellness center.",
    price: 2000,
    duration: "45 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2788765aa_image.png?w=600&q=80",
    alt_text: "Discreet and effective bikini area laser hair removal for lasting smoothness at SERENITY wellness center"
  },
  {
    id: 16,
    name: "Full Leg Laser",
    category: "laser",
    description: "Experience the luxury of permanently smooth, hair-free legs. Our Full Leg Laser treatment covers both legs from ankle to thigh, using advanced technology to effectively target hair follicles for lasting results. It's a worthy investment in a lifetime of convenience and confidence.",
    price: 2000,
    duration: "90 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f2d4681df_image.png?w=600&q=80",
    alt_text: "Comprehensive full leg laser hair removal for permanent smooth skin at SERENITY clinic Kolkata"
  },
  {
    id: 17,
    name: "Half Leg Laser",
    category: "laser",
    description: "Perfect for targeting either your lower or upper legs, our Half Leg Laser service offers a convenient and effective path to smooth skin. Our advanced laser technology ensures quick sessions and remarkable, permanent hair reduction where you need it most.",
    price: 1500,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/41592e74d_image.png?w=600&q=80",
    alt_text: "Targeted half leg laser hair removal for upper or lower legs at SERENITY spa Tangra"
  },
  {
    id: 18,
    name: "Full Arm Laser",
    category: "laser",
    description: "Enjoy the confidence of beautifully smooth arms all year round. Our Full Arm Laser hair removal service is a safe, effective, and permanent solution to unwanted arm hair, leaving your skin feeling soft and looking flawless from wrist to shoulder.",
    price: 1500,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8ef5399b8_image.png?w=600&q=80",
    alt_text: "Permanent full arm laser hair removal for silky smooth skin at SERENITY aesthetic clinic"
  },
  {
    id: 19,
    name: "Full Face Laser",
    category: "laser",
    description: "Reveal a flawless complexion with our gentle yet effective Full Face Laser treatment. We safely remove unwanted hair from the upper lip, chin, cheeks, and sideburns, resulting in smoother skin and more even makeup application. It's a cornerstone of modern skincare, available at the best salon in Kolkata.",
    price: 1500,
    duration: "45 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9e9f0d824_image.png?w=600&q=80",
    alt_text: "Gentle full face laser hair removal for flawless complexion at SERENITY skincare clinic Kolkata"
  },
  {
    id: 20,
    name: "Full Back Laser",
    category: "laser",
    description: "Achieve a smooth, clear back with our comprehensive Full Back Laser hair removal service. Using powerful and precise laser technology, we effectively target and eliminate unwanted hair from the entire back, giving you the confidence to go backless anytime.",
    price: 2000,
    duration: "75 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a74b83a89_image.png?w=600&q=80",
    alt_text: "Effective full back laser hair removal for men and women at SERENITY aesthetic center Kolkata"
  },
  {
    id: 21,
    name: "Stomach Laser",
    category: "laser",
    description: "Gain confidence in your look with our effective and discreet Stomach Laser hair removal. This treatment safely and permanently removes unwanted hair from the abdominal area, leading to smoother, clearer skin. It's a popular choice at our Tangra luxury spa.",
    price: 2000,
    duration: "45 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/94c56298e_image.png?w=600&q=80",
    alt_text: "Safe and effective stomach laser hair removal for clear skin at SERENITY luxury spa Tangra"
  },
  {
    id: 22,
    name: "Upper Lip Laser",
    category: "laser",
    description: "Address one of the most common beauty concerns with our quick and precise Upper Lip Laser treatment. In just a few minutes, our advanced laser technology effectively removes unwanted hair, providing a long-term solution that's far superior to traditional methods.",
    price: 900,
    duration: "15 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c7a20dcd0_image.png?w=600&q=80",
    alt_text: "Quick and precise upper lip laser hair removal for women at SERENITY beauty clinic Kolkata"
  },
  {
    id: 23,
    name: "Full Body Laser",
    category: "laser",
    description: "Embrace the ultimate in smoothness and convenience with our Full Body Laser hair removal package. This comprehensive treatment offers a permanent solution to unwanted hair from head to toe. It's the most effective and luxurious path to a lifetime of hair-free, carefree living, exclusively at Kolkata's top-rated spa.",
    price: 12999,
    duration: "240 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/de75478b0_image.png?w=600&q=80",
    alt_text: "Ultimate full body laser hair removal package for permanent hair reduction at SERENITY luxury spa"
  },

  // Nail Services
  {
    id: 24,
    name: "Soft Gel Extension",
    category: "nails",
    description: "Achieve elegantly long and natural-looking nails with our Soft Gel Extensions. This modern technique uses a flexible yet durable gel to create lightweight, comfortable, and beautiful extensions that are kinder to your natural nails. Perfect for a sophisticated, lasting manicure.",
    price: 1200,
    duration: "90 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6e5b55054_image.png?w=600&q=80",
    alt_text: "Elegant soft gel nail extensions for natural-looking, durable manicure at SERENITY nail salon Kolkata"
  },
  {
    id: 25,
    name: "Acrylic Extension",
    category: "nails",
    description: "For those who desire dramatic length and ultimate durability, our Acrylic Extensions are the perfect choice. Our expert nail technicians sculpt strong, beautiful nails that are perfect for intricate nail art and a glamorous, long-lasting look. Discover the best acrylics in Kolkata.",
    price: 1500,
    duration: "120 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3cf879beb_image.png?w=600&q=80",
    alt_text: "Durable acrylic nail extensions for length and strength with intricate designs at SERENITY nail art studio"
  },
  {
    id: 26,
    name: "Gel Polish",
    category: "nails",
    description: "Enjoy weeks of flawless, chip-free colour with our premium Gel Polish service. We offer a vast selection of shades from leading brands, all expertly applied and cured under a UV lamp for a high-gloss, incredibly durable finish that outlasts any traditional polish.",
    price: 500,
    duration: "45 min",
    image_url: "https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    alt_text: "Flawless, long-lasting gel polish application with vast color selection at SERENITY nail bar Tangra"
  },
  {
    id: 27,
    name: "Nail Remove",
    category: "nails",
    description: "Ensure the health and integrity of your natural nails with our professional Nail Remove service. We safely and gently remove gel polish, soft gel, or acrylic extensions, finishing with a nourishing treatment to leave your nails clean, healthy, and ready for their next look.",
    price: 150,
    duration: "30 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b2015f12e_image.png?w=600&q=80",
    alt_text: "Professional and safe nail extension removal service to protect natural nails at SERENITY salon"
  },
  {
    id: 28,
    name: "Manicure",
    category: "nails",
    description: "Treat your hands to our classic Manicure, a ritual of grooming and relaxation. This service includes nail shaping, cuticle care, a soothing hand massage with organic lotion, and a flawless polish application. It's an essential act of self-care at our luxury Tangra salon.",
    price: 800,
    duration: "60 min",
    image_url: "https://images.pexels.com/photos/3997378/pexels-photo-3997378.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    alt_text: "Classic manicure service including nail shaping, cuticle care, and hand massage at SERENITY spa Kolkata"
  },
  {
    id: 29,
    name: "Manicure with Whitening Pack",
    category: "nails",
    description: "Elevate your manicure with our exclusive Whitening Pack treatment. This enhanced service combines our classic manicure with a potent, natural whitening mask for your hands, helping to reduce pigmentation and reveal brighter, more even-toned, and youthful-looking skin.",
    price: 1000,
    duration: "75 min",
    image_url: "https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    alt_text: "Luxury manicure with whitening pack for brighter, youthful-looking hands at SERENITY beauty lounge"
  },
  {
    id: 30,
    name: "Pedicure",
    category: "nails",
    description: "Rejuvenate tired, aching feet with our luxurious Pedicure. This essential treatment includes a warm foot soak, exfoliation, nail and cuticle care, callus removal, a relaxing foot and leg massage, and a perfect polish application. Step out with feet that look and feel incredible.",
    price: 1200,
    duration: "75 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2f60c4655_image.png?w=600&q=80",
    alt_text: "Rejuvenating pedicure with foot soak, exfoliation, and massage for tired feet at SERENITY spa Kolkata"
  },
  {
    id: 31,
    name: "Pedicure with Whitening Pack",
    category: "nails",
    description: "Unveil brighter, more beautiful feet with our signature Pedicure with Whitening Pack. This premium service enhances our luxurious pedicure with a specialized natural whitening treatment that targets sun tan and discoloration, leaving your feet looking visibly brighter, softer, and revitalized.",
    price: 1500,
    duration: "90 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/aae76f589_image.png?w=600&q=80",
    alt_text: "Premium pedicure with whitening pack for radiant, smooth feet at SERENITY luxury foot spa"
  },

  // Hair Services
  {
    id: 32,
    name: "Women Hair Cut",
    category: "hair",
    description: "Transform your look with a bespoke Women's Hair Cut from our master stylists in Kolkata. Following a thorough consultation, we will craft a style that perfectly complements your face shape, hair type, and lifestyle, using precision cutting techniques for a flawless finish.",
    price: 800,
    duration: "60 min",
    image_url: "https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    alt_text: "Bespoke women's haircut by master stylists at SERENITY hair salon Kolkata - precision cutting and styling"
  },
  {
    id: 33,
    name: "Men Hair Cut",
    category: "hair",
    description: "Experience the art of modern barbering with our expert Men's Hair Cut. Our stylists are skilled in both classic and contemporary techniques, delivering a sharp, tailored cut that enhances your personal style. Includes a relaxing wash and professional styling.",
    price: 500,
    duration: "45 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/84f23d8d4_image.png?w=600&q=80",
    alt_text: "Expert men's haircut with modern barbering techniques and styling at SERENITY salon for men Kolkata"
  },
  {
    id: 34,
    name: "Hair Wash",
    category: "hair",
    description: "Indulge in the simple luxury of a professional Hair Wash. We use premium, organic shampoos and conditioners suited to your hair type, combined with a relaxing scalp massage to cleanse, nourish, and prepare your hair for styling. A moment of pure bliss.",
    price: 300,
    duration: "30 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/3464539b2_image.png?w=600&q=80",
    alt_text: "Relaxing professional hair wash with organic products and scalp massage at SERENITY salon"
  },
  {
    id: 35,
    name: "Hair Wash & Style",
    category: "hair",
    description: "Perfect for a special occasion or a weekly treat, our Hair Wash & Style service leaves you with a salon-perfect finish. After a luxurious wash and conditioning treatment, our stylists will create a beautiful, lasting blowout or style of your choice, ready for any event.",
    price: 700,
    duration: "60 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/687f41d49_image.png?w=600&q=80",
    alt_text: "Professional hair wash and styling for a perfect blowout or event-ready look at SERENITY salon Kolkata"
  },
  {
    id: 36,
    name: "Hair Perming",
    category: "hair",
    description: "Create beautiful, lasting texture with our expert Hair Perming services. Whether you desire soft, beachy waves or vibrant, bouncy curls, our stylists use advanced, gentle formulas to achieve your desired look while maintaining the health and integrity of your hair. Find the best hair perming in Kolkata here.",
    price: 2500,
    duration: "180 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/92b9aa50d_image.png?w=600&q=80",
    priceNote: "Starting",
    alt_text: "Expert hair perming for soft waves or bouncy curls using gentle formulas at SERENITY hair studio Kolkata"
  },
  {
    id: 37,
    name: "Hair Straightening",
    category: "hair",
    description: "Achieve sleek, frizz-free, and effortlessly manageable hair with our professional Hair Straightening treatments. We offer a range of advanced, long-lasting solutions, including keratin smoothing, to transform unruly hair into a smooth, glossy mane. Consultation recommended.",
    price: 3000,
    duration: "240 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/4162f41a8_image.png?w=600&q=80",
    priceNote: "Starting",
    alt_text: "Professional hair straightening and keratin treatments for sleek, frizz-free hair at SERENITY salon"
  },
  {
    id: 38,
    name: "Hair Colouring",
    category: "hair",
    description: "Express your style with our bespoke Hair Colouring services. From rich, all-over colour to vibrant fashion shades, our expert colorists use premium, low-ammonia products to achieve stunning, luminous results. We are renowned for the best hair colouring services in Kolkata, delivering artistry and hair health.",
    price: 3500,
    duration: "180 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/35023bf1e_image.png?w=600&q=80",
    priceNote: "Starting",
    alt_text: "Premium hair colouring services including balayage and highlights with luminous results at SERENITY Kolkata"
  },
  {
    id: 39,
    name: "Hair Highlight",
    category: "hair",
    description: "Illuminate your hair and add beautiful dimension with our professional Hair Highlighting services. Our colorists are masters of techniques like balayage, foiling, and babylights, creating natural-looking, sun-kissed effects or bold, contrasting looks tailored to you.",
    price: 4000,
    duration: "240 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7615c05a6_image.png?w=600&q=80",
    priceNote: "Starting",
    alt_text: "Professional hair highlighting for dimension and shine with balayage and foiling at SERENITY hair salon"
  },
  {
    id: 40,
    name: "Hair Extension",
    category: "hair",
    description: "Instantly add luxurious length and volume with our premium Hair Extensions. We use only 100% human hair, expertly applied by our certified specialists for a seamless, natural, and comfortable blend. Transform your look in a single session at our Tangra salon.",
    price: 1499,
    duration: "120 min",
    image_url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/27f1f5a0d_image.png?w=600&q=80",
    priceNote: "Starting",
    alt_text: "Luxury hair extensions for added length and volume using 100% human hair at SERENITY salon Tangra"
  },
  {
    id: 41,
    name: "Hair Spa",
    category: "hair",
    description: "Revive and deeply nourish your hair with our signature Hair Spa treatment. This intensive conditioning ritual combines a potent organic hair masque with a relaxing scalp massage and steam therapy to repair damage, restore moisture, and leave your hair incredibly soft, shiny, and healthy.",
    price: 1500,
    duration: "90 min",
    image_url: "https://images.pexels.com/photos/3993324/pexels-photo-3993324.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    priceNote: "Starting",
    alt_text: "Revitalizing hair spa treatment with organic masques and steam therapy for healthy, shiny hair at SERENITY"
  },
  {
    id: 42,
    name: "Keratin Treatment",
    category: "hair",
    description: "Tame frizz and achieve months of smooth, manageable hair with our transformative Keratin Treatment. This protein-based smoothing service infuses your hair with keratin, reducing curl and eliminating frizz for a sleek, glossy finish that significantly cuts down styling time.",
    price: 3000,
    duration: "240 min",
    image_url: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=600&q=80",
    priceNote: "Starting",
    alt_text: "Transformative keratin treatment for smooth, frizz-free, and manageable hair at SERENITY salon Kolkata"
  }
];

const categories = [
  { key: "all", name: "All Services" },
  { key: "massage", name: "Massage Therapy" },
  { key: "beauty", name: "Beauty & Cosmetics" },
  { key: "laser", name: "Laser Hair Removal" },
  { key: "nails", name: "Nail Care" },
  { key: "hair", name: "Hair Services" }
];

export default function Services() {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("all");

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  useEffect(() => {
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl && categories.some(cat => cat.key === categoryFromUrl)) {
      setActiveFilter(categoryFromUrl);
    }
  }, [urlParams]);

  const filteredServices = useMemo(() => {
    return activeFilter === "all" 
      ? servicesData 
      : servicesData.filter(service => service.category === activeFilter);
  }, [activeFilter]);

  const handleServiceBooking = useCallback((service) => {
    window.dispatchEvent(new CustomEvent('open-booking-modal-with-service', { 
      detail: { service } 
    }));
  }, []);

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F8F2EC] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C8A882]/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C8A882]" />
            <span className="text-sm font-medium">Our Services</span>
          </div>
          
          <h1 className="font-serif font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight">
            Premium Spa & Salon Services in Kolkata
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]">
            Discover our comprehensive menu of luxury treatments, performed by certified professionals 
            using state-of-the-art equipment and organic products.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveFilter(category.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeFilter === category.key
                  ? 'bg-[#C8A882] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-[#C8A882]/10 hover:text-[#C8A882] border border-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-[clamp(1rem,2vw,2.5rem)]">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.03, y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg will-change-transform"
            >
              {/* Service Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image_url}
                  alt={service.alt_text}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-[#C8A882] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ₹{service.price.toLocaleString('en-IN')}
                  {service.priceNote && <span className="text-xs ml-1">{service.priceNote}</span>}
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {service.duration}
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-[#0F0F0F] mb-3 group-hover:text-[#C8A882] transition-colors duration-300">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#C8A882] fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(4.9)</span>
                </div>
                
                <button 
                  onClick={() => handleServiceBooking(service)}
                  className="w-full bg-[#C8A882]/10 text-[#C8A882] py-3 rounded-full font-medium hover:bg-[#C8A882] hover:text-white transition-all duration-300 group-hover:shadow-lg flex items-center justify-center gap-2"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-[#C8A882]/20">
            <h2 className="font-serif text-[length:var(--font-h2)] font-bold text-[#0F0F0F] mb-4">
              Ready for Your Transformation?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-[1.618]">
              Book your appointment today and experience the luxury wellness treatments 
              that have made SERENITY the #1 spa in Kolkata.
            </p>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
              className="bg-[#C8A882] text-white px-8 py-4 rounded-full font-medium hover:bg-[#FF5C8D] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Your Experience
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
