import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, usePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Bone,
  Dna,
  Gem,
  Leaf,
  BookOpen,
  Plus,
} from 'lucide-react';

/* ──────────────────────────── DATA ──────────────────────────── */

const chaptersData = [
  { name: 'Age of Dinosaurs', image: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=800&auto=format&fit=crop' },
  { name: 'Fossils of Ancient Life', image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=800&auto=format&fit=crop' },
  { name: 'Reptiles of the Mesozoic', image: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=800&auto=format&fit=crop' },
  { name: 'Marine Fossil Gallery', image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=800&auto=format&fit=crop' },
  { name: 'Prehistoric Giants', image: 'https://images.unsplash.com/photo-1517030330234-94c4fa948ebc?q=80&w=800&auto=format&fit=crop' },
];

/* ──────────────────────── ANIMATION VARIANTS ──────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─────────────── SAND TRANSITION IMAGE COMPONENT ─────────────── */

function SandTransitionImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const imgRef = useRef<HTMLImageElement>(null);
  const filterIdRef = useRef(`sand-${Math.random().toString(36).slice(2, 9)}`);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const offsetRef = useRef<SVGFEOffsetElement>(null);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const matrixRef = useRef<SVGFEColorMatrixElement>(null);

  const animate = useCallback(
    (entering: boolean) => {
      const start = performance.now();
      const duration = 900;

      const step = (now: number) => {
        const elapsed = now - start;
        const raw = Math.min(elapsed / duration, 1);
        const t = entering
          ? 1 - Math.pow(1 - raw, 4)   // quartic ease-out
          : Math.pow(raw, 3);            // cubic ease-in

        const progress = entering ? 1 - t : t;

        if (dispRef.current)
          dispRef.current.setAttribute('scale', String(progress * 150));
        if (offsetRef.current) {
          offsetRef.current.setAttribute(
            'dy',
            String(entering ? progress * -80 : progress * 120)
          );
          offsetRef.current.setAttribute(
            'dx',
            String(entering ? progress * -30 : progress * 30)
          );
        }
        if (blurRef.current)
          blurRef.current.setAttribute('stdDeviation', String(progress * 6));
        if (matrixRef.current) {
          const opacity = Math.max(0, 1 - progress * 1.2);
          matrixRef.current.setAttribute(
            'values',
            `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${opacity} 0`
          );
        }

        if (raw < 1) {
          requestAnimationFrame(step);
        } else if (!entering && safeToRemove) {
          safeToRemove();
        }
      };

      requestAnimationFrame(step);
    },
    [safeToRemove]
  );

  useEffect(() => {
    animate(isPresent);
  }, [isPresent, animate]);

  const filterId = filterIdRef.current;

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feOffset ref={offsetRef} in="displaced" dx="0" dy="0" result="moved" />
            <feGaussianBlur
              ref={blurRef}
              in="moved"
              stdDeviation="0"
              result="blurred"
            />
            <feColorMatrix
              ref={matrixRef}
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={{ filter: `url(#${filterId})` }}
      />
    </>
  );
}

/* ─────────────────────────── APP ─────────────────────────── */

export default function App() {
  const [showVideo, setShowVideo] = useState(false);
  const [activeChapter, setActiveChapter] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* Video delay */
  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), 2800);
    return () => clearTimeout(t);
  }, []);

  /* Auto-cycle chapters */
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % 5);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const navLinks = ['Visit', 'Exhibitions', 'Discover', 'Learn', 'About'];

  return (
    <div className="font-sans bg-[#fcfcfc] text-[#111] overflow-x-hidden">
      {/* ═══════════════════ SECTION 1: HERO ═══════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">
        {/* 1D. BACKGROUND VIDEO */}
        <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source
                  src="https://res.cloudinary.com/dsdxaxkiz/video/upload/v1779624998/magnific_use-img-2-as-the-exact-ba_Piu3X0W42C_wnrc8f.mp4"
                  type="video/mp4"
                />
              </video>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1A. HEADER (NHM Logo) */}
        <motion.header
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
          className="pt-6 px-6 md:px-16 z-20"
        >
          <motion.h1
            variants={{
              initial: { scale: 1.03 },
              animate: {
                scale: 1,
                transition: { staggerChildren: 0.06, delayChildren: 0.1 },
              },
            }}
          >
            <svg viewBox="0 0 840 100" className="w-full fill-[#111]">
              {/* Letter N */}
              <g transform="translate(0,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="0,0 33,0 214,100 181,100" />
              </g>
              {/* Letter H */}
              <g transform="translate(280,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="200,0 214,0 214,100 200,100" />
                <motion.polygon variants={letterBlock} points="14,43 200,43 200,57 14,57" />
              </g>
              {/* Letter M */}
              <g transform="translate(560,0)">
                <motion.polygon variants={letterBlock} points="0,0 14,0 14,100 0,100" />
                <motion.polygon variants={letterBlock} points="266,0 280,0 280,100 266,100" />
                <motion.polygon variants={letterBlock} points="0,0 26,0 153,100 127,100" />
                <motion.polygon variants={letterBlock} points="254,0 280,0 153,100 127,100" />
              </g>
            </svg>
          </motion.h1>

          {/* 1B. SUB-NAV BAR */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-between items-start mt-8 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase"
          >
            {/* Left column */}
            <div className="w-[15%]">
              <p>Natura</p>
              <p>History</p>
              <p>Museum</p>
            </div>

            {/* Arrow separator */}
            <div className="w-[5%] hidden md:flex items-center justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* Center column */}
            <div className="flex-1 md:flex-none md:w-[30%] text-gray-800 leading-relaxed font-mono">
              <span className="hidden md:inline">
                Exploring the story of life<br />
                on earth through science,<br />
                discovery and wonder.
              </span>
              <span className="md:hidden">
                Exploring the story<br />
                of life on earth<br />
                through science,<br />
                discovery and wonder.
              </span>
            </div>

            {/* Arrow separator */}
            <div className="w-[5%] hidden md:flex items-center justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            {/* Right column (desktop nav) */}
            <div className="w-[15%] hidden md:block">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-800 hover:text-black hover:underline transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="z-60 flex flex-col items-end gap-[6px] group cursor-pointer"
              aria-label="Toggle menu"
            >
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? 'w-8 rotate-45 translate-y-[3.75px]'
                    : 'w-8 group-hover:w-6'
                }`}
              />
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 ${
                  isMobileMenuOpen
                    ? 'w-8 -rotate-45 -translate-y-[3.75px]'
                    : 'w-8 group-hover:w-10'
                }`}
              />
            </button>
          </motion.div>
        </motion.header>

        {/* 1C. MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-[#fcfcfc] border-b border-gray-200 shadow-xl px-6 py-8 z-50"
            >
              <ul className="space-y-6 text-sm font-mono tracking-[0.2em] uppercase">
                {navLinks.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-gray-800 hover:text-black hover:underline transition-colors duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1E. LEFT SIDEBAR CONTENT */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } },
          }}
          className="px-10 md:px-16 mt-20 sm:mt-28 md:mt-32 w-[320px] z-10"
        >
          {/* Section indicator */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="text-xs font-mono">01</span>
            <span className="w-16 h-[1.5px] bg-black/20" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1] mb-6"
          >
            TIMELESS
            <br />
            WONDERS
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6] mb-8"
          >
            Step into the natural world and
            <br />
            discover the stories written
            <br />
            millions of years ago.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <a
              href="#explore"
              className="group relative inline-flex items-center gap-3 bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(17,17,17,0.5)] active:translate-y-0 active:shadow-sm"
            >
              {/* Sliding background panel */}
              <span className="absolute inset-0 bg-[#fcfcfc] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />

              {/* Leaf icon */}
              <span className="relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-y-1">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-colors duration-300"
                >
                  <path
                    d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white group-hover:text-[#111] transition-colors duration-300"
                  />
                  <path
                    d="M12 2c3 3 5 7 5 10s-2 7-5 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white group-hover:text-[#111] transition-colors duration-300"
                  />
                  <path
                    d="M2 12h20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white group-hover:text-[#111] transition-colors duration-300"
                  />
                  <path
                    d="M12 2c-3 3-5 7-5 10s2 7 5 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-white group-hover:text-[#111] transition-colors duration-300"
                  />
                </svg>
              </span>

              <span className="relative z-10 text-[15px] font-medium text-white group-hover:text-[#111] transition-colors duration-300">
                Explore Now
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* 1F. RIGHT SIDEBAR (hidden on mobile) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } },
          }}
          className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 w-[200px] mt-12 md:mt-20 hidden md:flex flex-col gap-8 z-10"
        >
          {/* Specimen info */}
          <motion.div variants={fadeUp} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase mb-2">
              Tyrannosaurus Rex
            </h3>
            <p className="text-[12px] text-gray-600 leading-[1.6]">
              Late Cretaceous period
              <br />
              68-66 million years ago
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                Length
              </p>
              <p className="text-[13px] font-medium">12.3 m</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                Height
              </p>
              <p className="text-[13px] font-medium">4.0 m</p>
            </div>
          </motion.div>

          {/* View Details button */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <button className="group/detail w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center transition-all duration-300 hover:border-black hover:bg-[#111] cursor-pointer">
              <Plus
                size={16}
                strokeWidth={1.5}
                className="text-[#111] group-hover/detail:text-white transition-colors duration-300"
              />
            </button>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              View Details
            </span>
          </motion.div>
        </motion.div>

        {/* 1G. BOTTOM-LEFT "SCROLL TO EXPLORE" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 1.2 }}
          className="absolute bottom-10 left-[2.5rem] md:left-[4rem] hidden md:flex items-center gap-4 z-10"
        >
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
            <span className="w-[1px] h-[12px] bg-gray-600" />
            <span className="w-[1px] h-[12px] bg-gray-600" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
            Scroll to explore
          </span>
        </motion.div>
      </section>

      {/* ═══════════════ SECTION 2: EXPLORE OUR WORLD ═══════════════ */}
      <section
        id="explore"
        className="relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc] flex flex-col items-center pt-24 md:pt-32 pb-0 z-20"
      >
        {/* 2A. SECTION LABEL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-12"
        >
          <span className="text-gray-500">[ 02 ] </span>
          <span className="text-gray-900 font-bold uppercase">Explore Our World</span>
        </motion.div>

        {/* 2B. MAIN HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111] max-w-[1000px] text-center px-6 mb-10 md:mb-16"
        >
          Unearth the stories of our planet's
          <br className="hidden md:inline" /> past through fossils, minerals,
          <br className="hidden md:inline" /> and ancient wonders.
        </motion.h2>

        {/* 2C. ACTION PILLS */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
          }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-24 px-6"
        >
          {[
            { icon: Bone, label: 'Dinosaurs' },
            { icon: Dna, label: 'Ancient Life' },
            { icon: Gem, label: 'Minerals' },
            { icon: Leaf, label: 'Fossils' },
            { icon: BookOpen, label: 'Learn More' },
          ].map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 hover:border-black hover:bg-black hover:text-white transition-all duration-300 cursor-pointer"
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </motion.div>

        {/* 2D. SPACER */}
        <div className="min-h-[220px] md:min-h-[450px]" />

        {/* 2E. BOTTOM TEXT */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-8 md:pb-12 pointer-events-none hidden md:flex justify-between">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            WE DON'T JUST TELL STORIES.
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            PALEONTOLOGY © 2026
          </span>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: ANCIENT COLLECTION ═══════════════ */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30">
        {/* 3A. PTERODACTYL IMAGE (Overlapping) */}
        <motion.img
          src="https://images.unsplash.com/photo-1606856521215-954f5018dbb9?q=80&w=1200&auto=format&fit=crop"
          alt="Pterodactyl fossil"
          initial={{ x: '-50%', y: '-65%', opacity: 0 }}
          whileInView={{ x: '-50%', y: '-78%', opacity: 1 }}
          viewport={{ once: true, margin: '100px' }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute top-0 left-1/2 w-[160vw] md:w-[1100px] pointer-events-none z-0"
        />

        {/* 3B. HEADING AREA */}
        <div className="px-8 md:px-16 pt-32 md:pt-48 mb-16 z-10">
          <div className="flex flex-col xl:flex-row justify-between gap-12">
            {/* Left: Main heading */}
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white max-w-[800px]"
            >
              Curated from millions of years of wonder{' '}
              <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4 translate-y-[-4px]">
                {[Bone, Dna, Leaf].map((Icon, i) => (
                  <span
                    key={i}
                    className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 inline-flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
                  >
                    <Icon size={22} />
                  </span>
                ))}
              </span>{' '}
              &amp; discovery.
            </motion.h2>

            {/* Right: Tagline + pills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="flex flex-col items-start xl:items-end"
            >
              <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed">
                WE DON'T JUST DISPLAY FOSSILS
                <br />
                WE SHARE EARTH'S STORY
              </p>
              <div className="flex gap-3 flex-wrap">
                {['Educational', 'Authentic', 'Inspiring'].map((pill) => (
                  <span
                    key={pill}
                    className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3C. TWO-COLUMN PANEL */}
        <div className="h-[1px] bg-gray-800" />
        <div className="flex flex-col md:flex-row z-10">
          {/* Left panel (image) */}
          <div className="relative w-full md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] flex flex-col justify-between p-8 overflow-hidden">
            {/* Top decoration */}
            <span className="text-gray-500 text-xl tracking-[0.3em]">***</span>

            {/* Chapter image */}
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>

            {/* Chapter counter */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#888] uppercase">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChapter}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="text-[#888]"
                >
                  {String(activeChapter + 1).padStart(2, '0')}
                </motion.div>
              </AnimatePresence>
              <span className="text-[#333]">/</span>
              <span>05</span>
            </div>
          </div>

          {/* Right panel (chapter list) */}
          <div className="w-full md:w-[65%] flex flex-col">
            {/* Top bar */}
            <div className="border-b border-gray-800 p-8 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-400 tracking-widest">
                Explore the past. Understand the present.
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-mono text-gray-400 tracking-widest"
                >
                  Chapter {String(activeChapter + 1).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Chapter list */}
            {chaptersData.map((chapter, i) => (
              <button
                key={i}
                onClick={() => setActiveChapter(i)}
                className={`border-b border-gray-800/80 py-8 px-8 flex items-center justify-between cursor-pointer transition-colors duration-300 text-left ${
                  i === activeChapter
                    ? 'text-white'
                    : 'text-[#444] hover:text-[#999]'
                }`}
              >
                <span className="text-2xl md:text-[2rem] font-medium tracking-tight">
                  {chapter.name}
                </span>
                <AnimatePresence>
                  {i === activeChapter && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowUpRight
                        size={22}
                        strokeWidth={1}
                        className="text-gray-400"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        {/* 3D. BOTTOM FOOTER */}
        <div className="h-[1px] bg-gray-800" />
        <div className="px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          DIGGING INTO OUR PLANET'S PAST
        </div>
      </section>
    </div>
  );
}
