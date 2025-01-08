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


interface User {
  user_id:string
  display_name:string
  email:string 
  uid:string
  photo_url:string
  roles:Roles[]
  linkedin:string
  phone:string
  shib_id:string
  provider:string
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


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User| null>(null);;
  const storedIsCollapsed = localStorage.getItem("isCollapsed");
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

  const [urlGeral, setUrlGeral] = useState('http://150.164.32.238:8484/');
  const [bens, setBens] = useState<Item[]>([]); 
  const [role, setRole] = useState('')
  const [permission , setPermission] = useState<Permission[]>([])
  const [itemsSelecionados , setItensSelecionados] = useState<ItemsSelecionados[]>([])

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
      itemsSelecionados , setItensSelecionados
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
        <Route path='/dashboard/todos-os-patrimonios' element={<Admin/>}/>
        <Route path='/dashboard/novo-item' element={<Admin/>}/>
        <Route path='/dashboard/desfazimento-bem' element={<Admin/>}/>
        <Route path='/dashboard/visao-sala' element={<Admin/>}/>
        <Route path='/dashboard/itens-vitrine' element={<Admin/>}/>
        <Route path='/dashboard/itens-desfazimento' element={<Admin/>}/>
        <Route path='/dashboard/empenhos' element={<Admin/>}/>
        <Route path='/dashboard/criar-etiqueta' element={<Admin/>}/>
        <Route path='/dashboard/painel' element={<Admin/>}/>
        <Route path='/dashboard/assinaturee' element={<Admin/>}/>



        <Route
        path='/signIn'
        element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />

        <Route
         path='/signUp'
         element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />



        
      </Routes>
      </LoadingWrapper>
      </DefaultLayout>
    </UserContext.Provider>
    </Router>
 
    </>
  )
}

export default App
