import { createContext } from "react";
import { Item } from "../components/item-page/item-page";
import { ItemsSelecionados, PatrimoniosSelecionados } from "../App";

interface User {
  institution_id: string
  user_id: string
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
  visible:boolean
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


interface UserContextType {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

 
  bens: Item[] , 
  setBens: React.Dispatch<React.SetStateAction<Item[]>>,


  role:string, 
  setRole:React.Dispatch<React.SetStateAction<string>>;

  permission: Permission[] , 
  setPermission: React.Dispatch<React.SetStateAction<Permission[]>>,

  urlGeral: string,
  setUrlGeral: React.Dispatch<React.SetStateAction<string>>;

  itemsSelecionados: ItemsSelecionados[] , 
  setItensSelecionados: React.Dispatch<React.SetStateAction<ItemsSelecionados[]>>,

  patrimoniosSelecionados: PatrimoniosSelecionados[] , 
  setPatrimoniosSelecionados: React.Dispatch<React.SetStateAction<PatrimoniosSelecionados[]>>,

       
  isCollapsed:boolean, 
  setIsCollapsed:React.Dispatch<React.SetStateAction<boolean>>;
      mode:string, 
      setMode:React.Dispatch<React.SetStateAction<string>>;

      navCollapsedSize:number, 
      setNavCollapsedSize:React.Dispatch<React.SetStateAction<number>>;

      defaultLayout: number[];
  setDefaultLayout: React.Dispatch<React.SetStateAction<number[]>>;

  searchType: string,
  setSearchType: React.Dispatch<React.SetStateAction<string>>;


}

export const UserContext = createContext<UserContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
  
  user: {} as User,
  setUser: () => {},

  navCollapsedSize:0, 
  setNavCollapsedSize:() => {},

  isCollapsed:false, 
  setIsCollapsed:() => {},

  searchType: "",
  setSearchType: () => { },

  itemsSelecionados: [] , 
  setItensSelecionados: () => {},

  patrimoniosSelecionados: [] , 
  setPatrimoniosSelecionados: () => {},

  defaultLayout: [],
  setDefaultLayout:() => {},

  urlGeral: "",
setUrlGeral: () => {},


role:"", 
setRole:() => {},

permission:[] , 
setPermission: () => {},


bens:[] , 
setBens: () => {},

      mode:"", 
      setMode:() => {},
});
