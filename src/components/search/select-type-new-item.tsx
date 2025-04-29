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
import { PatrimoniosSelecionados } from "../../App"


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

interface Props {
  itemType:string
  setItemType: (value: string) => void;
  setItensSelecionadosPopUp:React.Dispatch<React.SetStateAction<PatrimoniosSelecionados[]>>;
}

export function SelectTypeNewItem({ itemType, setItemType, setItensSelecionadosPopUp}:Props) {

  const location = useLocation();
  const navigate = useNavigate();

  const resultados = location.pathname == '/dashboard/patrimonios'

  const { onOpen } = useModalResult()
  const queryUrl = useQuery()

  let type_search = ''


  return (
    <div className="min-w-max">
      <Select
        defaultValue={itemType}
        value={itemType}
        onValueChange={(value) => {
          setItemType(value);
          setItensSelecionadosPopUp([])

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

      

    
         
        </SelectContent>
      </Select>

    </div>
  )
}