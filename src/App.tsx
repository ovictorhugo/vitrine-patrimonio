import { useEffect, useState } from 'react'
import { Home } from './pages/Home'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, } from 'react-router-dom';

import  { UserContext }  from '../src/context/context'

import {User as FirebaseAuthUser} from 'firebase/auth'
import DefaultLayout from './layout/default-layout';
import { Authentication } from './pages/Authentication';
import { Admin } from './pages/Admin';
import { Donation } from './pages/Donation';
import { Fumpista } from './pages/Fumpista';
import { useModalBackground } from './components/hooks/use-modal-background';
import { Notification } from './pages/notification';


interface User extends FirebaseAuthUser {
  photoURL:string
  cpf_aluno: string
  datnsc_aluno:string
  state: string
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User>({  photoURL: '', cpf_aluno: '', datnsc_aluno: '', state: '' ,...{} } as User);
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [navCollapsedSize, setNavCollapsedSize] = useState(0)
  const [defaultLayout, setDefaultLayout] = useState([0,440,655])
  const [mode, setMode] = useState('user')

  const [urlGeral, setUrlGeral] = useState('http://150.164.32.238:8484/');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      // Se as informações do usuário forem encontradas no armazenamento local, defina o usuário e marque como autenticado
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    }
  }, []);

  // Função para fazer login
  const login = (user: User) => {
    setUser(user);
    setLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(user)); // Armazenar informações do usuário no localStorage
  };

  // Função para fazer logout
  const logout = () => {
    setUser({ photoURL: '', cpf_aluno: '', datnsc_aluno: '', state: '' } as User);
    setLoggedIn(false);
    localStorage.removeItem('user'); // Remover informações do usuário do localStorage ao fazer logout
  };


  return (
    <>
    <Router>
    <UserContext.Provider 
    value={{
      loggedIn, setLoggedIn,
      user, setUser,
      login, // Passar a função de login para o contexto do usuário
      logout, // Passar a função de logout para o contexto do usuário
      isCollapsed, setIsCollapsed,
      mode, setMode,
      urlGeral, setUrlGeral,
      navCollapsedSize, setNavCollapsedSize,
      defaultLayout, setDefaultLayout
    }}
    >
      <DefaultLayout>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/buscar-patrimonio' element={<Home/>}/>
        <Route path='/join-room' element={<Notification/>}/>

        <Route path='/dashboard' element={<Admin/>}/>
        <Route path='/todos-os-patrimonios' element={<Admin/>}/>
        <Route path='/novo-item' element={<Admin/>}/>
        <Route path='/visao-sala' element={<Admin/>}/>
        <Route path='/itens-vitrine' element={<Admin/>}/>
        <Route path='/empenhos' element={<Admin/>}/>
        <Route path='/criar-etiqueta' element={<Admin/>}/>
        <Route path='/painel' element={<Admin/>}/>


        <Route path='/doacao/:pagina?' element={<Donation/>}/>
        <Route path='/doacao/pagamento/:pagina?' element={<Donation/>}/>

        <Route path='/fumpista/:pagina?' element={<Fumpista/>}/>

        <Route
        path='/signIn'
        element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />

        <Route
         path='/signUp'
         element={loggedIn == false ? <Authentication/> : <Navigate to='/' />}
        />

    <Route
          path='/admin/:pagina?'
          element={(user.state == 'admin' || user.state == 'colaborator' || user.state == 'master')  ? <Admin/> : <Navigate to='/' />}
        />


        
      </Routes>
      </DefaultLayout>
    </UserContext.Provider>
    </Router>
 
    </>
  )
}

export default App
