import { Helmet } from "react-helmet";
import { Alert, AlertTitle } from "../ui/alert";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Home } from "lucide-react";
import bg_popup from '../../assets/bg_vitrine.png';
import { getVersion } from "../gerVersion";
import colaboradores from './colaboradores.json'
export function Informacoes() {
       const version2 = getVersion();



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
          <h1 className="text-4xl font-bold mb-2">
           Sistema Patrimônio
          </h1>
          <p className="text-sm font-light">
            Versão da plataforma: {version2}
          </p>
        </div>
        </Alert>

            <Alert className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Sobre a plataforma</h2>
          <p className="text-justify">
        
          </p>

                 
               
        </Alert>

        
            <Alert className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Colaboradores</h2>
          <p className="text-justify">
        Esses são os colaboradores que, com dedicação, conhecimento e espírito de cooperação, tornam possível a construção, evolução e aprimoramento contínuo da plataforma.
          </p>

          <div>

          </div>

                 
               
        </Alert>

            </div>
            </main>
    )
}