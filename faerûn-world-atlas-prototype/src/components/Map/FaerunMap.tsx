import { MapContainer, ImageOverlay, Marker, Popup, Polyline, Polygon, useMapEvents, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapData, MapMarker } from "../../types";
import { createCustomIcon } from "./MarkerIcons";
import { useEffect, useState } from "react";
import RegionOverlay from "./RegionOverlay";
import { REGION_PATH_REGISTRY, REGION_METADATA } from "../../data/regions";
import { RulerTool } from "./RulerTool";
import { useAtlasStore } from "../../store/useAtlasStore";
import { ScaleIndicator } from "./ScaleIndicator";

interface FaerunMapProps {
  data: MapData;
  time: "day" | "night";
  layer: "surface" | "underdark";
  selectedMarker: MapMarker | null;
  highlightedRegion?: string | null;
  route: MapMarker[];
  onMarkerHover?: (marker: MapMarker | null) => void;
  onRegionHover?: (regionId: string | null) => void;
  onRegionSelect?: (regionId: string) => void;
  onMarkerSelect: (marker: MapMarker) => void;
  onMapClick: (coords: [number, number]) => void;
  onMouseMove?: (coords: [number, number]) => void;
  pickingMode?: boolean;
  currentMapId: string;
}

function MapUpdater({ 
  bounds, 
  mapImage, 
  selectedMarker,
  highlightedRegion
}: { 
  bounds: L.LatLngBoundsExpression, 
  mapImage: string,
  selectedMarker: MapMarker | null,
  highlightedRegion?: string | null
}) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedMarker && selectedMarker.position) {
      // position is already [lat, lng]
      map.flyTo(selectedMarker.position as [number, number], 1, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (highlightedRegion) {
      const metadata = REGION_METADATA[highlightedRegion];
      
      if (metadata?.focalPoint) {
        const [x, y] = metadata.focalPoint;
        map.flyTo([y, x], metadata.zoom || 0.8, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        return;
      }

      if (REGION_PATH_REGISTRY[highlightedRegion]) {
        const path = REGION_PATH_REGISTRY[highlightedRegion];
        const coords: [number, number][] = [];
      const parts = path.split(/(?=[a-df-z])/i);
      
      let curX = 0;
      let curY = 0;
      
      for (const part of parts) {
        const type = part[0].toUpperCase();
        const isRelative = part[0] === part[0].toLowerCase();
        const args = part.slice(1).match(/-?\d*\.?\d+/g)?.map(Number) || [];
        
        if (args.length === 0 && type !== 'Z') continue;

        switch (type) {
          case 'M':
            if (args.length >= 2) {
              if (isRelative) { curX += args[0]; curY += args[1]; }
              else { curX = args[0]; curY = args[1]; }
            }
            break;
          case 'L':
            if (args.length >= 2) {
              if (isRelative) { curX += args[0]; curY += args[1]; }
              else { curX = args[0]; curY = args[1]; }
            }
            break;
          case 'V':
            if (args.length >= 1) {
              if (isRelative) { curY += args[0]; }
              else { curY = args[0]; }
            }
            break;
          case 'H':
            if (args.length >= 1) {
              if (isRelative) { curX += args[0]; }
              else { curX = args[0]; }
            }
            break;
          case 'C':
            // Bezier: handle as a jump to the last point (simplified)
            if (args.length >= 6) {
              if (isRelative) {
                curX += args[4];
                curY += args[5];
              } else {
                curX = args[4];
                curY = args[5];
              }
            }
            break;
          case 'Q':
            if (args.length >= 4) {
              if (isRelative) { curX += args[2]; curY += args[3]; }
              else { curX = args[2]; curY = args[3]; }
            }
            break;
          case 'S':
            if (args.length >= 4) {
              if (isRelative) { curX += args[2]; curY += args[3]; }
              else { curX = args[2]; curY = args[3]; }
            }
            break;
          case 'A':
            if (args.length >= 7) {
              if (isRelative) { curX += args[5]; curY += args[6]; }
              else { curX = args[5]; curY = args[6]; }
            }
            break;
        }
        
        if (!isNaN(curX) && !isNaN(curY)) {
          coords.push([curX, curY]);
        }
      }

      if (coords.length > 0) {
        const minX = Math.min(...coords.map(c => c[0]));
        const maxX = Math.max(...coords.map(c => c[0]));
        const minY = Math.min(...coords.map(c => c[1]));
        const maxY = Math.max(...coords.map(c => c[1]));

        const b = L.latLngBounds(bounds as any);
        const mapMinLat = b.getSouth();
        const mapMaxLat = b.getNorth();
        const mapMinLng = b.getWest();
        const mapMaxLng = b.getEast();

        // transform="matrix(1,0,0,1,-2,0)" shift X by -2
        const tx = (x: number) => mapMinLng + ((x - 2) / 1600) * (mapMaxLng - mapMinLng);
        const ty = (y: number) => mapMaxLat - (y / 1070) * (mapMaxLat - mapMinLat);

        const lat1 = ty(maxY);
        const lng1 = tx(minX);
        const lat2 = ty(minY);
        const lng2 = tx(maxX);

        if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
          console.error("Invalid region bounds calculated:", { lat1, lng1, lat2, lng2, minX, maxX, minY, maxY });
          return;
        }

        const regionBounds = L.latLngBounds([lat1, lng1], [lat2, lng2]);

        map.fitBounds(regionBounds, { 
          padding: [100, 100], 
          animate: true,
          duration: 1.5
        });
      }
    }
  } else {
      // Only fit bounds if no marker or region is selected
      map.fitBounds(bounds, { padding: [20, 20], duration: 1.5 });
    }
  }, [map, mapImage, bounds, selectedMarker, highlightedRegion]);
  
  return null;
}

function MapEvents({ onMapClick, onMouseMove, pickingMode, onZoomChange }: { 
  onMapClick: (coords: [number, number]) => void, 
  onMouseMove?: (coords: [number, number]) => void,
  pickingMode?: boolean,
  onZoomChange?: (zoom: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick([lat, lng]);
    },
    mousemove(e) {
      const { lat, lng } = e.latlng;
      onMouseMove?.([lat, lng]);
    },
    zoomend() {
      onZoomChange?.(map.getZoom());
    }
  });
  
  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, []);

  return null;
}

export default function FaerunMap({
  data,
  layer,
  selectedMarker,
  highlightedRegion,
  route,
  onMarkerHover,
  onRegionHover,
  onRegionSelect,
  onMarkerSelect,
  onMapClick,
  onMouseMove,
  pickingMode,
  currentMapId
}: FaerunMapProps) {
  const [isReady, setIsReady] = useState(false);
  const [zoom, setZoom] = useState(0);
  const { isRulerMode } = useAtlasStore();

  useEffect(() => {
    // Leaflet fix for icons in some environments
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
    setIsReady(true);
  }, []);

const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  if (!isReady) return <div className="w-full h-full bg-[#0F1115] animate-pulse" />;
  
  const bounds = data.bounds as L.LatLngBoundsExpression;

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      minZoom={-4}
      maxZoom={3}
      maxBounds={bounds}
      style={{ height: "100%", width: "100%", background: "#0F1115" }}
      className="faerun-map-container"
      attributionControl={false}
      zoomControl={false}
      doubleClickZoom={false}
    >
      <ImageOverlay url={data.mapImage} bounds={bounds} />
      
      <RulerTool active={isRulerMode} />
      
      {/* Regional Overlays: Hide when zoomed in deeply to focus on locations */}
      {layer === "surface" && zoom < 1.0 && Object.entries(REGION_PATH_REGISTRY).map(([id, path]) => (
        <RegionOverlay 
          key={id}
          id={id}
          path={path}
          bounds={bounds as [[number, number], [number, number]]}
          active={highlightedRegion === id}
          hovered={hoveredRegion === id}
          pickingMode={pickingMode}
          viewBox="0 0 1600 1070" 
          transform="matrix(1,0,0,1,-2,0)"
          onHover={(regId) => {
            setHoveredRegion(regId);
            onRegionHover?.(regId);
          }}
          onClick={(regId) => {
            onRegionSelect?.(regId);
          }}
        />
      ))}
      
      <MapEvents 
        onMapClick={onMapClick} 
        onMouseMove={onMouseMove} 
        pickingMode={pickingMode} 
        onZoomChange={setZoom}
      />
      <MapUpdater bounds={bounds} mapImage={data.mapImage} selectedMarker={selectedMarker} highlightedRegion={highlightedRegion} />
      
      <ScaleIndicator mapId={currentMapId} />

      {/* Render Markers */}
      {data.markers.filter(m => m !== null && m.position).map((marker) => {
          if (marker.type === "area" || marker.type === "path") return null;
          
          const lat = Number(marker.position[0]);
          const lng = Number(marker.position[1]);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for marker ${marker.id || marker.popup.title}: [${lat}, ${lng}]`);
            return null;
          }

          const isSelected = selectedMarker?.id === marker.id;
          const isInRoute = route.some(rm => rm.id === marker.id);
          
          const position: L.LatLngExpression = [lat, lng];
          
          return (
            <Marker
              key={marker.id || `temp-${lat}-${lng}`}
              position={position}
              icon={createCustomIcon(marker.categoryId, isSelected || isInRoute)}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  onMarkerSelect(marker);
                },
                mouseover: () => {
                  onMarkerHover?.(marker);
                },
                mouseout: () => {
                  onMarkerHover?.(null);
                }
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
              <Popup className="custom-map-popup">
                <div className="p-2 min-w-[150px]">
                  <h3 className="text-sm font-bold border-b border-slate-700 pb-1 mb-1">{marker.popup.title}</h3>
                  <p className="text-xs text-slate-400 leading-tight">
                    {marker.popup.description || "No supplemental intel recorded."}
                  </p>
                  
                  {marker.wikiSlug && (
                    <div className="mt-2 flex gap-2">
                       <a 
                        href={`https://forgottenrealms.fandom.com/wiki/${marker.wikiSlug}#History`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] bg-amber-900/40 border border-amber-900/60 px-1.5 py-0.5 rounded text-amber-300 hover:bg-amber-900/60 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                       >
                         WIKI_HISTORY
                       </a>
                       <a 
                        href={`https://forgottenrealms.fandom.com/wiki/${marker.wikiSlug}#Geography`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] bg-emerald-900/40 border border-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                       >
                         WIKI_GEOG
                       </a>
                    </div>
                  )}

                  {marker.subMapId && (
                    <div className="mt-2 text-[10px] text-blue-400 font-bold uppercase tracking-tighter animate-pulse">
                      Transit Available: Regional Hub
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
      })}

      {/* Render Areas/Regions */}
      {data.markers.filter(m => m && (m.polygon || (m.path && (m.type === "area" || m.type === "path")))).map(area => {
           if (area.polygon) {
             const polygonCoords = area.polygon
               .map(p => [Number(p.y), Number(p.x)] as [number, number])
               .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
             
             if (polygonCoords.length < 3) return null;

             return (
               <Polygon
                  key={`poly-${area.id}`}
                  positions={polygonCoords}
                  pathOptions={{
                    color: area.categoryId === 'forest' ? '#166534' : '#3b82f6',
                    fillColor: area.categoryId === 'forest' ? '#14532d' : '#2563eb',
                    fillOpacity: 0.3,
                    weight: 1
                  }}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      onMarkerSelect(area);
                    },
                    mouseover: () => onMarkerHover?.(area),
                    mouseout: () => onMarkerHover?.(null)
                  }}
               >
                 <Popup>
                    <div className="p-1">
                      <h4 className="text-xs font-bold uppercase tracking-tight">{area.popup?.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Area of Interest</p>
                    </div>
                 </Popup>
               </Polygon>
             );
           }

           const validPath = area.path!
             .map(p => [Number(p[1]), Number(p[0])] as [number, number])
             .filter(p => !isNaN(p[0]) && !isNaN(p[1]));

           if (validPath.length < 2) return null;

           return (
             <Polyline 
                key={area.id}
                positions={validPath}
                color={area.categoryId === 'water' ? '#3b82f6' : '#22c55e'}
                weight={2}
                opacity={0.6}
                dashArray={area.categoryId === 'roads_trails' ? '5, 10' : undefined}
             />
           );
      })}

      {/* Render Active Route */}
      {route.length > 1 && (
        <Polyline
          positions={route
            .map(m => [Number(m.position[0]), Number(m.position[1])] as [number, number])
            .filter(p => !isNaN(p[0]) && !isNaN(p[1]))}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
}
