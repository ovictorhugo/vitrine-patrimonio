import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Alert } from "../ui/alert";

export function GaleriaImagens({ images, urlGeral }: { images: any[]; urlGeral: string }) {
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null);

  return (
    <>
      {images?.[0]?.imagens?.map((img: string, index: number) => {
        const imageUrl = `${urlGeral}imagem/${img}`;

        return (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Alert
                onClick={() => setImagemSelecionada(imageUrl)}
                className="bg-center bg-cover bg-no-repeat p-0 h-24 w-24 cursor-pointer"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            </DialogTrigger>
            <DialogContent className="p-0 w-auto min-w-min max-w-max">
              {imagemSelecionada && (
                <img src={imagemSelecionada} alt={`Imagem ${index}`} className=" h-[70vh]  rounded" />
              )}
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}
