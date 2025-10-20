import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, } from 'react-router-dom';

import  { UserContext }  from '../src/context/context'

import {User as FirebaseAuthUser} from 'firebase/auth'
import DefaultLayout from './layout/default-layout';
import { Authentication } from './pages/Authentication';
import { Admin } from './pages/Admin';


import { Notification } from './pages/notification';
import LoadingWrapper from './components/loading';

import { AuthenticationToken } from './pages/Authentication-token';
import { FavoriteProvider } from './context/favorite-context';
import { CatalogResponseDTO } from './components/item-page/item-page';
import ProtectedRoute from './components/ProtectedRoute';
import { Unauthorized } from './components/errors/Unauthorized';
import { Error404 } from './components/errors/404';



interface User {
  id: string;                // corresponde a "id"
  institution_id: string;    // corresponde a "institution_id"

  username: string;          // corresponde a "username"
  email: string;             // corresponde a "email"
  provider: string;          // corresponde a "provider"

  linkedin: string;          // corresponde a "linkedin"
  lattes_id: string;         // corresponde a "lattes_id"
  orcid: string;             // corresponde a "orcid"
  ramal: string;             // corresponde a "ramal"

  photo_url: string;         // corresponde a "photo_url"
  background_url: string;    // corresponde a "background_url"

  matricula: string;         // corresponde a "matricula"
  verify: boolean;           // corresponde a "verify"

  roles: Role[];             // lista de papéis vinculados ao usuário

  system_identity: {
    id: string;              // id do objeto system_identity
    legal_guardian: {
      id: string;                    // id do responsável legal
      legal_guardians_code: string;  // código do responsável legal
      legal_guardians_name: string;  // nome do responsável legal
    };
  };
}
interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id:string
  name:string
  code:string
  description:string
}


export interface ItemsSelecionados {
  term:string
}

export interface PatrimoniosSelecionados {
  term:string
  type:string
}



function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User| null>(null);;
  const storedIsCollapsed = localStorage.getItem("isCollapsed");
  const [searchType, setSearchType] = useState('cod');
  const [isCollapsed, setIsCollapsed] = useState(
    storedIsCollapsed ? JSON.parse(storedIsCollapsed) : true
  );
  
  useEffect(() => {
    // Salva o estado de isCollapsed no localStorage sempre que ele mudar
    localStorage.setItem("isCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const [navCollapsedSize, setNavCollapsedSize] = useState(0)
  const [defaultLayout, setDefaultLayout] = useState([0,440,655])
  const [mode, setMode] = useState('user')

  const [urlGeral, setUrlGeral] = useState(import.meta.env.VITE_BACKEND_URL || '');
  const [bens, setBens] = useState<CatalogResponseDTO[]>([]); 
  const [role, setRole] = useState('')
  const [permission , setPermission] = useState<Permission[]>([])
  const [itemsSelecionados , setItensSelecionados] = useState<ItemsSelecionados[]>([])
  const [patrimoniosSelecionados , setPatrimoniosSelecionados] = useState<PatrimoniosSelecionados[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem('permission');

    if (storedUser) {
      // Se as informações do usuário forem encontradas no armazenamento local, defina o usuário e marque como autenticado
      setPermission(JSON.parse(storedUser));

    }
  }, []);



  //PERMISSÕES
   const hasCriarEtiqueta = permission.some(
    (p) => p.code === "CRIAR_ETIQUETA"
  );


  return (
    <>
    <Router>
    <UserContext.Provider 
    value={{
      loggedIn, setLoggedIn,
      user, setUser,
      isCollapsed, setIsCollapsed,
      mode, setMode,
      urlGeral, setUrlGeral,
      navCollapsedSize, setNavCollapsedSize,
      defaultLayout, setDefaultLayout,
      role, setRole,
      permission , setPermission,
      bens, setBens,
      itemsSelecionados , setItensSelecionados,
      patrimoniosSelecionados , setPatrimoniosSelecionados,
      searchType, setSearchType
    }}
    >
               <FavoriteProvider>
      <DefaultLayout>
      <LoadingWrapper>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/buscar-patrimonio' element={<Home/>}/>
        <Route path='/item' element={<Home/>}/>
     <Route path='/informacoes' element={<Home/>}/>
        <Route path='/dashboard' element={<Admin/>}/>
        <Route path='/dashboard/administrativo' element={<Admin/>}/>
        <Route path='/dashboard/patrimonios' element={<Admin/>}/>
       
        <Route path='/dashboard/desfazimento-bem' element={<Admin/>}/>
        <Route path='/dashboard/sala' element={<Admin/>}/>
        <Route path='/dashboard/itens-vitrine' element={<Admin/>}/>
        <Route path='/dashboard/itens-desfazimento' element={<Admin/>}/>
        <Route path='/dashboard/transferencias' element={<Admin/>}/>
        <Route path='/dashboard/editar-item' element={<Admin/>}/>
           <Route path='/dashboard/inventario' element={<Admin/>}/>

    <Route path='/dashboard/cargos-funcoes' element={<Admin/>}/>
        <Route path='/dashboard/desfazimento' element={<Admin/>}/>



        <Route path='/dashboard/empenhos' element={<Admin/>}/>
     
        <Route path='/dashboard/painel' element={<Admin/>}/>
        <Route path='/dashboard/assinaturee' element={<Admin/>}/>

   <Route path='/dashboard/departamento' element={<Admin/>}/>

 <Route path='/termo-uso' element={<Admin/>}/>
  <Route path='/politica-privacidade' element={<Admin/>}/>

        <Route
        path='/signIn'
        element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />

    <Route path='/authentication' element={<AuthenticationToken />} />
   

        <Route path="/dashboard/criar-etiqueta" element={
           <ProtectedRoute
            element={<Admin />}
            hasPermission={hasCriarEtiqueta}
        />
        } />
    

    <Route path='/dashboard/novo-item' element={<Admin/>}/>
    <Route path='/dashboard/criar-patrimonio-temporario' element={<Admin/>}/>
            <Route path='/dashboard/patrimonio-temporario' element={<Admin/>}/>
       <Route path='/dashboard/movimentacao' element={<Admin/>}/>
        <Route path='/dashboard/busca-avancada' element={<Admin/>}/>
    <Route path='/dashboard/comissao-permanente' element={<Admin/>}/>
    <Route path='/dashboard/alienacao' element={<Admin/>}/>



                                    <Route path='/unauthorized' element={<Unauthorized />} />

                                    <Route path='*' element={<Error404 />} />

      </Routes>
      </LoadingWrapper>
      </DefaultLayout>
      </FavoriteProvider>
    </UserContext.Provider>
    </Router>
 
    </>
  )
}

export default App
