import { useContext, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { UserContext } from "../../context/context"
import { useModalResult } from "../hooks/use-modal-result"
import { useLocation, useNavigate } from "react-router-dom"


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export function SelectTypeSearch() {

  const location = useLocation();
  const navigate = useNavigate();

  const resultados = location.pathname == '/resultados'

  const { onOpen } = useModalResult()
  const queryUrl = useQuery()
  const { searchType, setSearchType } = useContext(UserContext)
  let type_search = ''


  return (
    <div className="min-w-max">
      <Select
        defaultValue={searchType}
        value={searchType}
        onValueChange={(value) => {
          setSearchType(value);
          onOpen("researchers-home");

          if(resultados) {
            queryUrl.set('type_search', value);
    navigate({
      pathname: '/resultados',
      search: queryUrl.toString(),
    });
          }
        }}
      >
        <SelectTrigger className="w-full whitespace-nowrap">
          <div className="hidden md:block">
            <SelectValue placeholder="Escolha o tipo de pesquisa" />
          </div>
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectItem value="cod">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-teal-600 flex rounded-sm h-4 w-4"></div> Número de patrimônio
            </div>
          </SelectItem>
          <SelectItem value="atm">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-amber-600 flex rounded-sm h-4 w-4"></div> Código ATM
            </div>
          </SelectItem>
          <SelectItem value="nom">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-indigo-600 flex rounded-sm h-4 w-4"></div> Tipo de patrimônio
            </div>
          </SelectItem>

          <SelectItem value="pes">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-red-600 flex rounded-sm h-4 w-4"></div> Responsável
            </div>
          </SelectItem>

          <SelectItem value="loc">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-lime-600 flex rounded-sm h-4 w-4"></div> Local de guarda
            </div>
          </SelectItem>

          <SelectItem value="dsc">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-fuchsia-600 flex rounded-sm h-4 w-4"></div> Descrição do item
            </div>
          </SelectItem>
         
         
        </SelectContent>
      </Select>

    </div>
  )
}