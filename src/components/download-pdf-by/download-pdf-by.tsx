import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/use-mobile";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { Button } from "../ui/button";

export function DownloadTempFilePage() {
  const { urlGeral } = useContext(UserContext);

  const [loading, setLoading] = useState<boolean>(false);
  const useQuery = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  };
  const query = useQuery();
  const tokenFromUrl = query.get("token");

  useEffect(() => {
    //openDoc();
  }, [urlGeral]);

  async function openDoc() {
    if (tokenFromUrl) {
      const fetchByToken = async () => {
        try {
          const res = await fetch(
            `${urlGeral}temporary_files/download-by-token/${tokenFromUrl}`,
            {
              headers: {
                Accept: "application/pdf",
              },
            },
          );

          if (!res.ok) throw new Error("Erro ao buscar dados do token");

          const blob = await res.blob();
          const pdf = URL.createObjectURL(blob);
          window.open(pdf, "_blank");
          if ((pdf ?? []).length === 0) {
            toast.error("Nada encontrado para gerar o PDF.");
          }
        } catch (error) {
          console.error(error);
          toast.error("Link inválido ou expirado.");
        } finally {
          setLoading(false);
        }
      };

      fetchByToken();
    } else {
    }
  }

  return (
    <main className="flex flex-col items-center gap-16 mt-24">
      <div className="bg-cover bg-no-repeat bg-center w-full">
        <div className="justify-center w-full flex flex-col items-center mb-8">
          <Link
            to={""}
            className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 my-8 py-1 text-sm font-medium"
          >
            <Info size={12} />
            <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
            Faça o download de arquivos PDF enviados por email
          </Link>
          <h1 className="z-[2] text-center max-w-[930px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.3] md:block mb-4">
            Baixe aqui seus documentos gerados pelo{" "}
            <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium animate-pulse">
              Sistema Patrimônio
            </strong>
          </h1>
        </div>
      </div>
      <div>
        <Button size="lg" onClick={openDoc}>
          BAIXAR
        </Button>
      </div>
    </main>
  );
}

export default DownloadTempFilePage;
