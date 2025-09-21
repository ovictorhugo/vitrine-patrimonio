"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";

interface ImageProps {
  src: string;
  height: number;
  width: number;
  className?: string;
  alt?: string;
  // outras props que você desejar adicionar
}
import { cn } from "../../lib"
import { AnimatePresence, motion } from "framer-motion";

import { useOutsideClick } from "./use-outside-click";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type Card = {
  src: string;
  title: string;
  category: string;

};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto pb-4  scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0   h-auto  w-[5%] overflow-hidden bg-gradient-to-l"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "w-full" // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="last:pr-[5%] md:last:pr-[33%]  rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 absolute bottom-8 right-4 z-[1] ">
        <Button
          size={'icon'}
          variant={'outline'}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ArrowLeft size={16} />
          </Button>
          <Button
          size={'icon'}
          variant={'outline'}
            className="relative flex items-center justify-center disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { onCardClose } = useContext(CarouselContext);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onCardClose(index);
      }}
    >
      {/* Thumb / botão que abre o Dialog */}
      <DialogTrigger asChild>
        <motion.button
          type="button"
          layoutId={layout ? `card-${card.title}` : undefined}
          className="rounded-lg bg-gray-100 dark:bg-neutral-900 h-[400px] w-[600px] md:h-[400px] md:w-[600px] overflow-hidden relative group focus:outline-none "
          aria-label={`Abrir imagem: ${card.title}`}
        >
          <div className="absolute z-[3] h-full top-0 inset-x-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
          <div className="relative p-4 z-[3]">
            {/* espaço para tags/título sobre a thumb, se quiser */}
          </div>

          <BlurImage
            src={card.src}
            alt={card.title}
            height={400}
            width={600}
            className="object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </motion.button>
      </DialogTrigger>

      {/* Conteúdo do Dialog */}
      <DialogContent
        // remove padding padrão e aumenta largura
        className="p-0  overflow-hidden w-auto "
      >
        {/* Botão de fechar flutuante */}
     

     

        {/* Área da imagem */}
        <div className="w-full max-h-[85vh] flex items-center justify-center ">
    <img
      src={card.src}
      alt={card.title}
      className="max-h-[85vh] max-w-full object-contain"
    />
  </div>
      </DialogContent>
    </Dialog>
  );
};
export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);

  return (
    <img
      className={cn(
        "transition duration-300 h-full w-full",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    
      {...rest}
    />
  );
};