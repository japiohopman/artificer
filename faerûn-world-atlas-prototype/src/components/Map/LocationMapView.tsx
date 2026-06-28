import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap, useMapEvents, Polygon, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '../../types';
import { createCustomIcon } from './MarkerIcons';
import { motion, AnimatePresence } from 'motion/react';
import { GameIcon } from '../../game_icons';
import Legend, { CITY_CATEGORIES_LIST } from './Legend';
import { RulerTool } from './RulerTool';
import { useAtlasStore } from '../../store/useAtlasStore';
import { ScaleIndicator } from './ScaleIndicator';

interface LocationMapViewProps {
  cityData: any;
  markers: MapMarker[];
  onMarkerSelect: (marker: MapMarker) => void;
  onMarkerHover?: (marker: MapMarker | null) => void;
  onMapClick?: (coords: [number, number]) => void;
  onMouseMove?: (coords: [number, number]) => void;
  pickingMode?: boolean;
  time?: 'day' | 'night';
  layer?: 'surface' | 'underdark';
  currentMapId: string;
}

function MapEvents({ onMapClick, onMouseMove, pickingMode, onZoomChange }: { 
  onMapClick?: (coords: [number, number]) => void, 
  onMouseMove?: (coords: [number, number]) => void,
  pickingMode?: boolean,
  onZoomChange?: (zoom: number) => void
}) {
  const [hoverCoords, setHoverCoords] = useState<[number, number] | null>(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick?.([lat, lng]);
    },
    mousemove(e) {
      const { lat, lng } = e.latlng;
      setHoverCoords([lat, lng]);
      onMouseMove?.([lat, lng]);
    },
    zoomend() {
      onZoomChange?.(map.getZoom());
    }
  });

  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, []);

  if (!pickingMode || !hoverCoords) return null;

  return null;
}

function MapController({ bounds, selectedMarker }: { bounds: L.LatLngBoundsExpression, selectedMarker: MapMarker | null }) {
  const map = useMap();

  useEffect(() => {
    // Crucial: Leaflet needs to know when its container might have changed size or if it was hidden
    // We add multiple invalidations to handle any race conditions with sidebar animations
    const invalidate = () => {
      map.invalidateSize();
      if (!selectedMarker) {
        map.fitBounds(bounds, { padding: [20, 20], animate: false });
      }
    };
    
    invalidate();
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 500);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, bounds, selectedMarker]);

  useEffect(() => {
    if (selectedMarker && selectedMarker.position) {
      map.flyTo(selectedMarker.position as [number, number], Math.max(map.getZoom(), 2), { duration: 1.5 });
    }
  }, [selectedMarker, map]);

  return null;
}

export const LocationMapView: React.FC<LocationMapViewProps & { 
  activeCategories?: string[]; 
  onToggleCategory?: (id: string) => void;
}> = ({
  cityData,
  markers,
  onMarkerSelect,
  onMarkerHover,
  onMapClick,
  onMouseMove,
  pickingMode,
  time = 'day',
  layer = 'surface',
  activeCategories = [],
  onToggleCategory,
  currentMapId
}) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentHierarchy, setHierarchy } = useAtlasStore();

  const initialBounds = useMemo(() => cityData.bounds || [[0, 0], [1000, 1000]], [cityData.bounds]);
  const mapImage = cityData.mapImage || cityData.submapUrl || cityData.map || "";
  const [imageBounds, setImageBounds] = useState<L.LatLngBoundsExpression>(initialBounds);
  const [hasResolvedNatural, setHasResolvedNatural] = useState(false);

  // Available layers (e.g. from cityData or defaults)
  const availableLayers = useMemo(() => {
    const layers = ["surface"];
    // Default cities might have sewers
    if (cityData.categoryId === 'cities' || currentHierarchy.categoryId === 'cities') {
      layers.push("sewers");
    }
    if (cityData.availableLayers) {
      cityData.availableLayers.forEach((l: string) => {
        if (!layers.includes(l)) layers.push(l);
      });
    }
    return layers;
  }, [cityData, currentHierarchy.categoryId]);

  const activeLayer = currentHierarchy.locationLayer || "surface";

  // Sync with prop changes
  useEffect(() => {
    const propBounds = cityData.bounds || [[0, 0], [1000, 1000]];
    const isGeneric = propBounds[1][0] === 1000 && propBounds[1][1] === 1000;
    
    // Only overwrite if we haven't locked in a natural dimension fix
    if (!isGeneric && !hasResolvedNatural) {
      setImageBounds(propBounds);
    }
  }, [cityData.bounds, hasResolvedNatural]);

  useEffect(() => {
    if (!mapImage) return;
    const img = new Image();
    img.onload = () => {
      const propBounds = cityData.bounds || [[0, 0], [1000, 1000]];
      const isGeneric = propBounds[1][0] === 1000 && propBounds[1][1] === 1000;
      
      const propHeight = propBounds[1][0];
      const propWidth = propBounds[1][1];
      const propAspect = propWidth / propHeight;
      const naturalAspect = img.naturalWidth / img.naturalHeight;
      
      const isInverted = Math.abs(naturalAspect - (1 / propAspect)) < 0.25;

      if (cityData.autoBounds || isGeneric) {
        setImageBounds([[0, 0], [img.naturalHeight, img.naturalWidth]]);
        setHasResolvedNatural(true);
      } else if (isInverted) {
        setImageBounds([[0, 0], [propWidth, propHeight]]);
        setHasResolvedNatural(true);
      }
    };
    img.src = mapImage;
  }, [mapImage, cityData.autoBounds, cityData.bounds]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    markers.forEach(m => cats.add(m.categoryId));
    return CITY_CATEGORIES_LIST.filter(c => cats.has(c.id));
  }, [markers]);

  const selectedMarker = useMemo(() => 
    markers.find(m => m.id === selectedMarkerId), 
    [markers, selectedMarkerId]
  );

  const filteredMarkers = useMemo(() => {
    return markers.filter(m => {
       const mLayer = m.layer || 'surface';
       const matchesSearch = searchQuery === "" || 
         m.popup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         m.categoryId.toLowerCase().includes(searchQuery.toLowerCase());
       const matchesCategory = activeCategories.length === 0 || activeCategories.includes(m.categoryId);
       // If we are in "sewers" layer, only show markers tagged with sewers OR surface markers if we want them as reference (usually not)
       const matchesLayer = activeLayer === 'surface' ? (mLayer === 'surface') : (mLayer === activeLayer);
       return matchesLayer && matchesSearch && matchesCategory;
    });
  }, [markers, activeLayer, searchQuery, activeCategories]);

  const { isRulerMode } = useAtlasStore();

  return (
    <div className="relative w-full h-full bg-[#0F1115] overflow-hidden group font-sans" key={mapImage}>
      <MapContainer
        crs={L.CRS.Simple}
        bounds={imageBounds}
        minZoom={-2}
        maxZoom={4}
        style={{ height: "100%", width: "100%", background: "#0F1115" }}
        attributionControl={false}
        zoomControl={false}
      >
        <ImageOverlay url={mapImage} bounds={imageBounds} noWrap={true} opacity={1} />
        
        <RulerTool active={isRulerMode} />
        
        <MapEvents onMapClick={onMapClick} onMouseMove={onMouseMove} pickingMode={pickingMode} onZoomChange={setZoom} />
        <MapController bounds={imageBounds} selectedMarker={selectedMarker || null} />
        
        <ScaleIndicator mapId={currentMapId} />

        {filteredMarkers.map((marker) => {
          if ((marker.type === 'area' || marker.type === 'line') && marker.path) {
            const pathPositions = marker.path.map((p: [number, number]) => [p[1], p[0]] as [number, number]);
            const isSelected = selectedMarkerId === marker.id;

            if (marker.type === 'line') {
              return (
                <Polyline
                  key={marker.id}
                  positions={pathPositions}
                  pathOptions={{
                    color: isSelected ? '#F59E0B' : '#3B82F6',
                    weight: isSelected ? 4 : 2,
                    opacity: isSelected ? 1 : 0.6,
                    dashArray: marker.categoryId === 'roads_trails' || marker.categoryId === 'roads' ? '5, 10' : '0'
                  }}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setSelectedMarkerId(marker.id || null);
                      onMarkerSelect(marker);
                    },
                    mouseover: () => onMarkerHover?.(marker),
                    mouseout: () => onMarkerHover?.(null)
                  }}
                >
                  <Tooltip 
                    sticky={zoom <= 2} 
                    permanent={zoom > 2} 
                    direction="top" 
                    className="custom-tooltip"
                  >
                    <div className="px-2 py-0.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{marker.popup.title}</span>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            }

            return (
              <Polygon
                key={marker.id}
                positions={pathPositions}
                pathOptions={{
                  fillColor: isSelected ? '#F59E0B' : '#3B82F6',
                  fillOpacity: isSelected ? 0.3 : 0.15,
                  color: isSelected ? '#F59E0B' : '#3B82F6',
                  weight: isSelected ? 2 : 1,
                  dashArray: isSelected ? '5, 5' : '0'
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedMarkerId(marker.id || null);
                    onMarkerSelect(marker);
                  },
                  mouseover: () => onMarkerHover?.(marker),
                  mouseout: () => onMarkerHover?.(null)
                }}
              >
                <Tooltip 
                  sticky={zoom <= 2} 
                  permanent={zoom > 2} 
                  direction="top" 
                  className="custom-tooltip"
                >
                   <div className="px-2 py-0.5">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{marker.popup.title}</span>
                   </div>
                </Tooltip>
              </Polygon>
            );
          }

          const position: L.LatLngExpression = marker.position as [number, number];

          return (
            <Marker
              key={marker.id || `marker-${marker.position[0]}-${marker.position[1]}`}
              position={position}
              icon={createCustomIcon(marker.categoryId, selectedMarkerId === marker.id)}
              zIndexOffset={selectedMarkerId === marker.id ? 1000 : 0}
              eventHandlers={{
                click: () => {
                  setSelectedMarkerId(marker.id || null);
                  onMarkerSelect(marker);
                },
                mouseover: () => onMarkerHover?.(marker),
                mouseout: () => onMarkerHover?.(null)
              }}
            >
              <Tooltip 
                permanent 
                direction="bottom" 
                offset={[0, 10]} 
                className="marker-label-tooltip"
              >
                <span className="text-[9px] font-black uppercase tracking-tighter text-white/90 drop-shadow-md">
                  {marker.popup.title}
                </span>
              </Tooltip>
              <Popup className="custom-map-popup" offset={[0, -10]}>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                      {marker.categoryId.replace(/_/g, ' ')}
                    </div>
                    {marker.subMapId && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
                    )}
                  </div>
                  {marker.popup.image && (
                    <div className="w-full h-24 mb-3 rounded-md overflow-hidden bg-slate-900 border border-white/10">
                      <img 
                        src={marker.popup.image} 
                        alt={marker.popup.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <h3 className="text-base font-bold font-serif text-[#FDFAF3] border-b border-white/10 pb-1.5 mb-2 leading-tight">
                    {marker.popup.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {marker.popup.description}
                  </p>
                  
                  {marker.subMapId && (
                    <div className="pt-2 border-t border-white/5">
                      <div className="bg-blue-600/20 border border-blue-500/40 p-2 rounded text-center group cursor-pointer hover:bg-blue-600/30 transition-all">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
                           Deep traversal possible
                           <GameIcon name="layers" size={10} className="animate-bounce" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Layer Switcher & Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-4 items-end">
        {/* Layer Switcher */}
        {availableLayers.length > 1 && (
          <div className="bg-[#16191E]/90 border border-[#2D3139] p-1.5 rounded-lg shadow-2xl backdrop-blur-md flex gap-1">
            {availableLayers.map(l => (
              <button
                key={l}
                onClick={() => setHierarchy({ locationLayer: l })}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeLayer === l ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <Legend 
          customCategories={availableCategories} 
          activeCategories={activeCategories}
          onToggleCategory={onToggleCategory || (() => {})} 
          loadedCategories={[]}
        />
      </div>
    </div>
  );
};


