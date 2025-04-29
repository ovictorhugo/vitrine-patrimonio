import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useQuery } from '../modal/search-modal-patrimonio';
import { useLocation, useNavigate } from 'react-router-dom';

interface Csv {
  bem_cod: string;
  bem_dgv: string;
  bem_num_atm: string;
  mat_nom: string;
  loc_nom: string;
  bem_dsc_com: string;
  pes_nome: string;
  type: string;
}

export function HeaderResult() {
  const db = getFirestore();
  const { patrimoniosSelecionados, setPatrimoniosSelecionados, searchType } = useContext(UserContext);
  const [filteredItems, setFilteredItems] = useState<Csv[]>([]);
  const [prefix, setPrefix] = useState<string>(''); // Adicionando state para o prefix

  const normalizeInput = (value: string): string => {
    value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    value = value.toLowerCase();
    value = value.replace(/[()|;]/g, '');
    value = value.replace(/[^a-z0-9]/g, '');
    return value;
  };

  const searchFilesByTermPrefix = async (input: string) => {
    if (input.length < 3) return [];

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
          type: string;
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

        for (const { field, value, type, operator } of searchParams) {
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

      return results;
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchFilteredItems = async () => {
      setFilteredItems([]);
      let allResults: Csv[] = [];

      for (const item of patrimoniosSelecionados) {
        const normalizedValue = normalizeInput(item.term);
        const prefixValue = normalizedValue.slice(0, 3); // Capturando prefixo
        setPrefix(prefixValue); // Atualizando o estado do prefixo
        console.log('prefix', prefixValue);
        const results = await searchFilesByTermPrefix(prefixValue);
        allResults = [...allResults, ...results];
      }

      console.log('filter', allResults);

      const filtered = allResults.filter(
        (result) =>
          !patrimoniosSelecionados.some(
            (item) =>
              normalizeInput(item.term) ===
              normalizeInput(result.mat_nom || result.loc_nom || result.bem_cod || result.pes_nome || '')
          )
      );

      setFilteredItems(filtered);
    };

    fetchFilteredItems();
  }, [patrimoniosSelecionados]);

  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeTerm = (term: string) =>
    term
      .normalize('NFD') // Separa acentos das letras
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
      .toLowerCase(); // Converte para minúsculas

  return (
    <div>
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1">
          <ScrollArea>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <p className="text-sm font-medium">Sugestões:</p>
                    {searchType === 'dsc' ? (
                      // Renderização especial para 'dsc'
                      filteredItems.filter(item => item.type === 'dsc').length !== 0 && (
                        <>
                          {Array.from(
                            new Set(
                              filteredItems
                                .filter(item => item.type === 'dsc')
                                .flatMap(item => item.bem_dsc_com)
                                .flatMap(desc => normalizeTerm(desc).split(/\s+/))
                                .filter(word => word.length > 2 && normalizeTerm(word).includes(normalizeTerm(prefix)))
                            )
                          )
                            .slice(0, 30)
                            .map((word, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  queryUrl.set('terms', word);
                                  queryUrl.set('type_search', 'dsc');
                                  navigate({
                                    pathname: location.pathname,
                                    search: queryUrl.toString(),
                                  });
                                  setPatrimoniosSelecionados([{ term: word, type: 'dsc' }]);
                                }}
                                className="flex gap-2 min-h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                              >
                                {word}
                              </div>
                            ))}
                        </>
                      )
                    ) : (
                      // Renderização normal para outros tipos
                      Array.from(
                        new Map(
                          filteredItems.map((props) => {
                            let term = '';

                            // Escolhendo o campo de acordo com searchType
                            switch (searchType) {
                              case 'cod':
                                term = props.bem_cod && props.bem_dgv ? `${props.bem_cod}-${props.bem_dgv}` : props.bem_cod || '';
                                break;
                              case 'atm':
                                term = props.bem_num_atm || '';
                                break;
                              case 'loc':
                                term = props.loc_nom || '';
                                break;
                              case 'pes':
                                term = props.pes_nome || '';
                                break;
                              case 'nom':
                                term = props.mat_nom || '';
                                break;
                              default:
                                term = '';
                            }

                            const key = `${term}-${props.type || ''}`; // chave única com term + type
                            return [key, { term, type: props.type }];
                          })
                        ).values()
                      )
                        .slice(0, 6)
                        .map(({ term, type }, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              queryUrl.set('terms', term);
                              queryUrl.set('type_search', searchType);
                              navigate({
                                pathname: location.pathname,
                                search: queryUrl.toString(),
                              });

                              setPatrimoniosSelecionados([{ term, type }]);
                            }}
                            className="flex whitespace-nowrap gap-2 h-8 capitalize cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs"
                          >
                            {term}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
            <ScrollBar className="pb-4 md:pb-0 md:hidden" orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
