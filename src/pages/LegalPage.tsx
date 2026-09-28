import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Truck, RefreshCw } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { POLICIES } from '../content/policies';
import { BUSINESS, gstinConfigured } from '../lib/business';
import type { PolicyKey } from '../types';

type Block = { type: 'list'; items: string[] } | { type: 'para'; text: string };

function groupParagraphs(body: string[]): Block[] {
  const blocks: Block[] = [];
  for (const para of body) {
    if (para.trim().startsWith('• ')) {
      const item = para.replace(/^•\s*/, '');
      const last = blocks[blocks.length - 1];
      if (last && last.type === 'list') last.items.push(item);
      else blocks.push({ type: 'list', items: [item] });
    } else {
      blocks.push({ type: 'para', text: para });
    }
  }
  return blocks;
}

/**
 * LegalPage — renders static policies and the editorial "About Us" page from Figma
 */
const LegalPage: React.FC<{ policy: PolicyKey }> = ({ policy }) => {
  const { navigate } = useRouter();
  const doc = POLICIES[policy] ?? POLICIES.privacy;
  const updated = new Date(BUSINESS.policiesUpdatedAt).toLocaleDateString('en-IN', { dateStyle: 'long' });

  // Custom Figma layout for "About Us" (Figma Mobile 2138:12501 & Desktop 2107:7281)
  if (policy === 'about') {
    return (
      <main className="pt-[80px] md:pt-[96px] bg-white min-h-screen overflow-x-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-3 sm:pt-4 md:pt-6">
          {/* Breadcrumb */}
          <nav className="text-[12px] text-[#8E8A83] mb-5 sm:mb-8 md:mb-10 font-normal">
            <button
              onClick={() => navigate({ name: 'home' })}
              className="hover:text-black transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="mx-2 text-[#E8E4DF]">/</span>
            <span className="text-black font-medium">About Us</span>
          </nav>

          <div className="space-y-6 sm:space-y-12 md:space-y-20 lg:space-y-28">
            {/* ============================================================ */}
            {/* SECTION 1: HERO / FOUNDING STORY (FIGMA FRAME 321 / 383)     */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 lg:gap-14 items-center"
            >
              <div className="w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[0.82/1] overflow-hidden bg-[#F9F8F6]">
                <img
                  src="/figma-assets/about-sec1-portrait.jpg"
                  alt="Founder of Dheerah Designer Boutique"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4 md:px-6">
                <h1 className="font-serif text-[20px] sm:text-[36px] md:text-[54px] lg:text-[76px] xl:text-[96px] font-normal leading-[1.05] tracking-tight text-black mb-2 sm:mb-5 md:mb-8">
                  About Us
                </h1>
                <p className="font-sans text-[10px] sm:text-[13px] md:text-[18px] lg:text-[22px] xl:text-[24px] font-normal leading-[1.45] sm:leading-[1.6] text-black max-w-[520px]">
                  It began with a little girl who loved dresses much, her passion became a dream... she studied Fashion Technology, graduated with medals, and opened her first boutique in 2020.
                </p>
              </div>
            </motion.div>

            {/* ============================================================ */}
            {/* SECTION 2: THE PANDEMIC RESILIENCE (FIGMA FRAME 367 / 316)   */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 lg:gap-14 items-center"
            >
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4 md:px-6">
                <p className="font-sans text-[10px] sm:text-[13px] md:text-[18px] lg:text-[22px] xl:text-[24px] font-normal leading-[1.45] sm:leading-[1.6] text-black max-w-[500px]">
                  Just a month later, the pandemic hit — no sales, no profits. But she held her dream, refusing to give up.
                </p>
              </div>
              <div className="w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[0.75/1] overflow-hidden bg-[#F9F8F6]">
                <img
                  src="/figma-assets/about-sec2-sunflower.jpg"
                  alt="Resilience through challenges"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </motion.div>

            {/* ============================================================ */}
            {/* SECTION 3: NEW BEGINNING (FIGMA FRAME 430 / 321)             */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 lg:gap-14 items-center"
            >
              <div className="w-full aspect-[16/9] sm:aspect-[1.8/1] md:aspect-[1.96/1] overflow-hidden bg-[#F9F8F6]">
                <img
                  src="/figma-assets/about-sec3-landscape.jpg"
                  alt="Dheerah New Beginning"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4 md:px-6">
                <p className="font-sans text-[10px] sm:text-[13px] md:text-[18px] lg:text-[22px] xl:text-[24px] font-normal leading-[1.45] sm:leading-[1.6] text-black max-w-[460px]">
                  Through struggles, an accident, and motherhood, her love for creating never faded — leading to a new beginning: <strong className="font-semibold text-black">Dheerah</strong>.
                </p>
              </div>
            </motion.div>

            {/* ============================================================ */}
            {/* SECTION 4: THE VADAPALANI ATELIER (FIGMA FRAME 431 / 381)    */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-10 lg:gap-14 items-center"
            >
              <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4 md:px-6">
                <p className="font-sans text-[10px] sm:text-[13px] md:text-[18px] lg:text-[22px] xl:text-[24px] font-normal leading-[1.45] sm:leading-[1.6] text-black max-w-[500px]">
                  Named after her son, Dheerah began with 30 outfits in a small Vadapalani store. Today, we proudly dispatch 100+ orders — trusted for quality, fit, and comfort. Try us once.
                </p>
              </div>
              <div className="w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[0.78/1] overflow-hidden bg-[#F9F8F6]">
                <img
                  src="/figma-assets/about-sec4-portrait.jpg"
                  alt="Dheerah handcrafted creations"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 5: BRAND VALUE PROPOSITIONS BAR (FIGMA FRAME 359)    */}
        {/* ============================================================ */}
        <section className="w-full bg-[#CBC4BE] py-10 sm:py-12 md:py-16 mt-14 sm:mt-20 md:mt-28">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-row items-center justify-center gap-12 sm:gap-24 md:gap-36 lg:gap-52">
            {/* Fast Shipping */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 sm:mb-4">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-black stroke-[1.5]" />
              </div>
              <span className="font-sans text-white font-medium text-[10px] sm:text-[11px] md:text-[12px] tracking-[0.18em] uppercase">
                FAST SHIPPING
              </span>
            </div>

            {/* Easy Exchange */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-xs mb-3 sm:mb-4">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black stroke-[1.5]" />
              </div>
              <span className="font-sans text-white font-medium text-[10px] sm:text-[11px] md:text-[12px] tracking-[0.18em] uppercase">
                EASY EXCHANGE
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Standard legal documents
  return (
    <main className="pt-[100px] min-h-screen bg-white">
      <div className="max-w-[820px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-[#8E8A83] mb-4">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-black">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold">{doc.title}</span>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#E8E4DF] rounded-md p-6 md:p-10"
        >
          <h1 className="font-serif text-[26px] md:text-[32px] font-normal text-black">{doc.title}</h1>
          <p className="text-[12px] text-[#8E8A83] mt-1">Last updated {updated}</p>
          <p className="text-[14px] leading-relaxed text-[#2E2E2E] mt-4">{doc.intro}</p>

          <div className="mt-8 space-y-7">
            {doc.sections.map(section => (
              <section key={section.heading}>
                <h2 className="text-[16px] font-semibold text-black mb-2">{section.heading}</h2>
                <div className="space-y-2">
                  {groupParagraphs(section.body).map((block, i) =>
                    block.type === 'list' ? (
                      <ul key={i} className="list-disc pl-5 space-y-1">
                        {block.items.map((l, j) => (
                          <li key={j} className="text-[14px] leading-relaxed text-[#2E2E2E]">{l}</li>
                        ))}
                      </ul>
                    ) : (
                      <p key={i} className="text-[14px] leading-relaxed text-[#2E2E2E]">{block.text}</p>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 pt-5 border-t border-[#E8E4DF] text-[12px] text-[#8E8A83]">
            {BUSINESS.legalName}
            {gstinConfigured() && <> · GSTIN {BUSINESS.gstin}</>}
            {' · '}{BUSINESS.email}
          </div>
        </motion.article>
      </div>
    </main>
  );
};

export default LegalPage;
