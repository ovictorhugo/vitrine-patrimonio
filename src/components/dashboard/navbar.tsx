import { Cardholder, CurrencyCircleDollar, GearSix, HouseSimple, SlidersHorizontal, Table, Users } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/context";

export function Navbar() {
    const location = useLocation();
    const {user} = useContext(UserContext)
    return(
        <div className="h-full flex flex-col gap-3  w-[280px] pt-20 mr-8 static top-20 left-0">
           <Link to={'/dashboard'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/dashboard' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><HouseSimple size={16}/>Dashboard</Button></Link>
           {user.state == 'fumpista' && (<Link to={'/dashboard/debitos-pendentes'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/dashboard/debitos-pendentes' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><Cardholder size={16}/>Débidos pendentes</Button></Link>)}
           {(user.state == 'fumpista' || user.state == 'doador') && (<Link to={'/dashboard/pagamentos'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/dashboard/pagamentos' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><CurrencyCircleDollar size={16}/>Pagamentos</Button></Link>)}
           {user.state == 'fumpista' && (<Link to={'/dashboard/atualizar-dados'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/dashboard/atualizar-dados' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><Table size={16}/>Atualizar dados</Button></Link>)}
          

           {user.state == 'admin' && (<Link to={'/admin'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/admin' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><SlidersHorizontal size={16}/>Administrativo</Button></Link>)}
           {user.state == 'admin' && (<Link to={'/admin/gerenciar-usuarios'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/admin/gerenciar-usuarios' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><Users size={16}/>Gerenciar usuários</Button></Link>)}

           {(user.state == 'fumpista' || user.state == 'doador') && (<Link to={'/dashboard/configuracoes'} className="w-full"><Button className={`w-full h-14 justify-start px-6 ${location.pathname != '/dashboard/configuracoes' && ('bg bg-[#DDEBEB] hover:bg-[#BCD7D6] text-[#02A8A8]')}`}><GearSix size={16}/>Configurações</Button></Link>)}
        </div>
    )
}