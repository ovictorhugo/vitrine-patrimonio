import React, { useState, useEffect, useContext } from "react";
import { Alert } from "../../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../../ui/carousel";
import { UserContext } from "../../../../context/context";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { User } from "lucide-react";

// Filtro de status
const workflowStatus = "DESFAZIMENTO";

interface Props {
  workflow:string
}

export function CarrosselReviewerDesfazimento({workflow}:Props) {
  const [reviewerData, setReviewerData] = useState<any[]>([]); // Armazena os dados do GET
  const [loading, setLoading] = useState(true); // Controla o estado de carregamento

  const {urlGeral} = useContext(UserContext); // Defina o URL da API aqui
  const token = localStorage.getItem("jwt_token");

  // Obtém os filtros da URL ou do estado global usando a função pickParam
  const sp = new URLSearchParams(window.location.search);
  const q = sp.get("q");
  const materialId = pickParam(sp, "material_ids", "material_id");
  const guardianId = pickParam(sp, "legal_guardian_ids", "legal_guardian_id");
  const locationId = pickParam(sp, "location_ids", "location_id");
  const unitId = pickParam(sp, "unit_ids", "unit_id");
  const agencyId = pickParam(sp, "agency_ids", "agency_id");
  const sectorId = pickParam(sp, "sector_ids", "sector_id");

  useEffect(() => {
    // Função que faz o GET
    const fetchReviewerData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Adicionando os parâmetros de filtro na URL
        if (materialId) params.set("material_id", materialId);
        if (guardianId) params.set("legal_guardian_id", guardianId);
        if (locationId) params.set("location_id", locationId);
        if (unitId) params.set("unit_id", unitId);
        if (agencyId) params.set("agency_id", agencyId);
        if (sectorId) params.set("sector_id", sectorId);
        if (q) params.set("q", q);

        // &workflow_status=${workflowStatus}
        // Monta a URL completa com parâmetros
        const url = `${urlGeral}statistics/catalog/stats/review-commission?workflow_status=${workflow}&${params.toString()}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Verifica se a resposta foi bem-sucedida
        if (!res.ok) throw new Error("Erro ao buscar os dados.");

        const data = await res.json();
        setReviewerData(data); // Atualiza o estado com os dados recebidos
      } catch (error) {
        console.error("Erro ao fazer requisição:", error);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchReviewerData();
  }, [urlGeral, token, materialId, guardianId, locationId, unitId, agencyId, sectorId, q]);

  return (
    <div className="gap-8 pt-0">
      <Carousel className="w-full flex gap-4 px-4 items-center">
        <div className="absolute left-0 z-[9]">
          <CarouselPrevious />
        </div>

        <CarouselContent className="gap-4">
          {loading ? (
            <div>Carregando...</div>
          ) : (
            reviewerData.map(({ reviewer_id, reviewer, total, d0, d3, w1 }) => {
              return (
                <CarouselItem key={reviewer_id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Alert className="p-0">
                    <CardHeader className="flex gap-8 flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm truncate font-medium">{reviewer}</CardTitle>
                     <Avatar className="h-6 w-6 rounded-md">
                          <AvatarImage src={`${urlGeral}user/upload/${reviewer_id}/icon`} />
                          <AvatarFallback className="">
                            <User size={12} />
                          </AvatarFallback>
                        </Avatar>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{total || 0}</div>
                      <p className="text-xs text-muted-foreground">Total de itens avaliados</p>
                    </CardContent>
                  </Alert>
                </CarouselItem>
              );
            })
          )}
        </CarouselContent>

        <div className="absolute right-0 z-[9]">
          <CarouselNext />
        </div>
      </Carousel>
    </div>
  );
}

// Função pickParam para buscar os parâmetros da URL
function pickParam(sp: URLSearchParams, primaryKey: string, fallbackKey: string) {
  const value = sp.get(primaryKey);
  return value ? value : sp.get(fallbackKey);
}
