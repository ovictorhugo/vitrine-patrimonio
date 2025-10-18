import * as React from "react";
import { icons as LucideMap, ChevronsUpDown } from "lucide-react";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { cn } from "../../../../lib";

type IconPickerProps = {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
};

function toKey(name?: string) {
  if (!name) return undefined;
  const k = name.trim();
  const lower = k[0].toLowerCase() + k.slice(1);
  if ((LucideMap as any)[lower]) return lower;
  if ((LucideMap as any)[k]) return k;
  return undefined;
}

function getIconComponent(name?: string) {
  const key = toKey(name);
  return key ? (LucideMap as any)[key] : null;
}

const ALL_ICON_KEYS = Object.keys(LucideMap).sort();
const PAGE_SIZE = 120;
const SCROLL_THRESHOLD_PX = 64;

export default function IconPicker({
  value,
  onChange,
  placeholder = "Escolha um ícone",
  className,
}: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (open) setVisibleCount(PAGE_SIZE);
  }, [open]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const SelectedIcon = getIconComponent(value);

  const filteredKeys = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICON_KEYS;
    const parts = q.split(/\s+/).filter(Boolean);
    return ALL_ICON_KEYS.filter((k) => parts.every((p) => k.includes(p)));
  }, [query]);

  const pageKeys = React.useMemo(
    () => filteredKeys.slice(0, visibleCount),
    [filteredKeys, visibleCount]
  );

  const gridRef = React.useRef<HTMLDivElement | null>(null);

  const onScroll = React.useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    const remaining = scrollHeight - (scrollTop + clientHeight);
    if (remaining < SCROLL_THRESHOLD_PX && visibleCount < filteredKeys.length) {
      setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredKeys.length));
    }
  }, [filteredKeys.length, visibleCount]);

  React.useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const maybeTopUp = () => {
      if (el.scrollHeight <= el.clientHeight && visibleCount < filteredKeys.length) {
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredKeys.length));
      }
    };
    const id = requestAnimationFrame(maybeTopUp);
    return () => cancelAnimationFrame(id);
  }, [filteredKeys.length, visibleCount, open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-20", className)}
        >
          <span className="flex items-center gap-1 truncate">
            {SelectedIcon ? <SelectedIcon size={16} /> : null}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        // ⚠️ foca manualmente o input ao abrir (com pequeno delay p/ layout estabilizar)
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select?.();
          });
        }}
        // evita fechamento se clicar dentro da área do input (alguns temas/overlays fecham)
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target && inputRef.current && inputRef.current.contains(target)) {
            e.preventDefault();
          }
        }}
        // garante que o conteúdo exista quando o evento rodar
        forceMount
        className="p-0 w-[320px] z-[99]"
      >
        <Command shouldFilter={false}>
         <div className="">
            <CommandInput
              ref={inputRef}         // 👈 ref direto no input
              autoFocus              // 👈 redundante, mas ajuda
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
            />
          </div>
          <CommandList>
            {filteredKeys.length === 0 ? (
              <CommandEmpty>Nenhum ícone encontrado.</CommandEmpty>
            ) : (
              <CommandGroup className="p-0 m-0">
                <div
                  ref={gridRef}
                  onScroll={onScroll}
                  className="grid grid-cols-6 gap-1 p-2 pr-0 max-h-72 overflow-auto"
                >
                  {pageKeys.map((key) => {
                    const IconComp = (LucideMap as any)[key];
                    return (
                      <CommandItem
                        key={key}
                        value={key}
                        onSelect={(val) => {
                          onChange(val);
                          setOpen(false);
                        }}
                        className="cursor-pointer w-full flex items-center justify-center rounded-md aspect-square"
                        title={key}
                        aria-label={key}
                      >
                        <IconComp size={20} />
                      </CommandItem>
                    );
                  })}
                  <div aria-hidden className="col-span-6 h-0.5" />
                </div>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
