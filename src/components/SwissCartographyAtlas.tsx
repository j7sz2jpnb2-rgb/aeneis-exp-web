import React, { useRef, useState } from 'react';
import { Upload, ArrowUpRight, RotateCcw, Layers, MapPin } from 'lucide-react';
import { THREE_MAPS, CartographicMap, MapWaypoint } from '../data/aeneidData';

interface SwissCartographyAtlasProps {
  activeMapId: 'map-mediterranean' | 'map-latium' | 'map-avernus';
  onSelectMap: (id: 'map-mediterranean' | 'map-latium' | 'map-avernus') => void;
  customMapImages: Record<string, string>;
  onUploadCustomMap: (mapId: string, dataUrl: string | null) => void;
  onJumpToBookLine: (bookNumber: number, lineNumber: number) => void;
}

export const SwissCartographyAtlas: React.FC<SwissCartographyAtlasProps> = ({
  activeMapId,
  onSelectMap,
  customMapImages,
  onUploadCustomMap,
  onJumpToBookLine,
}) => {
  const currentMap = THREE_MAPS.find((m) => m.id === activeMapId) || THREE_MAPS[0];
  const [selectedWaypoint, setSelectedWaypoint] = useState<MapWaypoint>(currentMap.waypoints[0]);
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMapSwitch = (map: CartographicMap) => {
    onSelectMap(map.id);
    setSelectedWaypoint(map.waypoints[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCustomMap(currentMap.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderCartographicVector = (map: CartographicMap) => {
    if (map.id === 'map-mediterranean') {
      return (
        <svg viewBox="0 0 1000 560" className="w-full h-full" role="img" aria-label={map.titleZh}>
          <rect width="1000" height="560" fill="currentColor" className="text-white dark:text-zinc-950" />
          {/* Subtle Lat/Long Grid */}
          {showGridOverlay && (
            <g stroke="currentColor" className="text-zinc-100 dark:text-zinc-850" strokeWidth="1">
              {[112, 224, 336, 448].map((y) => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} strokeDasharray="3 3" />
              ))}
              {[166, 332, 498, 664, 830].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="560" strokeDasharray="3 3" />
              ))}
            </g>
          )}
          {/* Minimalist Coastlines in subtle gray */}
          <g fill="#F4F4F5" className="dark:fill-zinc-800" stroke="#18181B" strokeWidth="1.2">
            <path d="M 270 40 L 350 90 L 450 210 L 485 275 L 445 295 L 415 240 L 340 165 L 250 95 Z" />
            <polygon points="340,275 415,270 395,320 335,305" />
            <path d="M 520 60 L 670 60 L 680 230 L 610 285 L 555 210 L 535 140 Z" />
            <rect x="625" y="340" width="110" height="22" />
            <path d="M 790 80 L 980 80 L 980 320 L 820 295 L 785 190 Z" />
            <path d="M 60 440 L 240 365 L 340 385 L 540 455 L 880 480 L 880 560 L 60 560 Z" />
          </g>
          {/* Trajectory */}
          <path
            d="M 840 156 L 720 268 L 675 345 L 560 179 L 380 134 L 360 291 L 270 380 L 360 291 L 380 134"
            fill="none"
            stroke="#18181B"
            strokeWidth="2"
            strokeDasharray="6 4"
            className="dark:stroke-zinc-200"
          />
          <text x="32" y="38" fontSize="10" fontFamily="JetBrains Mono" fill="#A1A1AA" letterSpacing="1.5">
            MAP I · MARE INTERNUM · VOYAGE OF AENEAS
          </text>
        </svg>
      );
    }

    if (map.id === 'map-latium') {
      return (
        <svg viewBox="0 0 1000 560" className="w-full h-full" role="img" aria-label={map.titleZh}>
          <rect width="1000" height="560" fill="currentColor" className="text-white dark:text-zinc-950" />
          {showGridOverlay && (
            <g stroke="currentColor" className="text-zinc-100 dark:text-zinc-850" strokeWidth="1">
              {[112, 224, 336, 448].map((y) => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="560" />
              ))}
            </g>
          )}
          <path
            d="M 160 0 L 245 300 L 385 560 L 1000 560 L 1000 0 Z"
            fill="#F4F4F5"
            className="dark:fill-zinc-800"
            stroke="#18181B"
            strokeWidth="1.2"
          />
          <g fill="none" stroke="#D4D4D8" strokeWidth="1" strokeDasharray="3 3">
            <ellipse cx="580" cy="145" rx="115" ry="65" />
            <ellipse cx="580" cy="145" rx="70" ry="38" />
            <ellipse cx="760" cy="290" rx="140" ry="90" />
          </g>
          {/* Tiber river */}
          <path
            d="M 740 0 C 670 95, 620 140, 580 145 C 510 155, 390 270, 240 302"
            fill="none"
            stroke="#18181B"
            strokeWidth="3.5"
            className="dark:stroke-zinc-300"
          />
          <text x="32" y="38" fontSize="10" fontFamily="JetBrains Mono" fill="#A1A1AA" letterSpacing="1.5">
            MAP II · LATIUM &amp; TIBER DELTA
          </text>
        </svg>
      );
    }

    // Map III: Avernus
    return (
      <svg viewBox="0 0 1000 560" className="w-full h-full" role="img" aria-label={map.titleZh}>
        <rect width="1000" height="560" fill="currentColor" className="text-white dark:text-zinc-950" />
        {showGridOverlay && (
          <g stroke="currentColor" className="text-zinc-100 dark:text-zinc-850" strokeWidth="1">
            {[140, 280, 420].map((y) => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y} />
            ))}
            {[250, 500, 750].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="560" />
            ))}
          </g>
        )}
        <g fill="none" stroke="#18181B" strokeWidth="1.2" className="dark:stroke-zinc-300">
          <circle cx="180" cy="123" r="64" />
          <circle cx="380" cy="252" r="78" strokeDasharray="4 4" />
          <rect x="460" y="310" width="170" height="95" fill="#F4F4F5" className="dark:fill-zinc-800" />
          <circle cx="780" cy="212" r="96" />
        </g>
        <path
          d="M 180 123 L 380 252 L 540 358 L 780 212 L 880 414"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
          strokeDasharray="6 4"
          className="dark:stroke-zinc-200"
        />
        <text x="32" y="38" fontSize="10" fontFamily="JetBrains Mono" fill="#A1A1AA" letterSpacing="1.5">
          MAP III · TOPOGRAPHIA AVERNI ET ELYSII
        </text>
      </svg>
    );
  };

  const customDataUrl = customMapImages[currentMap.id];

  return (
    <section aria-label="三幅史诗地理舆图展厅" className="py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="text-xs font-mono text-zinc-400 tracking-wider mb-2">
            CARTOGRAPHY · 三幅随书地理舆图
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            空间叙事：航海、战局与冥界拓扑
          </h2>
        </div>

        {/* Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800" role="tablist">
          {THREE_MAPS.map((map) => {
            const active = map.id === currentMap.id;
            return (
              <button
                key={map.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleMapSwitch(map)}
                className={`px-3.5 py-1.5 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {map.indexNumber} · {map.titleZh.split('（')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {/* Left 8 Cols: Map Viewport */}
        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{currentMap.indexNumber}</span>
                <span>·</span>
                <span>{currentMap.scopeBooks}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGridOverlay((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-300 whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showGridOverlay ? '隐藏网格' : '显示网格'}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label={`上传${currentMap.titleZh}自定义原图`}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-zinc-900 cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customDataUrl ? '替换原图' : '上传地图'}</span>
                </button>

                {customDataUrl && (
                  <button
                    type="button"
                    onClick={() => onUploadCustomMap(currentMap.id, null)}
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>默认</span>
                  </button>
                )}
              </div>
            </div>

            {/* Map Canvas */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-white dark:bg-zinc-950">
              {customDataUrl ? (
                <img
                  src={customDataUrl}
                  alt={currentMap.titleZh}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              ) : (
                renderCartographicVector(currentMap)
              )}

              {/* Waypoint Pins */}
              {currentMap.waypoints.map((wp) => {
                const isSelected = selectedWaypoint?.id === wp.id;
                return (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => setSelectedWaypoint(wp)}
                    style={{ left: `${wp.xPercent}%`, top: `${wp.yPercent}%` }}
                    aria-label={`坐标 ${wp.code}：${wp.nameZh}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono border transition-transform cursor-pointer ${
                      isSelected
                        ? 'z-20 bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md scale-105'
                        : 'z-10 bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900'
                    }`}
                  >
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="whitespace-nowrap">{wp.nameZh.split(' · ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Placement Strips */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 mr-2">
                  [随文摆放说明]
                </span>
                全书三幅地图预留展位，支持直接上传高精矢量或手绘地图图片替代占位图。
              </div>
              <span className="font-mono text-[11px] text-zinc-400">{currentMap.scopeBooks}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800 text-xs">
              <div className="p-4">
                <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100 font-medium mb-0.5">01. MAP I 随文位</div>
                <div className="text-[11px] text-zinc-400">卷一至卷五左侧停靠，同步特洛伊至迦太基航迹。</div>
              </div>
              <div className="p-4">
                <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100 font-medium mb-0.5">02. MAP II 随文位</div>
                <div className="text-[11px] text-zinc-400">卷七至卷十二战局栏，同步第伯河口与拉丁姆战场。</div>
              </div>
              <div className="p-4">
                <div className="font-mono text-[11px] text-zinc-900 dark:text-zinc-100 font-medium mb-0.5">03. MAP III 随文位</div>
                <div className="text-[11px] text-zinc-400">卷六下冥界独立挂载，阿佛尔努斯九层拓扑。</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Waypoint Detail */}
        <div className="lg:col-span-4 flex flex-col justify-between p-6">
          <div>
            <div className="text-xs font-mono text-zinc-400 mb-1">{currentMap.scopeBooks}</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              {currentMap.titleZh}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 mb-6 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              {currentMap.curatorialNote}
            </p>

            {selectedWaypoint && (
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/50 mb-6">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>{selectedWaypoint.code}</span>
                  <span>{selectedWaypoint.coordinates}</span>
                </div>
                <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  {selectedWaypoint.nameZh}
                </h4>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mb-3">
                  {selectedWaypoint.summary}
                </p>
                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 mb-4 font-normal">
                  {selectedWaypoint.poeticExcerpt}
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToBookLine(selectedWaypoint.bookNumber, selectedWaypoint.lineNumber)}
                  className="btn-opus-primary w-full py-2.5 px-3 text-xs font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>定位至 卷{selectedWaypoint.bookNumber} · 第 {selectedWaypoint.lineNumber} 行</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-mono text-zinc-400 mb-2">
              坐标序列 ({currentMap.waypoints.length} LOCI)
            </div>
            <div className="grid grid-cols-1 gap-1">
              {currentMap.waypoints.map((wp) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => setSelectedWaypoint(wp)}
                  className={`px-3 py-2 text-left text-xs font-mono border flex items-center justify-between transition-colors cursor-pointer ${
                    selectedWaypoint?.id === wp.id
                      ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate">
                    {wp.code} · {wp.nameZh}
                  </span>
                  <span className="text-[10px] text-zinc-400 shrink-0 ml-2">
                    B.{wp.bookNumber}:L.{wp.lineNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
