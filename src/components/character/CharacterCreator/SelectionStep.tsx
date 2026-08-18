import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';
import { GameIcon } from '../../../game_icons';
import { 
  fetchSpeciesWikiData, fetchSpeciesData,
  fetchClassWikiData, fetchClassData,
  fetchBackgroundData, fetchAlignmentData,
  fetchSubraceData, fetchTraitData, fetchWikiAsset,
  normalizeImageUrl
} from '../../../services/storageService';
import { SpeciesSprite } from '../species/SpeciesSprite';
import { ClassSprite } from '../classes/ClassSprite';
import { BackgroundSprite } from '../backgrounds/BackgroundSprite';
import { ChoiceCard } from './ChoiceCard';
import { DnDMarkdown } from '../../ui/DnDMarkdown';
import { getTraitIcon, getProficiencyIcon } from '../../../lib/atlasUtils';

const STAT_ICONS: Record<string, any> = {
  str: 'str',
  dex: 'dex',
  con: 'con',
  int: 'int',
  wis: 'wis',
  cha: 'cha'
};

export const SelectionStep: React.FC<{
  title: string;
  desc: string;
  items: { name: string; index: string }[];
  selected?: string;
  onSelect: (val: string) => void;
  category: string;
}> = ({ title, desc, items, selected, onSelect, category }) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hydratedTraits, setHydratedTraits] = useState<Record<string, any>>({});
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null);

  // Markdown intro & help state
  const [introMarkdown, setIntroMarkdown] = useState<string>('');
  const [helpMarkdown, setHelpMarkdown] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Load intro and help markdown files based on category
  useEffect(() => {
    const loadMarkdownFiles = async () => {
      let mdCategory = 'species';
      if (category === 'class') mdCategory = 'class';
      else if (category === 'backgrounds') mdCategory = 'background';

      try {
        const [introRes, helpRes] = await Promise.all([
          fetch(`/assets/atlas/markdown/${mdCategory}_choice.md`),
          fetch(`/assets/atlas/markdown/${mdCategory}_help.md`)
        ]);

        if (introRes.ok) {
          const introText = await introRes.text();
          setIntroMarkdown(introText);
        }
        if (helpRes.ok) {
          const helpText = await helpRes.text();
          setHelpMarkdown(helpText);
        }
      } catch (err) {
        console.error('Failed to load markdown files for category:', category, err);
      }
    };

    if (['species', 'class', 'backgrounds'].includes(category)) {
      loadMarkdownFiles();
    }
  }, [category]);

  // Fetch detail data when item selected
  useEffect(() => {
    if (selected) {
      fetchDetail(selected);
    } else {
      setDetailData(null);
    }
  }, [selected, category]);

  const fetchDetail = async (index: string) => {
    setDetailData(null);
    setLoadingDetail(true);
    let data = null;
    let statsData = null;
    try {
      if (category === 'species') {
        data = await fetchSpeciesWikiData(index);
        statsData = await fetchSpeciesData(index);
      } else if (category === 'subrace') {
        data = await fetchSubraceData(index);
        statsData = data;
      } else if (category === 'class') {
        data = await fetchClassWikiData(index);
        statsData = await fetchClassData(index);
      } else if (category === 'backgrounds') {
        data = await fetchBackgroundData(index);
      } else if (category === 'alignments') {
        data = await fetchAlignmentData(index);
      }

      setDetailData({ ...data, stats: statsData });

      // Hydrate traits/proficiencies for tooltips & detailed view
      const traits = (data?.traits || statsData?.traits || statsData?.proficiencies || data?.proficiencies || []).slice(0, 20);
      const traitPromises = traits.map(async (t: any) => {
        const tIndex = t.index || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '_') : '');
        const tUrl = t.url;

        let tData = null;
        if (tUrl && !tUrl.includes('/json/')) {
          if (tUrl.includes('/traits/')) {
            tData = await fetchTraitData(tIndex);
          } else {
            tData = await fetchWikiAsset(tUrl);
          }
        } else if (tIndex) {
          tData = await fetchTraitData(tIndex);
        }

        if (tData) return { id: tIndex || (t.name || t), data: tData };
        return null;
      });

      const results = await Promise.all(traitPromises);
      const traitsMap: Record<string, any> = {};
      results.forEach(r => {
        if (r) traitsMap[r.id] = r.data;
      });
      setHydratedTraits(traitsMap);

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const artUrl = detailData?.imageUrl;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Help Modal Overlay */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6"
            onClick={() => setIsHelpOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-parchment-100 border-2 border-dragon-gold p-6 rounded-sm max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl relative"
              style={{
                backgroundImage: `url('/assets/ui/old_paper.webp')`,
                backgroundSize: 'cover'
              }}
            >
              <button
                onClick={() => setIsHelpOpen(false)}
                className="absolute top-4 right-4 px-2 py-1 bg-dragon-red text-white text-xs font-bold rounded hover:bg-dragon-darkRed transition-colors"
              >
                Close ✕
              </button>
              <DnDMarkdown content={helpMarkdown} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0 p-1">
        {/* Left Selector Panel: 2 Columns for Species, Class, Backgrounds */}
        <div className={cn(
          "overflow-y-auto custom-scrollbar content-start py-2 pr-2 border-r border-dragon-gold/20 shrink-0",
          category === 'alignments' ? "w-full md:w-80 grid grid-cols-3 gap-2" : "w-full md:w-80 lg:w-96 grid grid-cols-2 gap-2"
        )}>
          {items.map(item => {
            const isSelected = selected === item.index;

            return (
              <ChoiceCard
                key={item.index}
                id={item.index}
                name={item.name}
                category={category}
                isSelected={isSelected}
                onSelect={() => onSelect(item.index)}
              />
            );
          })}
        </div>

        {/* Right Central Information / "Examine Records" Panel */}
        <div className="flex-1 bg-white/40 border border-dragon-gold/20 rounded-sm p-4 relative overflow-hidden flex flex-col">
          {/* Panel Header with Title and Help Button */}
          <div className="flex justify-between items-center border-b border-dragon-gold/20 pb-2 mb-3 shrink-0">
            <span className="text-[10px] font-black uppercase text-dragon-darkRed tracking-[0.3em] flex items-center gap-2">
              <GameIcon name="info" size={14} color="#B8860B" />
              {selected ? "Examine Records: " + (detailData?.name || selected) : "Selection Guide & Lore"}
            </span>

            {['species', 'class', 'backgrounds'].includes(category) && (
              <button
                onClick={() => setIsHelpOpen(true)}
                title="View Help & Advice"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-dragon-gold/10 border border-dragon-gold/30 hover:bg-dragon-gold/20 rounded text-[10px] font-black text-dragon-darkRed uppercase tracking-wider transition-colors"
              >
                <GameIcon name="help" size={12} color="#8B0000" fallbackName="info" />
                Help [?]
              </button>
            )}
          </div>

          {/* Panel Body: Show Intro Markdown when NO selection, or Selected Details when item chosen */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <GameIcon name="refresh" color="#B8860B" size={24} className="animate-spin" />
              </div>
            ) : !selected ? (
              /* Initial State: Show Choice Introduction Markdown */
              <div className="py-2 px-1">
                <DnDMarkdown content={introMarkdown} />
              </div>
            ) : detailData ? (
              /* Selected State: Hide Introduction and Show Selected Details */
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex gap-6 items-start border-b border-dragon-gold/20 pb-4 relative">
                  <div className="w-40 h-40 lg:w-48 lg:h-48 bg-dragon-red/5 border-2 border-dragon-gold/20 shadow-md overflow-hidden p-2 shrink-0 rounded-sm relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-paper-texture opacity-30 mix-blend-multiply" />
                    {category === 'species' ? (
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <SpeciesSprite
                          speciesKey={detailData?.index || selected || ''}
                          alt={detailData?.name}
                          fallbackUrl={artUrl ? normalizeImageUrl(artUrl, category, detailData.index) : undefined}
                          className="w-full h-full object-contain drop-shadow-xl"
                        />
                      </div>
                    ) : category === 'class' ? (
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <ClassSprite
                          classKey={detailData?.index || selected || ''}
                          alt={detailData?.name}
                          fallbackUrl={artUrl ? normalizeImageUrl(artUrl, category, detailData.index) : undefined}
                          className="w-full h-full object-contain drop-shadow-xl"
                        />
                      </div>
                    ) : category === 'backgrounds' ? (
                      <div className="w-full h-full flex items-center justify-center relative z-10">
                        <BackgroundSprite
                          backgroundKey={detailData?.index || selected || ''}
                          alt={detailData?.name}
                          fallbackUrl={artUrl ? normalizeImageUrl(artUrl, category, detailData.index) : undefined}
                          className="w-full h-full object-contain drop-shadow-xl"
                        />
                      </div>
                    ) : (
                      <img
                        src={normalizeImageUrl(artUrl, category, detailData.index)}
                        alt={detailData.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain relative z-10 drop-shadow-xl"
                      />
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-4xl lg:text-5xl font-header font-black text-dragon-darkRed uppercase tracking-wide leading-none">
                      {detailData.name}
                    </h3>

                    {/* Category-Specific Quick Stats Grid */}
                    {category === 'species' && (
                      <div className="space-y-2">
                        {/* Ability Score Increases */}
                        {detailData.stats?.ability_bonuses && detailData.stats.ability_bonuses.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase text-parchment-600 tracking-wider">Ability Score Bonus:</span>
                            {detailData.stats.ability_bonuses.map((ab: any, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 bg-dragon-gold/20 border border-dragon-gold/40 rounded text-xs font-black text-dragon-darkRed uppercase">
                                {(ab.ability_score?.name || ab.ability_score?.index || ab.ability_score || '').toUpperCase()} +{ab.bonus}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-dragon-gold/10 border border-dragon-gold/20 p-2 rounded">
                            <span className="text-[9px] font-black uppercase text-parchment-600 tracking-widest block">Size</span>
                            <span className="text-sm font-header font-black text-dragon-darkRed uppercase">{detailData.stats?.size || 'Medium'}</span>
                          </div>
                          <div className="bg-dragon-gold/10 border border-dragon-gold/20 p-2 rounded">
                            <span className="text-[9px] font-black uppercase text-parchment-600 tracking-widest block">Speed</span>
                            <span className="text-sm font-header font-black text-dragon-darkRed uppercase">{detailData.stats?.speed || '30'} ft.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {category === 'class' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-dragon-gold/10 border border-dragon-gold/20 p-2 rounded flex items-center gap-2">
                          <GameIcon name={`d${detailData.stats?.hit_die || '8'}` as any} size={24} className="text-dragon-red" />
                          <div>
                            <span className="text-[9px] font-black uppercase text-parchment-600 tracking-widest block">Hit Die</span>
                            <span className="text-sm font-header font-black text-dragon-darkRed uppercase">D{detailData.stats?.hit_die || '8'}</span>
                          </div>
                        </div>
                        <div className="bg-dragon-gold/10 border border-dragon-gold/20 p-2 rounded">
                          <span className="text-[9px] font-black uppercase text-parchment-600 tracking-widest block">Saving Throws</span>
                          <span className="text-xs font-header font-black text-dragon-darkRed uppercase">
                            {detailData.stats?.saving_throws?.map((s: any) => (s.name || s).toUpperCase()).join(', ') || 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Canonical Species Content Sections */}
                {category === 'species' && detailData.stats && (
                  <div className="space-y-4">
                    {/* Age Section */}
                    {detailData.stats.age && (
                      <div className="p-3 bg-white/60 border border-dragon-gold/20 rounded-sm">
                        <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider mb-1">Age</h4>
                        <p className="text-xs font-body text-parchment-900 leading-relaxed">{detailData.stats.age}</p>
                      </div>
                    )}

                    {/* Alignment Section */}
                    {detailData.stats.alignment && (
                      <div className="p-3 bg-white/60 border border-dragon-gold/20 rounded-sm">
                        <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider mb-1">Alignment Orientation</h4>
                        <p className="text-xs font-body text-parchment-900 leading-relaxed">{detailData.stats.alignment}</p>
                      </div>
                    )}

                    {/* Languages Section */}
                    {(detailData.stats.languages || detailData.stats.language_desc) && (
                      <div className="p-3 bg-white/60 border border-dragon-gold/20 rounded-sm space-y-1">
                        <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider">Languages</h4>
                        {detailData.stats.languages && (
                          <div className="flex gap-1.5 flex-wrap mb-1">
                            {detailData.stats.languages.map((l: any, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-dragon-red/10 text-dragon-red text-[10px] font-black uppercase rounded">
                                {l.name || l.index || l}
                              </span>
                            ))}
                          </div>
                        )}
                        {detailData.stats.language_desc && (
                          <p className="text-xs font-body text-parchment-800 leading-relaxed italic">{detailData.stats.language_desc}</p>
                        )}
                      </div>
                    )}

                    {/* Subraces Section */}
                    {detailData.stats.subraces && detailData.stats.subraces.length > 0 && (
                      <div className="p-3 bg-white/60 border border-dragon-gold/20 rounded-sm">
                        <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider mb-1">Ancestral Subraces</h4>
                        <div className="flex gap-2 flex-wrap">
                          {detailData.stats.subraces.map((sub: any, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-dragon-gold/20 border border-dragon-gold/40 text-dragon-darkRed text-xs font-black uppercase rounded">
                              {sub.name || sub.index || sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Traits List & Descriptions */}
                    {(detailData.stats.traits || detailData.traits) && (
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-black text-dragon-darkRed uppercase tracking-wider flex items-center gap-2">
                          <GameIcon name="award" size={12} color="#8B0000" />
                          Canonical Ancestral Traits
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(detailData.stats.traits || detailData.traits || []).map((t: any, i: number) => {
                            const tName = t.name || t.index || t;
                            const tIndex = t.index || (typeof t === 'string' ? t.toLowerCase().replace(/\s+/g, '_') : '');
                            const traitInfo = hydratedTraits[tIndex] || hydratedTraits[tName?.toLowerCase()];

                            return (
                              <div key={i} className="p-3 bg-dragon-gold/5 border border-dragon-gold/20 rounded-sm space-y-1">
                                <span className="text-xs font-header font-black text-dragon-red uppercase block">
                                  {tName}
                                </span>
                                <p className="text-[11px] font-body text-parchment-800 leading-relaxed">
                                  {traitInfo?.desc ? (Array.isArray(traitInfo.desc) ? traitInfo.desc.join(' ') : traitInfo.desc) : "Ancestral trait granted by lineage."}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Lore / Description Markdown for all categories */}
                <div className="pt-2 border-t border-dragon-gold/20">
                  <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider mb-2">Chronicle & Overview</h4>
                  <DnDMarkdown content={(() => {
                    const desc = detailData.desc || detailData.lore || detailData.description;
                    if (Array.isArray(desc)) return desc.join('\n\n');
                    return typeof desc === 'string' ? desc : "Records for this entry are maintained in the Atlas.";
                  })()} />
                </div>

                {/* Background-Specific Details */}
                {category === 'backgrounds' && detailData.feature && (
                  <div className="p-3 bg-dragon-gold/10 border border-dragon-gold/20 rounded-sm space-y-1">
                    <h4 className="text-[10px] font-black text-dragon-darkRed uppercase tracking-wider">
                      Background Origin Privilege: {detailData.feature.name}
                    </h4>
                    <p className="text-xs font-body text-parchment-900 leading-relaxed italic">
                      {Array.isArray(detailData.feature.desc) ? detailData.feature.desc.join(' ') : detailData.feature.desc}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-6 opacity-40">
                <p className="text-xs font-black uppercase tracking-widest text-dragon-darkRed">Select an item to view records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
