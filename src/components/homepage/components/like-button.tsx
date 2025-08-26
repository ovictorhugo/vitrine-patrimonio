import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "../../ui/button";
import { useStars } from "../../../context/favorite-context";

interface Props {
  id: string; // único necessário
}

export function LikeButton({ id }: Props) {
  const { favorites, addStar, isLoading } = useStars();

  // liked deriva do contexto: se o id está em favorites, está curtido
  const computeLiked = () => favorites.some((f) => f.id === id);

  const [liked, setLiked] = useState<boolean>(computeLiked());

  // sempre que favorites mudar, sincroniza o estado local
  useEffect(() => {
    setLiked(computeLiked());
  }, [favorites, id]);

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();

    const prevLiked = liked;
    setLiked(!prevLiked);

    try {
      await addStar(id); 
      // "favorite" é um placeholder; ajuste se o backend exigir outro campo.
    } catch {
      // rollback em caso de erro
      setLiked(prevLiked);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      disabled={isLoading}
      className="h-8 text-xs px-2 text-gray-500 dark:text-white flex items-center gap-1"
      title={liked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        size={16}
        className={liked ? "text-pink-600 fill-pink-600" : "text-gray-400"}
      />
    </Button>
  );
}
