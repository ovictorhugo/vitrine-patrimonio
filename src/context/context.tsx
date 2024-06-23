import { createContext } from "react";
import { User as FirebaseAuthUser } from 'firebase/auth';

interface User extends FirebaseAuthUser {
  photoURL:string
  cpf_aluno: string
  datnsc_aluno:string
  state: string
}

interface UserContextType {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  login: (user: User) => void; // Função de login
  logout: () => void; // Função de logout

  urlGeral: string,
  setUrlGeral: React.Dispatch<React.SetStateAction<string>>;

       
  isCollapsed:boolean, 
  setIsCollapsed:React.Dispatch<React.SetStateAction<boolean>>;
      mode:string, 
      setMode:React.Dispatch<React.SetStateAction<string>>;

      navCollapsedSize:number, 
      setNavCollapsedSize:React.Dispatch<React.SetStateAction<number>>;

      defaultLayout: number[];
  setDefaultLayout: React.Dispatch<React.SetStateAction<number[]>>;

}

export const UserContext = createContext<UserContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
  user: {} as User,
  setUser: () => {},
  login: () => {}, // Definindo uma função vazia como padrão
  logout: () => {}, // Definindo uma função vazia como padrão

  navCollapsedSize:0, 
  setNavCollapsedSize:() => {},

  isCollapsed:false, 
  setIsCollapsed:() => {},

  defaultLayout: [],
  setDefaultLayout:() => {},

  urlGeral: "",
setUrlGeral: () => {},

      mode:"", 
      setMode:() => {},
});
