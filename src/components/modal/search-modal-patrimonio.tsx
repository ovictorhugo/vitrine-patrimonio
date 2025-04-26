import { Funnel, MagnifyingGlass } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { Play, Plus, Search, Trash, X } from "lucide-react";
import { collection, getDocs, getFirestore, where, query, or, and, limit, updateDoc, doc } from "firebase/firestore";
import { PatrimoniosSelecionados } from "../../App";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { SelectTypeSearch } from "../search/select-type-search";

interface Csv {
  bem_cod: string
  bem_dgv: string
  bem_num_atm: string
  mat_nom:string
  type: 'cod' | 'atm' | 'nom' | 'dsc' | 'pes' | 'loc';
  pes_nome:string
  loc_nom:string
  bem_dsc_com:string[]
}

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function SearchModalPatrimonio() {
  const queryUrl = useQuery();
  const {searchType, setSearchType, patrimoniosSelecionados, setPatrimoniosSelecionados} = useContext(UserContext)

     const navigate = useNavigate();
     const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<PatrimoniosSelecionados[]>([])
    const { onClose, isOpen, type } = useModal();
    const isModalOpen = isOpen && type === "search-patrimonio";
    const type_search = queryUrl.get('type_search');
    const terms = queryUrl.get('terms');

    const [input, setInput] = useState("");

    let bemCod = parseInt(input.split('-')[0], 10).toString();
    let bemDgv = input.split('-')[1];

    const handleChange = (value:any) => {

        // Remover caracteres não numéricos
        value = value.replace(/[^0-9]/g, '');
    
        if (value.length > 1) {
          // Inserir "-" antes do último caractere
          value = value.slice(0, -1) + "-" + value.slice(-1);
        }
    
        setInput(value);
      };

        let TypeSearch = type_search ?? ''
       let Terms = terms ?? ''

      const handlePesquisaFinal = () => {
        if (itemsSelecionadosPopUp.length == 0 && input.length == 0) {
          toast("Tente novamente", {
            description: "Selecione ou digite um patrimônio para pesquisa",
            action: {
              label: "Fechar",
              onClick: () => console.log("Fechar"),
            },
          });
          return
        }

        if (itemsSelecionadosPopUp.length > 0) {
          setInput('')
          TypeSearch = searchType
          Terms = itemsSelecionadosPopUp.map(item => item.term).join(';');


          queryUrl.set('terms', Terms.replace(/[()]/g, ''));
          queryUrl.set('type_search', searchType);

          navigate({
            pathname: '/buscar-patrimonio',
            search: queryUrl.toString(),
          });

          onClose()
        } else {
          if (input.length > 0) {
            queryUrl.set('terms', input);
            queryUrl.set('type_search', searchType);
  
            navigate({
              pathname: '/buscar-patrimonio',
              search: queryUrl.toString(),
            });
  
            setInput('')
            onClose()
          }
        }
      };

      useEffect(() => {
        if (terms) {
          const termList: PatrimoniosSelecionados[] = terms
            .split(';')
            .filter(t => t.trim() !== '')
            .map(t => ({
              term: t.trim(),
              type: searchType
            }));
        
          setItensSelecionadosPopUp(termList);
        }
      }, [terms]);

      const handleEnterPress = (event:any) => {
        if (event.key === "Enter") {
          handlePesquisaFinal()
        }
      };

      const normalizeInput = (value: string): string => {
        // Remove acentos e diacríticos
        value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        // Converte para minúsculas
        value = value.toLowerCase();
        // Remove caracteres especiais, mantendo letras, números e espaços
        value = value.replace(/[^a-z0-9\s]/g, "");
        return value;
      };
    

      const handleChangeInput = (value: string) => {
        const normalizedValue = normalizeInput(value);
        console.log(value)
        searchFilesByTermPrefix(value)
        setInput(value)
      }

      const [filteredItems, setFilteredItems] = useState<Csv[]>([]);
      const db = getFirestore();

     
     
      const searchFilesByTermPrefix = async (input: string) => {
        if (input.length < 3) return;
      
        try {
          const filesRef = collection(db, import.meta.env.VITE_BANCO_FIREBASE_SEARCH);
          let results: Csv[] = [];
      
          if (input.includes('-')) {
            const [cod, dgv] = input.split('-');
            const q = query(
              filesRef,
              where('bem_cod', '==', cod),
              where('bem_dgv', '==', dgv),
              limit(100)
            );
            const snapshot = await getDocs(q);
            results = snapshot.docs.map(doc => ({
              ...(doc.data() as Csv),
              type: 'cod'
            }));
          } else {
            const normalizedInput = normalizeInput(input).toUpperCase();
      
            const searchParams: {
              field: keyof Csv;
              value: string;
              type: Csv['type'];
              operator?: 'array-contains' | '>=';
            }[] = [
              { field: 'bem_cod', value: input, type: 'cod', operator: '>=' },
              { field: 'bem_num_atm', value: normalizedInput, type: 'atm', operator: '>=' },
              { field: 'mat_nom', value: normalizedInput, type: 'nom', operator: '>=' },
              { field: 'loc_nom', value: normalizedInput, type: 'loc', operator: '>=' },
              { field: 'bem_dsc_com', value: normalizedInput, type: 'dsc', operator: 'array-contains' },
              { field: 'pes_nome', value: normalizedInput, type: 'pes', operator: '>=' }
            ];
      
            const uniqueByKey = new Set<string>();
            const combinedMap = new Map<string, Csv>();
      
            for (let { field, value, type, operator } of searchParams) {
              let q;
      
              if (operator === 'array-contains') {
                q = query(filesRef, where(field, 'array-contains', value), limit(5000));
              } else {
                q = query(
                  filesRef,
                  where(field, '>=', value),
                  where(field, '<=', value + '\uf8ff'),
                  limit(type === 'nom' ? 5000 : 100)
                );
              }
      
              const snapshot = await getDocs(q);
      
              snapshot.docs.forEach(doc => {
                const data = doc.data() as Csv;
                const key =
                  type === 'nom'
                    ? `${data.mat_nom}`
                    : type === 'dsc'
                    ? `${data.bem_dsc_com}`
                    : type === 'pes'
                    ? `${data.pes_nome}`
                    : type === 'loc'
                    ? `${data.loc_nom}`
                    : `${data.bem_cod}-${data.bem_dgv}`;
      
                if (!uniqueByKey.has(key)) {
                  uniqueByKey.add(key);
                  combinedMap.set(key, { ...data, type });
                }
              });
            }
      
            results = Array.from(combinedMap.values());
          }
      
          const mappedFiles = results.map(file => ({
            bem_num_atm: file.bem_num_atm,
            bem_dgv: file.bem_dgv,
            bem_cod: file.bem_cod,
            bem_dsc_com: file.bem_dsc_com,
            mat_nom: file.mat_nom,
            type: file.type,
            loc_nom: file.loc_nom,
            pes_nome: file.pes_nome,
           
          }));
      
          setFilteredItems(mappedFiles);
        } catch (error) {
          console.error('Erro ao buscar arquivos:', error);
          return [];
        }
      };
      
      
      
      
      console.log(filteredItems)

      const [showInput, setShowInput] = useState(true);
      const inputRef = useRef<HTMLInputElement>(null);
  
      useEffect(() => {
        if (isModalOpen && inputRef.current) {
          inputRef.current.focus();  // Foca no input quando o modal for aberto
        }
      }, [isModalOpen]);  // Este efeito será executado sempre que isModalOpen mudar
    
      const handlePesquisa = (value: string, type: string) => {
        setInput('');
       
        setShowInput(false)
       if (type == searchType) {
        setItensSelecionadosPopUp(prev => [...prev, { term: value, type }]);
       } else {
        setSearchType(type)
        setItensSelecionadosPopUp([{ term: value, type }]);
       }
      }

        //itens selecionados 
  const handleRemoveItem = (index: number) => {
    const newItems = [...itemsSelecionadosPopUp];
    newItems.splice(index, 1);
    setItensSelecionadosPopUp(newItems);
  };

  const normalizeTerm = (term: string) => 
    term
      .normalize("NFD") // Separa acentos das letras
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^\w\s]/gi, "") // Remove caracteres especiais
      .toLowerCase(); // Converte para minúsculas

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}  >
        <DialogContent   className="p-0 border-none min-w-[60vw] bg-transparent dark:bg-transparent">
        <Alert onKeyDown={handleEnterPress}  className="h-14 bg-white p-2 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2 w-full flex-1">
        <div className="w-10 min-w-10">
        <Play size={16} className=" whitespace-nowrap w-10" />
        </div>

        <SelectTypeSearch />
        <ScrollArea className="max-h-[40px] w-full">
        <div className='flex w-full whitespace-nowrap gap-2 items-center'>
        {itemsSelecionadosPopUp.map((valor, index) => (
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
     
        {(itemsSelecionadosPopUp.length >= 1 && !showInput) && (
                  <div
                    className="rounded-full cursor-pointer flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 transition-all"
                    onClick={() => setShowInput(true)}
                  >
                    <Plus size={16} className="" />
                  </div>
                )}
       {(showInput || itemsSelecionadosPopUp.length == 0) && (
                <Input
                  onChange={(e) => handleChangeInput(e.target.value)}
                  type="text"
                  ref={inputRef}
                  value={input}
                  className="border-0 w-full bg-transparent max-h-[40px] h-[40px]  flex-1 p-0  inline-block"
                />
              )}
</div>
<ScrollBar orientation='horizontal'/>
              </ScrollArea>
            </div>

        <div className="w-fit flex gap-2">
        {itemsSelecionadosPopUp.length > 0 && (
              <Button size={'icon'} variant={'ghost'} onClick={() => {
                setItensSelecionadosPopUp([])
              }}><Trash size={16} /></Button>
            )}

<Button
  onClick={() => handlePesquisaFinal()}
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
  } text-white border-0 z-[9999]`}
  size={'icon'}
>
  <Search size={16} className="" />
</Button>

            </div>
        </Alert>

        {((input.length >= 3 && filteredItems.length != 0)) && (
             <Alert className="w-full">
    <ResponsiveMasonry
              columnsCountBreakPoints={{
                350: 1,
                750: 2,
                900: 2,
                1200: 2
              }}
            >
              <Masonry className="max-h-[80vh] md:overflow-y-auto overflow-y-scroll" gutter="20px">
   {filteredItems.filter(item => item.type === 'cod').length !== 0 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Número de patrimônio</p>
    <div className="flex flex-wrap gap-3">
      {filteredItems
        .filter(item => item.type === 'cod')
        .slice(0, 15)
        .map((props, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(`${props.bem_cod}-${props.bem_dgv}`, props.type)}
            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {props.bem_cod}-{props.bem_dgv}
          </div>
        ))}
    </div>
  </div>
)}

{filteredItems.filter(item => item.type === 'atm').length !== 0 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Código ATM</p>
    <div className="flex flex-wrap gap-3">
      {filteredItems
        .filter(item => item.type === 'atm')
        .slice(0, 15)
        .map((props, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(`${props.bem_num_atm}`, props.type)}
            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {props.bem_num_atm}
          </div>
        ))}
    </div>
  </div>
)}

{filteredItems.filter(item => item.type === 'nom').length !== 0 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Tipo de patrimônio</p>
    <div className="flex flex-wrap gap-3">
      {filteredItems
        .filter(item => item.type === 'nom')
        .filter((value, index, self) => 
          index === self.findIndex((t) => (
            normalizeTerm(t.mat_nom) === normalizeTerm(value.mat_nom)
          ))
        )
        .slice(0, 15)
        .map((props, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(`${props.mat_nom}`, props.type)}
            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {props.mat_nom}
          </div>
        ))}
    </div>
  </div>
)}

{filteredItems.filter(item => item.type === 'pes').length !== 0 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Responsável</p>
    <div className="flex flex-wrap gap-3">
      {filteredItems
        .filter(item => item.type === 'pes')
        .filter((value, index, self) => 
          index === self.findIndex((t) => (
            normalizeTerm(t.pes_nome) === normalizeTerm(value.pes_nome)
          ))
        )
        .slice(0, 15)
        .map((props, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(`${props.pes_nome}`, props.type)}
            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {props.pes_nome}
          </div>
        ))}
    </div>
  </div>
)}

{filteredItems.filter(item => item.type === 'loc').length !== 0 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Local de guarda</p>
    <div className="flex flex-wrap gap-3">
      {filteredItems
        .filter(item => item.type === 'loc')
        .filter((value, index, self) => 
          index === self.findIndex((t) => (
            normalizeTerm(t.loc_nom) === normalizeTerm(value.loc_nom)
          ))
        )
        .slice(0, 15)
        .map((props, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(`${props.loc_nom}`, props.type)}
            className="flex gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {props.loc_nom}
          </div>
        ))}
    </div>
  </div>
)}

{filteredItems.filter(item => item.type === 'dsc').length !== 0 && input.length >= 3 && (
  <div>
    <p className="uppercase font-medium text-xs mb-3">Palavras da descrição</p>
    <div className="flex flex-wrap gap-3">
      {Array.from(
        new Set(
          filteredItems
          .filter(item => item.type === 'dsc')
          .flatMap(item => item.bem_dsc_com)
          .flatMap(desc => normalizeTerm(desc).split(/\s+/))
          .filter(word => word.length > 2 && normalizeTerm(word).includes(normalizeTerm(input)))
        )
      )
        .slice(0, 30)
        .map((word, index) => (
          <div
            key={index}
            onClick={() => handlePesquisa(word, 'dsc')}
            className="flex gap-2 min-h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
          >
            {word}
          </div>
        ))}
    </div>
  </div>
)}



            </Masonry>
            </ResponsiveMasonry>
             </Alert>
        )}
            </DialogContent>
        </Dialog>
    )
}