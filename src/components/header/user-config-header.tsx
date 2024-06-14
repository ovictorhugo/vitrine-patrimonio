import { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { UserContext } from "../../context/context";


import { auth } from "../../lib/firebase";
import { User as FirebaseAuthUser} from 'firebase/auth'


interface User extends FirebaseAuthUser {
    img_url: string;
    state: string;
    name: string
    email: string
    institution_id: string
  }

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut
  } from "../../components/ui/dropdown-menu"
import { ChevronDown, LogOut } from "lucide-react";
  
import { cn } from "../../lib"

export function UserConfigHeader() {
    const { user, setLoggedIn, setUser, isCollapsed } = useContext(UserContext);

   
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setLoggedIn(false);
      setUser({ img_url: '', state: '', name: '', email: '', institution_id: '',...{} } as User); // Assuming you have a setUser function to update the user context

     // Remove user information from local storage
    localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
   
    return(
    
      <DropdownMenu>
      <div className="w-full  gap-3 flex items-center ">
      <DropdownMenuTrigger className="w-full flex-1 items-center flex justify-center">
          <div className={cn(
        "flex items-center w-full gap-2 px-2 ",
        isCollapsed &&
          "flex h-9 w-9 shrink-0 items-center justify-center p-0 "
      )}> 
      
      <Avatar className="cursor-pointer rounded-md w-fit">
      <AvatarImage  className={'rounded-md h-[36px] w-[36px]'} src={`${user.photoURL != null ? (user.photoURL):(user.img_url)}`} />
      <AvatarFallback className="flex items-center justify-center"></AvatarFallback>
  </Avatar>

         
              {!isCollapsed && (
              <div className="flex gap-3 items-center text-sm font-medium ">
                  
                  <p className="text-sm font-medium w-full text-left">{user.displayName}</p>
       

          <ChevronDown size={16}/>

              </div>
           )}
           
          
      </div>
      
      </DropdownMenuTrigger>

   

      </div>

      <DropdownMenuContent>
  <DropdownMenuLabel>My Account</DropdownMenuLabel>
  <DropdownMenuSeparator />
  <DropdownMenuItem>Profile</DropdownMenuItem>
  <DropdownMenuItem>Billing</DropdownMenuItem>
  <DropdownMenuItem>Team</DropdownMenuItem>
  <DropdownMenuItem>Subscription</DropdownMenuItem>
</DropdownMenuContent>


  
  </DropdownMenu>

     
    )
}