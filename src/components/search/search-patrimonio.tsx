import { Funnel, MagnifyingGlass } from "phosphor-react";
import { Alert } from "../ui/alert";
import { useModal } from "../hooks/use-modal-store";
import { useContext, useEffect } from "react";
import { UserContext } from "../../context/context";
import { Play, Search, Trash, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useQuery } from "../modal/search-modal-patrimonio";
import { useNavigate } from "react-router-dom";

interface Props{
page:string
}
export function SearchPatrimonio(props:Props) {
  const {onOpen} = useModal()
  const navigate = useNavigate();

  const queryUrl = useQuery();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');

  const { patrimoniosSelecionados, setPatrimoniosSelecionados, searchType, setSearchType} = useContext(UserContext)

  useEffect(() => {
    if (type_search && terms) {
      const termList = terms.split(';').filter(t => t.trim() !== '');

      const selecionados = termList.map(term => ({
        term: term.trim(),
        type: type_search,
      }));

      setSearchType(type_search);
      setPatrimoniosSelecionados(selecionados);
    }
  }, [type_search, terms]); // ou usar algum hook de rota, como useSearchParams do React Router
  

  
  useEffect(() => {
    queryUrl.set('type_search', searchType);

    navigate({
      pathname: props.page,
      search: queryUrl.toString(),
    });
  
    }, [searchType]);

  const handleRemoveItem = (index: number) => {
    

    if(patrimoniosSelecionados.length == 1) {
      queryUrl.set('terms', '');
      navigate({
        pathname: props.page,
        search: queryUrl.toString(),
      });

      setPatrimoniosSelecionados([])
    } else {
       // Copia os selecionados para manipular
  const newItems = [...patrimoniosSelecionados];
  newItems.splice(index, 1); // remove o item da lista

  // Atualiza a URL com a nova lista de termos
  const newTerms = newItems.map(item => item.term).join(';');
  queryUrl.set('terms', newTerms);

  navigate({
    pathname: props.page,
    search: queryUrl.toString(),
  });

  // Por último, atualiza o estado
  setPatrimoniosSelecionados(newItems);
    }


  };
    return(
        <Alert  className="h-14 p-2  mt-4 mb-2  flex items-center justify-between ">
        <div className="flex items-center gap-2 w-full flex-1">
        <div className="w-10 min-w-10">
        <Play size={16} className=" whitespace-nowrap w-10" />
        </div>
        
          <div className="flex w-full">
          <div className='flex w-fit whitespace-nowrap gap-2 items-center'>
          {patrimoniosSelecionados.map((valor, index) => (
           <div key={index} className="flex whitespace-nowrap gap-2 items-center">
            <div
  className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs ${
    valor.type === 'cod'
      ? 'bg-teal-600'
      : valor.type === 'atm'
      ? 'bg-amber-600'
      : valor.type === 'pes'
      ? 'bg-red-600'
      : valor.type === 'loc'
      ? 'bg-lime-600'
       : valor.type === 'dsc'
      ? 'bg-fuchsia-600'
      : 'bg-indigo-600'
  } text-white border-0`}
>

                      {valor.term.replace(/[|;]/g, '')}
                      <X size={12} onClick={() => handleRemoveItem(index)} className="cursor-pointer" />
                    </div>
           </div>
        ))}
                </div>

                <Input onClick={() => onOpen('search-patrimonio')}   type="text" className="border-0 w-full flex flex-1 "/>
          </div>
        </div>

        <div className="flex gap-2 items-center">
       {patrimoniosSelecionados.length > 0 && (
         <Button size={'icon'} variant={'ghost'} onClick={() => {
          setPatrimoniosSelecionados([])

         
        }}><Trash size={16}/></Button>
       )}

<Button
 
  className={`${
    searchType === 'cod'
      ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700'
      : searchType === 'atm'
      ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
      : searchType === 'pes'
      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
      : searchType === 'loc'
      ? 'bg-lime-600 hover:bg-lime-700 dark:bg-lime-600 dark:hover:bg-lime-700'
       : searchType === 'dsc'
      ? 'bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700'
      : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
  } text-white border-0 `}
  size={'icon'}
>
  <Search size={16} className="" />
</Button>
        </div>
      </Alert>
    )
}