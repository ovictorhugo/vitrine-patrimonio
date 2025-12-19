import { Helmet } from "react-helmet";
import { Alert, AlertTitle } from "../ui/alert";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Home, Mail, MapPin } from "lucide-react";
import bg_popup from "../../assets/bg_vitrine.png";
import { getVersion } from "../gerVersion";
import colaboradores from "./colaboradores.json";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ColaboradorCard } from "./components/colaborador-card";
import { useIsMobile } from "../../hooks/use-mobile";
export function Informacoes() {
  const version2 = getVersion();
  const isMobile = useIsMobile();

  return (
    <main className="p-4 md:p-8   text-gray-800 dark:text-gray-100">
      <Helmet>
        <title>Informações | Sistema Patrimônio</title>
        <meta name="description" content={`Informações | Sistema Patrimônio`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="max-w-[936px] mx-auto space-y-8">
        <Alert className="p-0">
          <Alert className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-4 md:p-6 rounded-md">
            <AlertTitle className="text-base font-medium text-gray-600 dark:text-gray-300">
              Informações
            </AlertTitle>
            <Link to="/">
              <Button variant="outline">
                <Home size={16} className="mr-2" />
                Página Inicial
              </Button>
            </Link>
          </Alert>

          <div
            className="p-8 rounded-t-none md:p-12 bg-cover bg-center rounded-md"
            style={{ backgroundImage: `url(${bg_popup})` }}
          >
            <h1 className="text-4xl font-bold mb-2">Sistema Patrimônio</h1>
            <p className="text-sm font-light">
              Versão da plataforma: {version2}
            </p>
          </div>
        </Alert>

        <Alert className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Sobre a plataforma</h2>
          <p className={isMobile ? "text-justify text-sm" : "text-justify"}>
            O Sistema Patrimônio é uma plataforma digital desenvolvida pela
            Escola de Engenharia da UFMG com o objetivo de modernizar e tornar
            mais sustentável a gestão dos bens públicos da instituição.
            Integrada ao Sistema Interno de Controle Patrimonial (SICPAT), a
            ferramenta permite o controle completo do ciclo de vida dos bens,
            desde o inventário até o reaproveitamento ou desfazimento, conforme
            estabelecido pelos Decretos nº 9.373/2018 e nº 10.340/2020. Por meio
            da plataforma, docentes e técnicos administrativos podem cadastrar
            itens ociosos, recuperáveis, antieconômicos ou irrecuperáveis,
            anexando informações e imagens que são validadas pela Seção de
            Patrimônio. Os bens em bom estado ou passíveis de reparo são
            disponibilizados em uma vitrine digital, onde podem ser visualizados
            e solicitados por outros setores da universidade, fomentando a
            reutilização interna e evitando o descarte prematuro de materiais
            ainda úteis. Caso não haja interesse dentro de um período
            determinado, o sistema encaminha automaticamente os itens para os
            fluxos de alienação, doação ou descarte sustentável, garantindo
            rastreabilidade e conformidade com as normas legais.
          </p>
        </Alert>

        <Alert className="p-8">
          <h2 className="text-2xl font-semibold">Vídeos de treinamento</h2>
          <p className={isMobile ? "text-justify text-sm" : "text-justify"}>
            Esses são os colaboradores que, com dedicação, conhecimento e
            espírito de cooperação, tornam possível a construção, evolução e
            aprimoramento contínuo da plataforma.
          </p>

          <div className="mt-8"></div>
        </Alert>

        <Alert className="p-8">
          <h2 className="text-2xl font-semibold">Colaboradores</h2>
          <p className={isMobile ? "text-justify text-sm" : "text-justify"}>
            Esses são os colaboradores que, com dedicação, conhecimento e
            espírito de cooperação, tornam possível a construção, evolução e
            aprimoramento contínuo da plataforma.
          </p>

          <div className="mt-8">
            <ResponsiveMasonry
              columnsCountBreakPoints={{
                350: 1,
                750: 1,
                900: 1,
                1200: 2,
                1500: 2,
              }}
            >
              <Masonry gutter="16px">
                {colaboradores.map((colab) => (
                  <ColaboradorCard colaborador={colab} />
                ))}
              </Masonry>
            </ResponsiveMasonry>
          </div>
        </Alert>

        {/* Abrangência */}
        <Alert className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Suporte</h2>
          <p className="flex gap-2 items-center ">
            <MapPin size={16} /> Av. Pres. Antônio Carlos, 6627 - Pampulha, Belo
            Horizonte - MG, 31270-901
          </p>
          <p className="flex gap-2 items-center ">
            <Mail size={16} />
            patrimonio@eng.ufmg.br
          </p>
        </Alert>
      </div>
    </main>
  );
}
