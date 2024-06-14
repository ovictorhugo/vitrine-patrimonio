import { LogoUfmgWhite } from "../svg/logo_ufmg_white";
import { LogoWhite } from "../svg/logo_white";
import bg1 from '../../assets/bg1.png';
import bg2 from '../../assets/bg2.png';
import { useEffect, useState } from "react";
import { useModalBackground } from "../hooks/use-modal-background";
import { Link } from "react-router-dom";
import { collection, getDocs, getFirestore } from 'firebase/firestore';

interface User {
  id:string
  imgURL:string
  titulo:string
}

export function Background1() {
    const { isOpen, type, onOpen } = useModalBackground();
    const isModalOpen = isOpen && type === '1'

    const backgroundImages = [
   
  
        bg2
        // Adicione mais URLs de imagens de fundo, se necessário
      ];

      const db = getFirestore();
      const [usersPhoto, setUsers] = useState<User[]>([]);
    
      useEffect(() => {
        

        const getRandomItems = (array:any, num:any) => {
            const shuffled = [...array].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
          };

          const fetchUsers = async () => {
            try {
              const usersRef = collection(db, 'background');
              const querySnapshot = await getDocs(usersRef);
              const usersList = querySnapshot.docs.map(doc => doc.data() as User);
              const randomUsers = getRandomItems(usersList, 1);
              setUsers(randomUsers);
            } catch (err) {
              console.log(err);
            }
          };
    
        fetchUsers();
      }, []);

      console.log(usersPhoto)
    
      //background
      const [backgroundImage, setBackgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });
    return(
       <>
       {isModalOpen && (
        usersPhoto.map((user) => {
          return(
            <div className="w-full md:h-screen h-full  bg-cover bg-center bg-no-repeat  bg-[#00A19B] absolute top-0 left-0" style={{ backgroundImage: `url(${user.imgURL})` }}>
          <div className="h-20 flex items-center px-16 gap-4 z-[2] w-fit relative">
               <Link to={'/'} className="h-6">
                   <LogoWhite/>
               </Link>
  
               <div className="h-6 w-[1px] bg-white"></div>
  
               <div className="h-6">
                   <LogoUfmgWhite/>
               </div>
           </div>
   </div>
          )
        })
       )}
       </>
    )
}