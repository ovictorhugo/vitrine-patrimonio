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
import { Item } from './components/item-page/item-page';
import { AuthenticationToken } from './pages/Authentication-token';


interface User {
  institution_id: string
  user_id: string
  visible:boolean
  gp_count:number
  dp_count:number

  username: string

  photo_url: string
  background_url:string

  dep_id: string

  email: string
  linkedin: string
  lattes_id: string
  registration: string
  orcid:string
  ramal:string
  number:string

  roles: Roles[]

  provider: string
  verify: boolean
}

interface Roles {
  id:string
  role_id:string
}

interface Permission {
  permission:string
  id:string
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
  const [bens, setBens] = useState<Item[]>([]); 
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
      <DefaultLayout>
      <LoadingWrapper>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/buscar-patrimonio' element={<Home/>}/>
        <Route path='/item' element={<Home/>}/>
        <Route path='/join-room' element={<Notification/>}/>
        <Route path='/dashboard' element={<Admin/>}/>
        <Route path='/dashboard/administrativo' element={<Admin/>}/>
        <Route path='/dashboard/patrimonios' element={<Admin/>}/>
        <Route path='/dashboard/novo-item' element={<Admin/>}/>
        <Route path='/dashboard/desfazimento-bem' element={<Admin/>}/>
        <Route path='/dashboard/visao-sala' element={<Admin/>}/>
        <Route path='/dashboard/itens-vitrine' element={<Admin/>}/>
        <Route path='/dashboard/itens-desfazimento' element={<Admin/>}/>
        <Route path='/dashboard/transferencias' element={<Admin/>}/>
        <Route path='/dashboard/editar-item' element={<Admin/>}/>


        <Route path='/dashboard/empenhos' element={<Admin/>}/>
        <Route path='/dashboard/criar-etiqueta' element={<Admin/>}/>
        <Route path='/dashboard/painel' element={<Admin/>}/>
        <Route path='/dashboard/assinaturee' element={<Admin/>}/>



        <Route
        path='/signIn'
        element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />

    <Route path='/authentication' element={<AuthenticationToken />} />



        
      </Routes>
      </LoadingWrapper>
      </DefaultLayout>
    </UserContext.Provider>
    </Router>
 
    </>
  )
}

export default App
