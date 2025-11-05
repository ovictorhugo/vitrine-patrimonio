"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "../../lib";
import { UserContext } from "../../context/context";
import { Image } from "lucide-react";

type CatalogImage = {
  id: string;
  catalog_id: string;
  file_path: string;
};

type ImagesResponse = {
  images: CatalogImage[];
};

type BackgroundAvatarGridProps = {
  height?: number | string;
  cellSize?: number;
  borderColor?: string;
  className?: string;
  maxAvatars?: number;
  intervalMs?: number;
  showBorders?: boolean; // mantido mas agora segue o padrão do primeiro código
};

export function BackgroundAvatarGrid({
  height = 400,
  cellSize = 56,
  borderColor = "var(--cell-border-color, #e4e4e7)",
  className,
  maxAvatars = 10,
  intervalMs = 7000,
  showBorders = true,
}: BackgroundAvatarGridProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);
  const [images, setImages] = useState<CatalogImage[]>([]);
  const [activeCells, setActiveCells] = useState<number[]>([]);
  const [offset, setOffset] = useState(0);

  const { urlGeral } = useContext(UserContext);

  const heightStyle = typeof height === "number" ? `${height}px` : height;
  const totalCells = useMemo(() => rows * cols, [rows, cols]);

  const buildImgUrl = (p: string) => {
    const cleanPath = p.startsWith("/") ? p.slice(1) : p;
    const base = urlGeral.endsWith("/") ? urlGeral : `${urlGeral}`;
    return `${base}${cleanPath}`;
  };

  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;

    const computeGrid = () => {
      const w = el.clientWidth;
      const colsCount = Math.max(1, Math.floor(w / cellSize));
      const hp =
        typeof height === "number"
          ? height
          : el.clientHeight || el.getBoundingClientRect().height || 0;
      const rowsCount = Math.max(1, Math.floor(hp / cellSize));
      setCols(colsCount);
      setRows(rowsCount);
    };

    computeGrid();
    const ro = new ResizeObserver(computeGrid);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cellSize, height]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${urlGeral.replace(/\/$/, "")}/catalog/images`, {
          method: "GET",
          headers: { accept: "application/json" },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ImagesResponse = await res.json();
        setImages(Array.isArray(data?.images) ? data.images : []);
      } catch (e) {
        console.error("Falha ao carregar /catalog/images:", e);
        setImages([]);
      }
    })();
    return () => ac.abort();
  }, [urlGeral]);

  useEffect(() => {
    if (totalCells === 0 || images.length === 0) return;

    const pickCells = () => {
      const n = Math.max(1, Math.min(maxAvatars, totalCells, images.length));
      const chosen = new Set<number>();
      while (chosen.size < n) chosen.add(Math.floor(Math.random() * totalCells));
      setActiveCells(Array.from(chosen));
      setOffset((prev) => (prev + n) % images.length);
    };

    pickCells(); // inicia já
    const id = setInterval(pickCells, intervalMs);
    return () => clearInterval(id);
  }, [totalCells, images, maxAvatars, intervalMs]);

  const cells = useMemo(
    () => Array.from({ length: totalCells }, (_, i) => i),
    [totalCells]
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  const imageForCell = (rank: number) => {
    if (!images.length) return null;
    const index = (offset + rank) % images.length;
    return images[index];
  };

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full overflow-hidden",
        "[--cell-border-color:var(--zinc-300)]",
        "dark:[--cell-border-color:var(--zinc-700)]",
        className
      )}
      style={{ height: heightStyle }}
    >
      <div className="relative z-[1]" style={gridStyle}>
        {cells.map((idx) => {
          const rowIdx = Math.floor(idx / cols);
          const colIdx = idx % cols;

          // ======= LINHAS IGUAIS AO PRIMEIRO CÓDIGO =======
          // Borda apenas interna: sem borda no topo da primeira linha
          // e sem borda à esquerda da primeira coluna.
          const borders: string[] = [];
          if (showBorders) {
            if (rowIdx > 0) borders.push("border-t-[0.5px]");
            if (colIdx > 0) borders.push("border-l-[0.5px]");
          }
          // ================================================

          const isActive = activeCells.includes(idx);
          const rank = isActive ? activeCells.indexOf(idx) : -1;
          const img = isActive ? imageForCell(rank) : null;

          return (
            <div
              key={idx}
              className={cn(
                "relative flex items-center justify-center",
                borders.join(" ")
              )}
              style={{ borderColor }}
            >
              {img ? (
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage
                    src={buildImgUrl(img.file_path)}
                    alt="catalog image"
                    className="object-cover opacity-40"
                  />
                  <AvatarFallback className="rounded-none text-[10px]">
                   
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Gradientes superior/inferior (opcionais) */}
      <div
        className={cn(
          "pointer-events-none absolute top-0 z-[2] left-0 w-full h-2/6",
          "bg-gradient-to-t from-transparent to-neutral-50",
          "dark:to-neutral-900"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 z-[2] left-0 w-full h-2/6",
          "bg-gradient-to-b from-transparent to-neutral-50",
          "dark:to-neutral-900"
        )}
      />
    </div>
  );
}
