import { createContext } from "react";

import { ItemsSelecionados, PatrimoniosSelecionados } from "../App";
import { CatalogResponseDTO } from "../components/item-page/item-page";

interface User {
  id: string; // corresponde a "id"
  institution_id: string; // corresponde a "institution_id"

  username: string; // corresponde a "username"
  email: string; // corresponde a "email"
  provider: string; // corresponde a "provider"

  linkedin: string; // corresponde a "linkedin"
  lattes_id: string; // corresponde a "lattes_id"
  orcid: string; // corresponde a "orcid"
  ramal: string; // corresponde a "ramal"

  photo_url: string; // corresponde a "photo_url"
  background_url: string; // corresponde a "background_url"

  matricula: string; // corresponde a "matricula"
  verify: boolean; // corresponde a "verify"

  roles: Role[]; // lista de papéis vinculados ao usuário

  system_identity: {
    id: string; // id do objeto system_identity
    legal_guardian: {
      id: string; // id do responsável legal
      legal_guardians_code: string; // código do responsável legal
      legal_guardians_name: string; // nome do responsável legal
    };
  };
}
interface Role {
  id: string;
  name: string;
  description: string;
}

interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface UserContextType {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  bens: CatalogResponseDTO[];
  setBens: React.Dispatch<React.SetStateAction<CatalogResponseDTO[]>>;

  role: string;
  setRole: React.Dispatch<React.SetStateAction<string>>;

  permission: Permission[];
  setPermission: React.Dispatch<React.SetStateAction<Permission[]>>;

  urlGeral: string;
  setUrlGeral: React.Dispatch<React.SetStateAction<string>>;

  timeLoggedIn: number;
  setTimeLoggedIn: React.Dispatch<React.SetStateAction<number>>;

  itemsSelecionados: ItemsSelecionados[];
  setItensSelecionados: React.Dispatch<
    React.SetStateAction<ItemsSelecionados[]>
  >;

  patrimoniosSelecionados: PatrimoniosSelecionados[];
  setPatrimoniosSelecionados: React.Dispatch<
    React.SetStateAction<PatrimoniosSelecionados[]>
  >;

  sessionExpMs: number | null;
  setSessionExpMs: React.Dispatch<React.SetStateAction<number | null>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;

  navCollapsedSize: number;
  setNavCollapsedSize: React.Dispatch<React.SetStateAction<number>>;

  defaultLayout: number[];
  setDefaultLayout: React.Dispatch<React.SetStateAction<number[]>>;

  searchType: string;
  setSearchType: React.Dispatch<React.SetStateAction<string>>;
}

export const UserContext = createContext<UserContextType>({
  loggedIn: false,
  setLoggedIn: () => {},

  timeLoggedIn: 0,
  setTimeLoggedIn: () => {},

  sessionExpMs: null,
  setSessionExpMs: () => {},

  user: {} as User,
  setUser: () => {},

  navCollapsedSize: 0,
  setNavCollapsedSize: () => {},

  isCollapsed: false,
  setIsCollapsed: () => {},

  searchType: "",
  setSearchType: () => {},

  itemsSelecionados: [],
  setItensSelecionados: () => {},

  patrimoniosSelecionados: [],
  setPatrimoniosSelecionados: () => {},

  defaultLayout: [],
  setDefaultLayout: () => {},

  urlGeral: "",
  setUrlGeral: () => {},

  role: "",
  setRole: () => {},

  permission: [],
  setPermission: () => {},

  bens: [],
  setBens: () => {},

  mode: "",
  setMode: () => {},
});
