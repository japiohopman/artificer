import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Coffee,
  Compass,
  Dice5,
  Github,
  HeartHandshake,
  Map,
  ShieldCheck,
  Sparkles,
  Swords,
  Volume2,
} from 'lucide-react';

import worldMapImage from '../../../docs/screenshots/promo_world_map_wide.png';
import worldPanelImage from '../../../docs/screenshots/promo_world_map_with_panels.png';
import characterImage from '../../../docs/screenshots/promo_character_profile_full.png';
import journalImage from '../../../docs/screenshots/promo_journal.png';
import diceImage from '../../../docs/screenshots/promo_dice_roller.png';
import combatImage from '../../../docs/screenshots/combat_hud_canvas_grid.png';

type SupportSiteProps = {
  onEnterApp: () => void;
};

const featureBlocks = [
  {
    icon: Map,
    title: 'Living World Atlas',
    copy: 'A zoomable campaign map with regions, locations, discovery layers, travel context, weather and time hooks.',
  },
  {
    icon: BookOpen,
    title: 'Campaign Memory',
    copy: 'Journal, quests, bestiary notes and session state in one place, built to become the memory layer for an AI-assisted GM.',
  },
  {
    icon: Swords,
    title: 'Tactical Table',
    copy: 'Grid combat, initiative, tokens and action context for groups that want structure without drowning the table in bookkeeping.',
  },
  {
    icon: Volume2,
    title: 'Atmosphere Engine',
    copy: 'Layered audio and mood systems that can react to scenes, locations and future narration tools.',
  },
];

const supportTiers = [
  {
    label: 'Buy a Coffee',
    price: 'EUR 5',
    detail: 'Tiny fuel for bug fixes, polish passes and better screenshots.',
  },
  {
    label: 'Playtester Patron',
    price: 'EUR 15',
    detail: 'Supports test sessions, feedback loops and public demo preparation.',
  },
  {
    label: 'Founder Seat',
    price: 'EUR 35+',
    detail: 'Helps fund AI tooling, asset cleanup and the first campaign-ready release.',
  },
];

const roadmapItems = [
  'Public demo path with sample party and sample campaign',
  'AI GM tool-call bridge for narration, travel, journal and combat actions',
  'System-neutral content packs and campaign import/export',
  'Creator-facing dev kit for world, NPC, item and encounter generation',
];

export const SupportSite: React.FC<SupportSiteProps> = ({ onEnterApp }) => {
  return (
    <main className="min-h-screen bg-[#11100d] text-[#f7efe1]">
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={worldMapImage}
          alt="Artificer world atlas interface"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,13,0.94)_0%,rgba(17,16,13,0.78)_44%,rgba(17,16,13,0.42)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#11100d] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onEnterApp}
              className="flex items-center gap-3 text-left"
              aria-label="Open Artificer prototype"
            >
              <span className="grid h-10 w-10 place-items-center border border-[#d7b866]/50 bg-black/35 text-[#d7b866]">
                <Sparkles size={20} />
              </span>
              <span>
                <span className="block font-header text-sm font-black uppercase tracking-[0.22em] text-white">
                  Artificer
                </span>
                <span className="block text-xs text-[#d7b866]">All-round GM kit</span>
              </span>
            </button>
            <nav className="hidden items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-white/70 md:flex">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#support" className="transition hover:text-white">Support</a>
              <a href="#roadmap" className="transition hover:text-white">Roadmap</a>
            </nav>
          </header>

          <div className="flex flex-1 items-center py-16">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 border border-[#d7b866]/35 bg-black/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#d7b866]">
                <ShieldCheck size={16} />
                System-neutral tabletop campaign software
              </p>
              <h1 className="font-header text-5xl font-black uppercase leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
                Run bigger worlds with less table chaos.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#efe2c8]">
                Artificer is a campaign control room for game masters: world atlas, character vault,
                journal, dice, tactical combat, inventory, soundscape and AI-ready orchestration in one
                handmade toolkit.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#d7b866] px-5 py-3 font-header text-sm font-black uppercase tracking-[0.16em] text-[#17130c] transition hover:bg-[#f1d989]"
                >
                  Open prototype
                  <ArrowRight size={18} />
                </button>
                <a
                  href="#support"
                  className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/25 bg-black/25 px-5 py-3 font-header text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-white/60 hover:bg-white/10"
                >
                  Support the build
                  <HeartHandshake size={18} />
                </a>
              </div>
              <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-3 text-sm">
                <div className="border-l border-[#d7b866]/45 pl-4">
                  <dt className="font-header text-2xl font-black text-white">7</dt>
                  <dd className="text-white/65">map zoom tiers</dd>
                </div>
                <div className="border-l border-[#d7b866]/45 pl-4">
                  <dt className="font-header text-2xl font-black text-white">AI</dt>
                  <dd className="text-white/65">ready tool core</dd>
                </div>
                <div className="border-l border-[#d7b866]/45 pl-4">
                  <dt className="font-header text-2xl font-black text-white">1</dt>
                  <dd className="text-white/65">GM command desk</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-white/10 bg-[#171510] py-18">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
            <div>
              <p className="font-header text-xs font-black uppercase tracking-[0.24em] text-[#d7b866]">
                What already exists
              </p>
              <h2 className="mt-3 font-header text-4xl font-black uppercase tracking-normal text-white">
                More than a character sheet.
              </h2>
              <p className="mt-4 text-base leading-7 text-white/68">
                The prototype is already a working tabletop cockpit. The fundraiser should sell
                polish, stability, demo content and creator tools, not a vague idea.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featureBlocks.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="border border-white/10 bg-black/18 p-5">
                    <Icon className="mb-5 text-[#d7b866]" size={24} />
                    <h3 className="font-header text-lg font-black uppercase text-white">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/62">{feature.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#11100d] py-18">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
          <figure className="overflow-hidden border border-white/10 bg-black/20">
            <img src={worldPanelImage} alt="World map with GM panels" className="h-72 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/66">World state, map context and location panels.</figcaption>
          </figure>
          <figure className="overflow-hidden border border-white/10 bg-black/20">
            <img src={characterImage} alt="Character profile interface" className="h-72 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/66">Character vault, stats, equipment and progression.</figcaption>
          </figure>
          <figure className="overflow-hidden border border-white/10 bg-black/20 md:col-span-2 lg:col-span-1">
            <img src={journalImage} alt="Campaign journal interface" className="h-72 w-full object-cover" />
            <figcaption className="p-4 text-sm text-white/66">Journal, quests, bestiary and campaign record.</figcaption>
          </figure>
        </div>
      </section>

      <section id="support" className="border-y border-white/10 bg-[#e8dcc6] py-18 text-[#21190f]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <div>
            <p className="font-header text-xs font-black uppercase tracking-[0.24em] text-[#8b5d19]">
              Fundraiser shape
            </p>
            <h2 className="mt-3 font-header text-4xl font-black uppercase tracking-normal">
              Start small, prove it fast.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#4f412c]">
              Begin with a simple support page and coffee-tier backing. Once the demo path is sharp,
              graduate to a Kickstarter-style campaign with a video, playable demo and a clear release
              promise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://www.buymeacoffee.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#21190f] px-5 py-3 font-header text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#3b2a16]"
              >
                <Coffee size={18} />
                Buy Me a Coffee
              </a>
              <a
                href="https://www.kickstarter.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#21190f]/30 px-5 py-3 font-header text-sm font-black uppercase tracking-[0.16em] transition hover:border-[#21190f]"
              >
                Campaign draft
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="grid gap-4">
            {supportTiers.map((tier) => (
              <article key={tier.label} className="border border-[#21190f]/14 bg-white/38 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-header text-lg font-black uppercase">{tier.label}</h3>
                  <span className="shrink-0 border border-[#21190f]/18 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
                    {tier.price}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#5c4b32]">{tier.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="bg-[#11100d] py-18">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:px-10">
          <div>
            <p className="font-header text-xs font-black uppercase tracking-[0.24em] text-[#d7b866]">
              Next public milestones
            </p>
            <h2 className="mt-3 font-header text-4xl font-black uppercase tracking-normal text-white">
              The ask is focused.
            </h2>
            <ul className="mt-6 space-y-4">
              {roadmapItems.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-white/72">
                  <Compass className="mt-1 shrink-0 text-[#d7b866]" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <figure className="overflow-hidden border border-white/10 bg-black/20">
              <img src={diceImage} alt="Digital dice roller" className="h-64 w-full object-cover" />
              <figcaption className="p-4 text-sm text-white/66">3D dice and roll context.</figcaption>
            </figure>
            <figure className="overflow-hidden border border-white/10 bg-black/20">
              <img src={combatImage} alt="Tactical combat grid" className="h-64 w-full object-cover" />
              <figcaption className="p-4 text-sm text-white/66">Tactical grid and action flow.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>Artificer is an independent tabletop campaign toolkit in active development.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 text-white transition hover:text-[#d7b866]"
            >
              Open prototype
              <ArrowRight size={16} />
            </button>
            <a
              href="https://github.com/japiohopman/artificer"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-white transition hover:text-[#d7b866]"
            >
              GitHub
              <Github size={16} />
            </a>
            <span className="inline-flex items-center gap-2">
              <Dice5 size={16} />
              Built for tabletop groups
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
};
